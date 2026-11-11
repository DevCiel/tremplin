import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

test.use({reducedMotion:'reduce'})
const errors=new WeakMap<Page,string[]>()
test.beforeEach(({page})=>{const list:string[]=[];errors.set(page,list);page.on('pageerror',e=>list.push(e.message))})
test.afterEach(({page})=>{expect(errors.get(page)).toEqual([])})
const audit=async(page:Page)=>expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze()).violations).toEqual([])
const routes=[{route:'/components/forms/',prefix:'forms-example',validation:'forms-validation',state:'forms-state',disabled:'forms-disabled'},{route:'/forms/overview/',prefix:'forms-overview',validation:'forms-overview-validation',state:'forms-overview-state',disabled:'forms-overview-disabled'}]
for(const item of routes){
  for(const theme of ['light','dark'])for(const dir of ['ltr','rtl'])test(`${item.route} ${theme}/${dir}: desktop/mobile WCAG, labels and no optional runtime`,async({page})=>{
    await page.goto(item.route);await page.locator('html').evaluate((el,s)=>{el.setAttribute('data-trm-theme',s.theme);el.setAttribute('dir',s.dir)},{theme,dir})
    await expect(page.locator('head link[href*="tremplin-extensions"]')).toHaveCount(0);await expect(page.locator('script[src*="/js/tremplin"]')).toHaveCount(1)
    await expect(page.locator('.docs-page-tools a').last()).toHaveAttribute('href','https://github.com/DevCiel/tremplin/blob/main/'+(item.route.startsWith('/components/')?'src/scss/forms/index.scss':'site/src/content/docs/forms/overview.mdx'))
    expect(await page.evaluate(()=>Object.hasOwn((window as unknown as {TremplinFramework:object}).TremplinFramework,'Forms'))).toBe(false)
    for(const width of [1280,390]){
      await page.setViewportSize({width,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
      for(const box of await page.locator('.docs-example').all())expect(await box.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true)
      await audit(page)
    }
  })
  test(item.route+': native validation, local success and reset make no requests',async({page})=>{
    await page.goto(item.route);const requests:string[]=[];page.on('request',r=>{if(r.isNavigationRequest()||r.method()==='POST')requests.push(r.url())})
    const form=page.locator('#'+item.prefix),email=form.locator('[type="email"]'),project=form.locator('[name="project"]'),status=form.getByRole('status')
    await expect(form.locator('[type="submit"]')).toBeEnabled();await email.fill('not-an-email');await project.fill('Local preview');await form.getByRole('button',{name:'Check locally',exact:true}).click()
    await expect(email).toBeFocused();expect(await email.evaluate(el=>(el as HTMLInputElement).validity.typeMismatch)).toBe(true);await expect(status).toHaveText('No submission attempted.')
    await email.fill('demo@example.com');await form.getByRole('checkbox').check();await project.press('Enter');await expect(status).toHaveText('Valid locally. Nothing was sent or saved.')
    await form.getByRole('button',{name:'Reset',exact:true}).click();await expect(email).toHaveValue('');await expect(project).toHaveValue('');await expect(form.getByRole('checkbox')).not.toBeChecked();await expect(status).toHaveText('No submission attempted.')
    expect(requests).toEqual([])
  })
  test(item.route+': custom feedback, summary links, recovery and reset are application-owned',async({page})=>{
    await page.goto(item.route);const requests:string[]=[];page.on('request',r=>{if(r.isNavigationRequest()||r.method()==='POST')requests.push(r.url())})
    const form=page.locator('#'+item.validation),summary=form.locator('[data-docs-forms-summary]'),email=form.locator('[type="email"]'),code=form.locator('[name="code"]'),submit=form.getByRole('button',{name:'Check details locally'})
    await submit.click();await expect(summary).toBeFocused();await expect(summary.locator('li:not([hidden])')).toHaveCount(2);await expect(email).toHaveAttribute('aria-invalid','true');await expect(code).toHaveClass(/is-invalid/);await expect(form.locator('.invalid-feedback').first()).toBeVisible();await audit(page)
    await summary.getByRole('link',{name:'Enter a valid email address.',exact:true}).click();await expect(email).toBeFocused();await email.fill('demo@example.com');await code.fill('abc');await submit.click()
    await expect(summary.locator('li:not([hidden])')).toHaveCount(1);await expect(email).toHaveAttribute('aria-invalid','false');await expect(form.locator('.invalid-feedback').first()).toBeHidden()
    await summary.getByRole('link',{name:'Use six uppercase letters or digits for the project code.'}).click();await expect(code).toBeFocused();await code.fill('ABC123');await submit.click();await expect(summary).toBeHidden();await expect(form.getByRole('status')).toHaveText('Valid locally. Nothing was sent or saved.')
    await form.getByRole('button',{name:'Reset validation'}).click();await expect(code).toHaveValue('');await expect(code).not.toHaveAttribute('aria-invalid');await expect(form.locator('.is-invalid')).toHaveCount(0);await expect(summary).toBeHidden();await audit(page)
    expect(requests).toEqual([])
  })
  test(item.route+': disabled fieldsets and readonly fields preserve native submission semantics',async({page})=>{
    await page.goto(item.route)
    for(const control of await page.locator('[id^="'+item.disabled+'-"]').all())if(await control.evaluate(el=>el.matches('input,select,textarea')))await expect(control).toBeDisabled()
    const form=page.locator('#'+item.state),readonly=form.locator('[readonly]');await readonly.focus();await expect(readonly).toBeFocused();await expect(form.locator('[disabled]')).toBeDisabled()
    expect(await form.evaluate(el=>[...new FormData(el as HTMLFormElement).entries()])).toEqual([['account','example-account']])
    await form.getByRole('button',{name:'Inspect included field names'}).click();await expect(form.getByRole('status')).toHaveText('Included field names: account. Disabled fields are omitted.')
    await expect(form.getByRole('status')).not.toContainText('example-account')
  })
  test(item.route+': no-JavaScript demos keep action buttons disabled and controls usable',async({browser})=>{
    const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),page=await context.newPage()
    try{
      await page.goto('http://127.0.0.1:4175'+item.route);const requests:string[]=[];page.on('request',r=>{if(r.isNavigationRequest()||r.method()==='POST')requests.push(r.url())})
      const form=page.locator('#'+item.prefix);await expect(form.locator('[type="submit"]')).toBeDisabled();await form.locator('[type="email"]').fill('demo@example.com');await form.locator('[name="project"]').fill('Local preview');await form.getByRole('checkbox').check();await form.locator('[name="project"]').press('Enter')
      await expect(form.getByRole('status')).toHaveText('No submission attempted.');await expect(form.getByRole('checkbox')).toBeChecked();expect(requests).toEqual([])
    }finally{await context.close()}
  })
}
test('Forms composition keeps native checkbox, radio and switch keyboard behavior',async({page})=>{
  await page.goto('/components/forms/');const checkbox=page.locator('#forms-choice-updates');await checkbox.focus();await page.keyboard.press('Space');await expect(checkbox).toBeChecked()
  await page.locator('#forms-choice-monthly').focus();await page.keyboard.press('ArrowDown');await expect(page.locator('#forms-choice-yearly')).toBeChecked();await expect(page.locator('#forms-choice-monthly')).not.toBeChecked()
  const toggle=page.getByRole('switch',{name:'Enable project notices',exact:true});await toggle.focus();await page.keyboard.press('Space');await expect(toggle).toBeChecked();await expect(toggle.locator('..')).toHaveClass('switch');await audit(page)
})
test('Forms composition uses label-first floating styles, named addons and canonical responsive columns',async({page})=>{
  await page.goto('/components/forms/');const input=page.locator('#forms-composition-workspace'),label=page.locator('label[for="forms-composition-workspace"]')
  await input.focus();await expect(label).not.toHaveCSS('transform','none');await input.fill('Workspace');await page.locator('h1').click();await expect(label).not.toHaveCSS('transform','none')
  await expect(page.locator('#forms-composition-path')).toHaveAccessibleName('Project path');await expect(page.locator('#forms-composition-path')).toHaveAttribute('aria-describedby','forms-composition-prefix')
  const first=page.locator('#forms-layout-demo-first'),last=page.locator('#forms-layout-demo-last');await page.setViewportSize({width:1280,height:900});const a=await first.boundingBox(),b=await last.boundingBox();expect(a!.y).toBe(b!.y)
  await page.setViewportSize({width:390,height:844});const c=await first.boundingBox(),d=await last.boundingBox();expect(c!.y).toBeLessThan(d!.y)
})
