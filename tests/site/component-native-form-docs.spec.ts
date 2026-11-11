import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { nativeFormTopics } from '../../site/src/data/native-form-guides'

test.use({reducedMotion:'reduce'})
const errors=new WeakMap<Page,string[]>()
test.beforeEach(({page})=>{const list:string[]=[];errors.set(page,list);page.on('pageerror',e=>list.push(e.message))})
test.afterEach(({page})=>{expect(errors.get(page)).toEqual([])})
const audit=async(page:Page)=>expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze()).violations).toEqual([])
for(const topic of nativeFormTopics)for(const theme of ['light','dark'])for(const dir of ['ltr','rtl'])test(`${topic} ${theme}/${dir}: desktop/mobile WCAG and current native examples`,async({page})=>{
  await page.goto('/forms/'+topic+'/');await page.locator('html').evaluate((el,s)=>{el.setAttribute('dir',s.dir);el.setAttribute('data-trm-theme',s.theme)},{theme,dir})
  await expect(page.locator('.docs-page-tools a').last()).toHaveAttribute('href','https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/forms/'+topic+'.mdx')
  await expect(page.locator('head link[href*="tremplin-extensions"]')).toHaveCount(0);await expect(page.locator('script[src*="/js/tremplin"]')).toHaveCount(1)
  for(const width of [1280,390]){
    await page.setViewportSize({width,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
    for(const box of await page.locator('.docs-example').all())expect(await box.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true)
    await audit(page)
  }
})
test('Field cards select natively and expose a named group without a controller',async({page})=>{
  await page.goto('/forms/field/');const basic=page.locator('#native-plan-basic'),team=page.locator('#native-plan-team');await expect(basic).toBeChecked()
  await page.locator('label[for="native-plan-team"]').click();await expect(team).toBeChecked();await expect(basic).not.toBeChecked();await team.focus();await page.keyboard.press('ArrowUp');await expect(basic).toBeChecked()
  await expect(page.getByRole('group',{name:'Choose a project plan',exact:true})).toBeVisible();await audit(page)
})
test('Field switches its grid for direct controls and spans a real group title',async({page})=>{
  await page.goto('/forms/field/');const field=page.locator('#native-field-overhead').locator('..');await expect(field).toHaveCSS('display','grid');await expect(field).toHaveAccessibleName('Project preferences')
  await expect(page.locator('#native-field-overhead-title')).toHaveCSS('grid-column','1 / -1');await page.getByLabel('Receive project updates',{exact:true}).check();await expect(page.locator('#native-field-overhead')).toBeChecked()
  const input=page.locator('#native-field-invalid');await input.fill('demo@example.com');await expect(input).toHaveClass(/is-invalid/);await expect(input).toHaveAttribute('aria-invalid','true')
})
test('Form control native states, multiple selects and custom type values remain browser-owned',async({page})=>{
  await page.goto('/forms/form-control/');await page.locator('#native-control-multiple').selectOption(['design','support']);await expect(page.locator('#native-control-multiple')).toHaveValues(['design','support'])
  await expect(page.locator('#forms-control-disabled')).toBeDisabled();await page.locator('#forms-control-readonly').focus();await expect(page.locator('#forms-control-readonly')).toBeFocused();await expect(page.locator('#forms-control-readonly')).toHaveAttribute('readonly','')
  await page.locator('#native-control-plaintext').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');await expect(page.locator('#native-control-plaintext')).toBeFocused();await expect(page.locator('#native-control-plaintext')).toHaveCSS('outline-style','solid')
  await expect(page.locator('#forms-control-date')).toHaveValue('2026-11-08');await expect(page.locator('#native-control-time')).toHaveValue('13:00');await expect(page.locator('#native-control-color')).toHaveValue('#631aff')
  await page.locator('#native-control-datalist').fill('Custom workstream');await expect(page.locator('#native-control-datalist')).toHaveValue('Custom workstream')
  const min=await page.locator('#forms-control-small').evaluate(el=>el.getBoundingClientRect().height),max=await page.locator('#forms-control-large').evaluate(el=>el.getBoundingClientRect().height);expect(max).toBeGreaterThan(min)
})
test('Form control ghost wrapper shows focus and file selection remains local',async({page})=>{
  await page.goto('/forms/form-control/');const requests:string[]=[];page.on('request',r=>{if(r.isNavigationRequest()||r.method()==='POST')requests.push(r.url())})
  const ghost=page.locator('#native-control-ghost');await ghost.focus();await ghost.fill('Local search');await expect(ghost.locator('..')).toHaveCSS('outline-style','solid')
  await page.locator('#forms-control-file').setInputFiles({name:'project.txt',mimeType:'text/plain',buffer:Buffer.from('Local browser fixture')});expect(await page.locator('#forms-control-file').evaluate(el=>(el as HTMLInputElement).files?.[0]?.name)).toBe('project.txt')
  await expect(page.locator('#native-control-file-disabled')).toBeDisabled();expect(requests).toEqual([]);await audit(page)
})
test('Checkbox uses native Space and indeterminate is explicit application state',async({page})=>{
  await page.goto('/forms/checkbox/');const basic=page.locator('#forms-checkbox-updates');await basic.focus();await page.keyboard.press('Space');await expect(basic).toBeChecked()
  const mixed=page.locator('#forms-checkbox-partial');await expect(mixed).toHaveJSProperty('indeterminate',true);await mixed.focus();await page.keyboard.press('Space');await expect(mixed).toBeChecked();await expect(mixed).toHaveJSProperty('indeterminate',false)
  await expect(page.locator('#native-checkbox-disabled-mixed')).toBeDisabled();await expect(page.locator('#native-checkbox-disabled-mixed')).toHaveJSProperty('indeterminate',true)
  const mask=await basic.evaluate(el=>getComputedStyle(el,'::before').maskImage);expect(mask).toContain('data:image/svg+xml');await audit(page)
})
test('Radio name groups exclude other values while style specimens remain independent',async({page})=>{
  await page.goto('/forms/radio/');await page.locator('#forms-radio-monthly').focus();await page.keyboard.press('ArrowDown');await expect(page.locator('#forms-radio-yearly')).toBeChecked();await expect(page.locator('#forms-radio-monthly')).not.toBeChecked()
  await expect(page.locator('#native-radio-disabled')).toBeDisabled();await expect(page.locator('#native-radio-disabled-checked')).toBeChecked();await expect(page.locator('#native-radio-theme-primary')).toBeChecked();await expect(page.locator('#native-radio-theme-success')).toBeChecked()
  expect(await page.locator('#forms-radio-yearly').evaluate(el=>getComputedStyle(el).appearance)).toBe('none');await audit(page)
})
test('Switch wrapper owns focus/theme/width while the native checkbox owns state',async({page})=>{
  await page.goto('/forms/switch/');const input=page.getByRole('switch',{name:'Enable notifications',exact:true});await input.focus();await page.keyboard.press('Space');await expect(input).toBeChecked();await expect(input.locator('..')).toHaveCSS('outline-style','solid')
  await expect(page.locator('#native-switch-disabled')).toBeDisabled();const wide=page.locator('#native-switch-wide').locator('..');await expect(wide).toHaveCSS('width','44px')
  const width=await wide.evaluate(el=>getComputedStyle(el,'::before').width);expect(width).toBe('24px');await page.locator('html').evaluate(el=>el.setAttribute('dir','rtl'));await page.locator('#native-switch-wide').check();await expect(page.locator('#native-switch-wide')).toBeChecked();await audit(page)
})
for(const topic of nativeFormTopics)test(`${topic} remains native without JavaScript; indeterminate setup does not run`,async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false}),page=await context.newPage()
  try{
      await page.goto('http://127.0.0.1:4175/forms/'+topic+'/');await expect(page.locator('main h1')).toBeVisible();await expect(page.locator('form')).toHaveCount(0)
      // Inspect the same state through its native selector: Firefox's disabled-
      // JavaScript context stalls on the property-evaluation assertion.
      if(topic==='checkbox'){await expect(page.locator('#forms-checkbox-partial:indeterminate')).toHaveCount(0);await page.locator('#forms-checkbox-updates').check();await expect(page.locator('#forms-checkbox-updates')).toBeChecked()}
      if(topic==='radio'){await page.locator('#forms-radio-yearly').check();await expect(page.locator('#forms-radio-monthly')).not.toBeChecked()}
      if(topic==='switch'){await page.getByRole('switch',{name:'Enable notifications',exact:true}).check();await expect(page.locator('#forms-switch-notices')).toBeChecked()}
  }finally{await context.close()}
})
