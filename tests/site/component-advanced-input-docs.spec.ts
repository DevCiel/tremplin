import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

type Runtime={
  Datepicker:{getOrCreateInstance(el:Element):{show():Promise<void>;hide():Promise<void>;getSelectedDates():string[];setSelectedDates(dates:string[]):void;dispose():void}},
  OtpInput:{getOrCreateInstance(el:Element):{getValue():string;setValue(value:string):void;clear():void;dispose():void}},
  Range:{getOrCreateInstance(el:Element):{update():void;dispose():void}},
  Strength:{getOrCreateInstance(el:Element):{getStrength():string|null;evaluate():void;dispose():void}}
}
test.use({reducedMotion:'reduce'})
const errors=new WeakMap<Page,string[]>()
test.beforeEach(({page})=>{const list:string[]=[];errors.set(page,list);page.on('pageerror',e=>list.push(e.message))})
test.afterEach(({page})=>{expect(errors.get(page)).toEqual([])})
const audit=async(page:Page)=>expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze()).violations).toEqual([])
for(const topic of ['datepicker','otp-input','range','strength'])for(const theme of ['light','dark'])for(const dir of ['ltr','rtl'])for(const section of ['components','forms'])test(`${topic} ${theme}/${dir}: ${section} desktop/mobile WCAG and layout`,async({page})=>{
    await page.setViewportSize({width:1280,height:900});await page.goto('/'+section+'/'+(section==='forms'&&topic==='strength'?'password-strength':topic)+'/')
    await page.locator('html').evaluate((el,s)=>{el.setAttribute('dir',s.dir);el.setAttribute('data-trm-theme',s.theme)},{theme,dir})
    await expect(page.locator('head link[href*="tremplin-extensions"]')).toHaveCount(0);await expect(page.locator('.docs-example').first()).toBeVisible();await audit(page)
    if(topic==='datepicker'){
      await page.locator('.docs-example').first().locator('input[data-trm-toggle="datepicker"]').click()
      const popup=page.locator('[data-vc="calendar"][data-vc-input]');await expect(popup).toBeVisible();await expect(popup).toHaveAttribute('data-trm-theme',theme);await audit(page)
      await page.locator('h1').click();await expect(popup).toHaveAttribute('aria-hidden','true')
    }
    await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await audit(page)
    for(const box of await page.locator('.docs-example').all())expect(await box.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true)
})
test('Datepicker click selection, copied dates, API versus typed-value behavior and inline ISO submission',async({page})=>{
  await page.goto('/components/datepicker/');const input=page.locator('#deadline');await input.click();const popup=page.locator('[data-vc="calendar"][data-vc-input]')
  const day=popup.locator('[data-vc-date="2026-10-16"] [data-vc-date-btn]');await day.focus();await page.keyboard.press('Enter');await expect(popup).toHaveAttribute('aria-hidden','true')
  const state=await page.evaluate(()=>{
    const root=document.querySelector('#deadline')!,picker=(window as unknown as {TremplinFramework:Runtime}).TremplinFramework.Datepicker.getOrCreateInstance(root),copy=picker.getSelectedDates();copy.push('external')
    let changes=0;root.addEventListener('change.trm.datepicker',()=>changes++);picker.setSelectedDates(['2026-10-18']);(root as HTMLInputElement).value='not a date'
    return {dates:picker.getSelectedDates(),changes,inline:[...new FormData(document.querySelector('#inline-date-form') as HTMLFormElement).entries()]}
  })
  expect(state).toEqual({dates:['2026-10-18'],changes:0,inline:[['selected-date','2026-10-15']]})
})
test('Datepicker cancellation, bounds, theme and real multi-month scroll owner',async({page,request})=>{
  await page.goto('/components/datepicker/')
  const state=await page.evaluate(async()=>{
    const root=document.querySelector('#deadline')!,picker=(window as unknown as {TremplinFramework:Runtime}).TremplinFramework.Datepicker.getOrCreateInstance(root),stop=(e:Event)=>e.preventDefault()
    root.addEventListener('show.trm.datepicker',stop);await picker.show();const visible=!!document.querySelector('[data-vc-input]:not([data-vc-calendar-hidden])');root.removeEventListener('show.trm.datepicker',stop)
    return visible
  });expect(state).toBe(false)
  await page.locator('#guide-window').click();const popup=page.locator('[data-vc="calendar"][data-vc-input]:not([data-vc-calendar-hidden])')
  await expect(popup.locator('[data-vc-date="2026-10-09"] [data-vc-date-btn]')).toBeDisabled();await expect(popup.locator('[data-vc-date="2026-10-15"] [data-vc-date-btn]')).toBeEnabled();await page.locator('h1').click()
  const asset=await request.get('/icons/datepicker-chevron.svg');expect(asset.status()).toBe(200)
  await page.setViewportSize({width:390,height:844});const region=page.getByRole('region',{name:'Two-month calendar',exact:true});await expect(region).toHaveCSS('overflow-x','auto');await region.scrollIntoViewIfNeeded();await region.focus();await expect(region).toBeFocused();await page.keyboard.press('ArrowRight');await expect.poll(()=>region.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0)
})
test('OTP paste sanitizes before truncation, native value submission and ASCII types',async({page})=>{
  await page.goto('/components/otp-input/');await expect(page.locator('main table code').filter({hasText:/^complete\.trm\.otpInput$/})).toHaveCount(1);const input=page.locator('#otp-example-code');await input.focus()
  const payload=await input.evaluate(el=>{const data=new DataTransfer();data.setData('text','12 34');const event=new ClipboardEvent('paste',{bubbles:true,cancelable:true});Object.defineProperty(event,'clipboardData',{value:data});el.dispatchEvent(event);return event.clipboardData?.getData('text')})
  expect(payload).toBe('12 34')
  await expect(input).toHaveValue('1234');await expect(page.locator('#otp-example .otp-slot-filled')).toHaveCount(4);await expect(page.locator('#otp-example .otp-slots')).toHaveAttribute('aria-hidden','true')
  await page.locator('#grouped-code-code').fill('AB12cd');await expect(page.locator('#grouped-code .otp-separator')).toHaveCount(1);await page.locator('#alpha-code-code').fill('a1B2');await expect(page.locator('#alpha-code-code')).toHaveValue('aB')
  await expect(page.locator('#masked-code-code')).toHaveAttribute('type','text');await expect(page.locator('#masked-code .otp-slot').first()).toHaveText('•')
})
test('OTP repeated complete events, silent programmatic input paths and partial disposal',async({page})=>{
  await page.goto('/components/otp-input/')
  const state=await page.evaluate(()=>{
    const root=document.querySelector('#otp-example')!,otp=(window as unknown as {TremplinFramework:Runtime}).TremplinFramework.OtpInput.getOrCreateInstance(root);let inputs=0,complete=0
    root.addEventListener('input.trm.otpInput',()=>inputs++);root.addEventListener('complete.trm.otpInput',()=>complete++)
    otp.setValue('1234');otp.setValue('1234');otp.clear();const focus=document.activeElement===root.querySelector('input');otp.dispose()
    const input=root.querySelector('input')!;return {inputs,complete,focus,slots:root.querySelectorAll('.otp-slot').length,type:input.type,pattern:input.pattern,retainsClass:input.classList.contains('otp-input')}
  });expect(state).toEqual({inputs:0,complete:2,focus:true,slots:0,type:'text',pattern:'[0-9]*',retainsClass:true})
})
test('OTP native readonly/disabled and documented physical RTL pointer limitation',async({page})=>{
  await page.goto('/components/otp-input/');await expect(page.locator('#readonly-code-code')).toHaveAttribute('readonly','');await expect(page.locator('#disabled-code-code')).toBeDisabled()
  const input=page.locator('#rtl-code-code');await input.fill('1234');await input.scrollIntoViewIfNeeded();const last=await page.locator('#rtl-code .otp-slot').last().boundingBox();expect(last).not.toBeNull();await page.mouse.click(last!.x+last!.width/2,last!.y+last!.height/2)
  expect(await input.evaluate(el=>(el as HTMLInputElement).selectionStart)).toBe(0)
})
test('Range native keyboard, custom bubble, copied local set/update and FormData',async({page})=>{
  await page.goto('/components/range/');const input=page.locator('#volume');await input.focus();await page.keyboard.press('ArrowRight');await expect(input).toHaveValue('45')
  await expect(page.locator('#formatted-range-range .tooltip-inner')).toHaveText('40%');await expect(page.locator('#fractional-range-range .form-range-bubble')).toHaveCount(0)
  await page.getByRole('button',{name:'Set demo value to 75',exact:true}).click();await expect(page.locator('#submitted-range')).toHaveValue('75');await expect(page.locator('#submitted-range-range .tooltip-inner')).toHaveText('75')
  expect(await page.locator('#submitted-range-form').evaluate(el=>[...new FormData(el as HTMLFormElement).entries()])).toEqual([['volume','75']])
  await expect(page.locator('#range-disabled')).toBeDisabled();await expect(page.locator('#range-rating-range .form-range-tick-label')).toHaveText(['Low','Middle','High'])
})
test('Range update notifications, fill ratio and disposal leave native input usable',async({page})=>{
  await page.goto('/components/range/')
  const state=await page.evaluate(()=>{
    const root=document.querySelector('#volume-range')!,input=root.querySelector('input')!,range=(window as unknown as {TremplinFramework:Runtime}).TremplinFramework.Range.getOrCreateInstance(root);let changed=0
    input.addEventListener('changed.trm.range',event=>{changed++;event.preventDefault()});input.value='75';range.update();range.update();const fill=(root as HTMLElement).style.getPropertyValue('--trm-range-fill');range.dispose()
    return {changed,fill,decorations:root.querySelectorAll('.form-range-bubble,.form-range-ticks').length,stillInput:input.type,value:input.value,remainingFill:(root as HTMLElement).style.getPropertyValue('--trm-range-fill')}
  });expect(state).toEqual({changed:2,fill:'0.75',decorations:0,stillInput:'range',value:'75',remainingFill:'0.75'})
})
test('Strength updates only on level change, redacts payload, custom scorer and actual bar CSS',async({page})=>{
  await page.goto('/components/strength/');await expect(page.locator('#strength-password-strength .active')).toHaveCount(4)
  await page.locator('#empty-password-strength').evaluate(el=>{el.addEventListener('strengthChange.trm.strength',event=>{const e=event as Event&{score:number;password:string};el.setAttribute('data-test-score',String(e.score));el.setAttribute('data-test-password',e.password)})})
  const input=page.locator('#empty-password');await input.fill('Ab1');await expect(page.locator('#empty-password-feedback')).toHaveText('Fair');await expect(page.locator('#empty-password-strength')).toHaveAttribute('data-test-score','3')
  await input.fill('Ab1!');await expect(page.locator('#empty-password-strength')).toHaveAttribute('data-test-score','3');await expect(page.locator('#empty-password-strength')).toHaveAttribute('data-test-password','***')
  await input.fill('');await expect(page.locator('#empty-password-feedback')).toBeEmpty();await expect(page.locator('#empty-password-strength')).toHaveAttribute('data-test-password','')
  await page.locator('#custom-password').fill('LongSyntheticPassword');await expect(page.locator('#custom-password-feedback')).toHaveText('Demo: 12 or more characters')
  await page.locator('#bar-password').fill('a');expect(await page.locator('#bar-password-strength').evaluate(el=>getComputedStyle(el).getPropertyValue('--trm-strength-width').trim())).toBe('25%')
})
test('Strength evaluate/dispose retain advisory DOM without a numeric ARIA meter',async({page})=>{
  await page.goto('/components/strength/')
  const state=await page.evaluate(()=>{
    const root=document.querySelector('#password-strength')!,input=document.querySelector('#password') as HTMLInputElement,meter=(window as unknown as {TremplinFramework:Runtime}).TremplinFramework.Strength.getOrCreateInstance(root)
    input.value='a';meter.evaluate();const level=meter.getStrength();meter.dispose();input.value='LongSynthetic123!!';input.dispatchEvent(new Event('input',{bubbles:true}))
    return {level,remaining:root.getAttribute('data-trm-strength'),count:root.querySelectorAll('.active').length}
  });expect(state).toEqual({level:'weak',remaining:'weak',count:1});await expect(page.locator('.docs-example [role="meter"],.docs-example [role="progressbar"]')).toHaveCount(0)
})
