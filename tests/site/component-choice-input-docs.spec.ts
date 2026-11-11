import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

type ChoiceRuntime={Chips:{getOrCreateInstance(el:Element):{add(value:string):void;remove(chip:Element):void;getValues():string[];clear():void}},Combobox:{getOrCreateInstance(el:Element):{show():Promise<void>}}}
test.use({reducedMotion:'reduce'})
const errors=new WeakMap<Page,string[]>()
test.beforeEach(({page})=>{const list:string[]=[];errors.set(page,list);page.on('pageerror',e=>list.push(e.message))})
test.afterEach(({page})=>{expect(errors.get(page)).toEqual([])})
const audit=async(page:Page)=>expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze()).violations).toEqual([])
for(const topic of ['chips','combobox'])for(const theme of ['light','dark'])for(const dir of ['ltr','rtl'])test(`${topic} ${theme}/${dir}: component and forms guide desktop/mobile WCAG and geometry`,async({page})=>{
  for(const section of ['components','forms']){
    await page.setViewportSize({width:1280,height:900});await page.goto('/'+section+'/'+topic+'/')
    await page.locator('html').evaluate((el,state)=>{el.setAttribute('dir',state.dir);el.setAttribute('data-trm-theme',state.theme)},{dir,theme})
    await expect(page.locator('head link[href*="tremplin-extensions"]')).toHaveCount(0)
    await expect(page.locator('.docs-example').first()).toBeVisible();await audit(page)
    if(topic==='combobox'){
      const trigger=page.locator('.docs-example').first().getByRole('combobox');await trigger.click()
      await expect(page.locator('.docs-example').first().getByRole('searchbox')).toBeFocused();await audit(page)
      await page.keyboard.press('Escape')
    }
    await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await audit(page)
  }
})
test('Chips keyboard selection, focus styling, escape and physical RTL order',async({page})=>{
  await page.goto('/components/chips/');const input=page.locator('#tags-input'),chips=page.locator('#tags > .chip')
  await input.fill('Testing');await input.press('Enter');await expect(chips).toHaveCount(2)
  await input.press('Backspace');await expect(chips.last()).toBeFocused();await expect(chips.last()).toHaveClass(/active/)
  await expect(chips.last()).toHaveCSS('outline-style','solid');await page.keyboard.press('Escape');await expect(input).toBeFocused()
  await input.fill('Discard');await input.press('Escape');await expect(input).toHaveValue('');await expect(input).not.toBeFocused();await expect(chips).toHaveCount(2)
  await page.locator('html').evaluate(el=>el.setAttribute('dir','rtl'));await chips.first().focus();await page.keyboard.press('ArrowRight');await expect(chips.last()).toBeFocused()
  await page.keyboard.press('Delete');await expect(chips).toHaveCount(1)
})
test('Chips limits, duplicates, copied arrays, vetoes and explicit clear behavior',async({page})=>{
  await page.goto('/components/chips/')
  const result=await page.evaluate(()=>{
    const root=document.querySelector('#tags')!,instance=(window as unknown as {TremplinFramework:ChoiceRuntime}).TremplinFramework.Chips.getOrCreateInstance(root)
    const stop=(event:Event)=>event.preventDefault();root.addEventListener('remove.trm.chips',stop)
    instance.add('One');instance.add('One');instance.add('one')
    const copy=instance.getValues();copy.push('external');instance.remove(root.querySelector('.chip')!)
    const retained=instance.getValues();instance.clear();const cleared=instance.getValues();root.removeEventListener('remove.trm.chips',stop)
    return {retained,cleared}
  })
  expect(result).toEqual({retained:['Design','One','one'],cleared:[]})
  const limit=page.locator('#technologies-input');for(const value of ['A','B','C']){await limit.fill(value);await limit.press('Enter')}
  await expect(page.locator('#technologies > .chip')).toHaveCount(3);await expect(limit).toHaveValue('')
  const duplicate=page.locator('#duplicate-tags-input');for(let i=0;i<2;i++){await duplicate.fill('Design');await duplicate.press('Enter')}
  await expect(page.locator('#duplicate-tags > .chip')).toHaveCount(3)
  const icon=page.locator('#custom-icon-tags-input');await icon.fill('<img src=x>');await icon.press('Enter');await expect(page.locator('#custom-icon-tags img')).toHaveCount(0);await expect(page.locator('#custom-icon-tags .chip-dismiss svg')).toHaveCount(1)
})
test('Chips application-owned hidden JSON is the only submitted collection',async({page})=>{
  for(const section of ['components','forms']){
    await page.goto('/'+section+'/chips/');const id=section==='forms'?'forms-submitted-tags':'submitted-tags',form=page.locator('#'+id+'-form')
    await form.locator('.form-ghost').fill('Build');await form.locator('.form-ghost').press('Enter')
    await expect(form.getByRole('status')).toHaveText('Current values: Design, Build. Hidden JSON updated.')
    expect(await form.evaluate(el=>[...new FormData(el as HTMLFormElement).entries()])).toEqual([['project-tags','["Design","Build"]']])
  }
  await page.goto('/components/chips/');await expect(page.locator('#disabled-tags-input')).toBeDisabled()
})
test('Combobox native option focus, local filtering and preselected values',async({page})=>{
  await page.goto('/components/combobox/');await expect(page.locator('#selected-city .combobox-value')).toHaveText('London')
  await page.locator('#guide-city').click();const search=page.locator('#guide-city-menu input');await expect(search).toBeFocused();await search.fill('Lis')
  await search.press('ArrowDown');const option=page.locator('#guide-city-menu [data-trm-value="lis"]');await expect(option).toBeFocused();await option.press('Enter')
  await expect(page.locator('#guide-city')).toBeFocused();await expect(page.locator('input[name="guide-city"]')).toHaveValue('lis')
  await page.locator('#normalized-city').click();await page.locator('#normalized-city-menu input').fill('Sao');await expect(page.locator('#normalized-city-menu [role="option"]:visible')).toHaveText(['São Paulo'])
  await page.keyboard.press('Escape');await page.locator('#grouped-plan').click();await page.locator('#grouped-plan-menu input').fill('growing');await page.locator('#grouped-plan-menu [data-trm-value="pro"]').click();await expect(page.locator('#grouped-plan .combobox-value')).toHaveText('Professional')
})
test('Combobox disabled matches, no results and comma-separated multiple submission',async({page})=>{
  await page.goto('/components/combobox/');await page.locator('#guide-plan').click();const search=page.locator('#guide-plan-menu input');await search.fill('Enterprise')
  await expect(page.locator('#guide-plan-menu [role="option"]:visible')).toBeDisabled();await expect(page.locator('#guide-plan-menu .combobox-no-results')).toBeHidden();await search.press('ArrowDown');await expect(search).toBeFocused()
  await search.fill('absent-query');await expect(page.locator('#guide-plan-menu .combobox-no-results')).toBeVisible();await page.keyboard.press('Escape')
  await page.locator('#guide-offices').click();for(const value of ['par','lon'])await page.locator('#guide-offices-menu [data-trm-value="'+value+'"]').click()
  await expect(page.locator('#guide-offices .combobox-value')).toHaveText('2 selected');await expect(page.locator('input[name="guide-offices"]')).toHaveValue('par,lon')
  await expect(page.locator('#disabled-city')).toBeDisabled();await expect(page.locator('input[name="disabled-city"]')).toBeEnabled()
  await page.goto('/forms/combobox/');expect(await page.locator('input[name="forms-combo-offices"]').inputValue()).toBe('lon')
})
test('Combobox immediate notification is not Menu completion and change is post-mutation',async({page})=>{
  await page.goto('/components/combobox/')
  const result=await page.evaluate(async()=>{
    const root=document.querySelector('#city')!,combo=(window as unknown as {TremplinFramework:ChoiceRuntime}).TremplinFramework.Combobox.getOrCreateInstance(root),events:string[]=[]
    const veto=(event:Event)=>event.preventDefault();root.addEventListener('show.trm.menu',veto)
    root.addEventListener('shown.trm.combobox',()=>events.push('combobox-shown'));await combo.show()
    const visible=document.querySelector('#city-menu')!.classList.contains('show');root.removeEventListener('show.trm.menu',veto)
    return {events,visible}
  })
  expect(result).toEqual({events:['combobox-shown'],visible:false})
  await page.locator('#city').click();await page.locator('#city').evaluate(el=>el.addEventListener('change.trm.combobox',event=>event.preventDefault()))
  await page.locator('#city-menu [data-trm-value="par"]').click();await expect(page.locator('input[name="city"]')).toHaveValue('par')
})
