import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { compositionTopics } from '../../site/src/data/form-composition-guides'

test.use({ reducedMotion: 'reduce' })
const errors = new WeakMap<Page, string[]>()
test.beforeEach(({ page }) => { const list: string[] = []; errors.set(page, list); page.on('pageerror', e => list.push(e.message)) })
test.afterEach(({ page }) => { expect(errors.get(page)).toEqual([]) })
const audit = async (page: Page) => expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze()).violations).toEqual([])

for (const topic of compositionTopics) for (const theme of ['light','dark']) for (const dir of ['ltr','rtl']) test(`${topic} ${theme}/${dir}: desktop/mobile layout and WCAG`, async ({ page }) => {
  await page.goto('/forms/' + topic + '/')
  await page.locator('html').evaluate((el, state) => { el.setAttribute('dir', state.dir); el.setAttribute('data-trm-theme', state.theme) }, {dir,theme})
  await expect(page.locator('.docs-page-tools a').last()).toHaveAttribute('href', 'https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/forms/'+topic+'.mdx')
  await expect(page.locator('head link[href*="tremplin-extensions"]')).toHaveCount(0)
  await expect(page.locator('script[src*="/js/tremplin"]')).toHaveCount(1)
  for (const width of [1280,390]) {
    await page.setViewportSize({width,height:844})
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    for (const box of await page.locator('.docs-example').all()) expect(await box.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true)
    await audit(page)
  }
})

test('Input group menus and segmented menus operate with native focus restoration', async ({ page }) => {
  await page.goto('/forms/input-group/')
  for (const id of ['composition-menu-start','composition-menu-end','composition-menu-split']) {
    const toggle = page.locator('#' + id), menu = toggle.locator('+ .menu')
    await toggle.click(); await expect(toggle).toHaveAttribute('aria-expanded','true'); await expect(menu).toBeVisible(); await audit(page)
    await toggle.press('ArrowDown'); await expect(menu.locator('.menu-item').first()).toBeFocused()
    await page.keyboard.press('Escape'); await expect(toggle).toBeFocused(); await expect(toggle).toHaveAttribute('aria-expanded','false')
  }
})
test('Input group native files, multiple values, logical edges and group button sizes', async ({ page }) => {
  await page.goto('/forms/input-group/')
  const requests: string[] = []; page.on('request', r => { if (r.isNavigationRequest() || r.method() === 'POST') requests.push(r.url()) })
  await page.locator('#composition-group-file').setInputFiles({name:'example.txt',mimeType:'text/plain',buffer:Buffer.from('Local fixture')})
  await page.locator('#composition-first').fill('Example'); await page.locator('#composition-last').fill('Person')
  await page.locator('#composition-group-check').check(); await expect(page.locator('#composition-group-filter')).toBeEnabled()
  const small = await page.locator('.input-group-sm .input-group-btn').evaluate(el => el.getBoundingClientRect().height)
  const large = await page.locator('.input-group-lg .input-group-btn').evaluate(el => el.getBoundingClientRect().height)
  expect(large).toBeGreaterThan(small)
  for (const dir of ['ltr','rtl']) {
    await page.locator('html').evaluate((el,d) => el.setAttribute('dir',d),dir)
    expect(await page.locator('#composition-ignore-input').evaluate(el => getComputedStyle(el).borderStartEndRadius)).not.toBe('0px')
  }
  expect(requests).toEqual([])
})
test('Floating labels follow focus/value, wrapper height, always-floating and native states', async ({ page }) => {
  await page.goto('/forms/floating-labels/')
  const input = page.locator('#forms-floating-email'), label = page.locator('label[for="forms-floating-email"]')
  await expect(label).toHaveCSS('transform','none')
  await input.focus(); await expect(label).not.toHaveCSS('transform','none')
  await input.fill('demo@example.com'); await input.blur(); await expect(label).not.toHaveCSS('transform','none')
  await input.clear(); await input.blur(); await expect(label).toHaveCSS('transform','none')
  await expect(page.locator('#composition-floating-tall')).toHaveCSS('height','100px')
  await expect(page.locator('label[for="forms-floating-role"]')).not.toHaveCSS('transform','none')
  await expect(page.locator('label[for="composition-floating-always"]')).not.toHaveCSS('transform','none')
  await expect(page.locator('#composition-floating-disabled')).toBeDisabled()
  await page.locator('#composition-floating-plain').focus(); await expect(page.locator('#composition-floating-plain')).toHaveCSS('outline-style','solid')
})
test('Adornment label padding focuses its ghost; end order and static validation remain real', async ({ page }) => {
  await page.goto('/forms/form-adorn/')
  const wrapper = page.locator('label.form-adorn[for="forms-adorn-site"]'), input = page.locator('#forms-adorn-site')
  await wrapper.click({position:{x:5,y:10}}); await expect(input).toBeFocused(); await expect(wrapper).toHaveCSS('outline-style','solid')
  await expect(page.locator('#composition-adorn-end')).toHaveCSS('order','-1')
  await expect(page.locator('#composition-adorn-disabled')).toBeDisabled()
  await expect(page.locator('#composition-adorn-invalid-error')).toBeVisible()
  await page.locator('#composition-adorn-invalid').fill('example.com'); await expect(page.locator('#composition-adorn-invalid-error')).toBeVisible()
  await audit(page)
})
test('Layout uses canonical responsive columns and native local submission/reset', async ({ page }) => {
  await page.goto('/forms/layout/')
  const grid = page.locator('[data-forms-demo="grid"]'), first = grid.locator('> div').first(), last = grid.locator('> div').last()
  await page.setViewportSize({width:1280,height:900})
  const wideA = await first.boundingBox(), wideB = await last.boundingBox(); expect(Math.abs(wideA!.y-wideB!.y)).toBeLessThan(2)
  await page.setViewportSize({width:390,height:844})
  const narrowA = await first.boundingBox(), narrowB = await last.boundingBox(); expect(narrowB!.y).toBeGreaterThan(narrowA!.y+narrowA!.height)
  const requests: string[] = []; page.on('request',r => {if(r.isNavigationRequest()||r.method()==='POST')requests.push(r.url())})
  const form = page.locator('form[data-composition-local]').first()
  await form.getByRole('button',{name:'Preview locally',exact:true}).click(); await expect(form.getByRole('status')).toHaveText('Valid. This demo does not send data.')
  await form.getByRole('button',{name:'Reset form',exact:true}).click(); await expect(form.getByRole('status')).toHaveText('No submission attempted.')
  expect(requests).toEqual([])
})
test('Validation summary focuses, recovers while typing, clears custom validity and resets', async ({ page }) => {
  await page.goto('/forms/validation/')
  const requests: string[] = []; page.on('request',r => {if(r.isNavigationRequest()||r.method()==='POST')requests.push(r.url())})
  const form = page.locator('#forms-validation-demo'), input = page.locator('#forms-validation-email')
  await form.getByRole('button',{name:'Check details',exact:true}).click(); await expect(form.locator('[data-error-summary]')).toBeFocused()
  await form.getByRole('link',{name:'Enter a valid email address',exact:true}).click(); await expect(input).toBeFocused()
  await input.fill('demo@example.com'); await expect(form.locator('[data-error-summary]')).toBeHidden(); await expect(input).toHaveAttribute('aria-invalid','false')
  await form.getByRole('button',{name:'Reset form',exact:true}).click(); await expect(input).not.toHaveAttribute('aria-invalid'); await expect(input).toHaveValue('')
  const codeForm = page.locator('#composition-code-form'), code = page.locator('#composition-validation-code')
  await code.fill('DEMO00'); await codeForm.getByRole('button',{name:'Check project code',exact:true}).click(); expect(await code.evaluate(el => (el as HTMLInputElement).validity.customError)).toBe(true)
  await code.fill('ABC123'); await expect(codeForm.locator('[data-error-summary]')).toBeHidden(); expect(await code.evaluate(el => (el as HTMLInputElement).validity.customError)).toBe(false)
  await codeForm.getByRole('button',{name:'Reset form',exact:true}).click(); await expect(code).toHaveValue('')
  expect(requests).toEqual([]); await audit(page)
})
test('Native validation blocks invalid submit, valid demo stays local and server states stay explicit', async ({ page }) => {
  await page.goto('/forms/validation/')
  const form = page.locator('#forms-native-demo'), input = page.locator('#forms-native-email')
  await form.getByRole('button',{name:'Try native validation',exact:true}).click(); await expect(input).toBeFocused()
  await expect(form.getByRole('status')).toHaveText('No submission attempted.')
  await input.fill('demo@example.com'); await form.getByRole('button',{name:'Try native validation',exact:true}).click(); await expect(form.getByRole('status')).toHaveText('Valid. This demo does not send data.')
  await page.locator('#forms-server-email').fill('other@example.com'); await expect(page.locator('#forms-server-email')).toHaveAttribute('aria-invalid','true')
  for(const id of ['composition-invalid-check-error','composition-invalid-radio-error','composition-invalid-switch-error','composition-invalid-group-error','composition-invalid-adorn-error']) await expect(page.locator('#'+id)).toBeVisible()
})
test('Scoped native user validity excludes the optional sibling from success styling', async ({ page }) => {
  await page.goto('/forms/validation/')
  const field = page.locator('#composition-native-required')
  await field.fill('Example'); await field.press('Tab')
  await expect(page.locator('#composition-native-required-good')).toBeVisible()
  await expect(page.locator('#composition-native-optional-good')).toBeHidden()
  await field.clear(); await field.press('Tab')
  await expect(page.locator('#composition-native-required-error')).toBeVisible()
  await expect(page.locator('#composition-native-required-good')).toBeHidden()
  const form = page.locator('#composition-native-state-form')
  await form.getByRole('button',{name:'Try scoped native validity',exact:true}).click()
  await expect(form.getByRole('status')).toHaveText('Complete the required fields. Nothing was sent.')
})
for (const topic of compositionTopics) test(`${topic}: native content and safe disabled submissions without JavaScript`, async ({ browser }) => {
  const context = await browser.newContext({javaScriptEnabled:false}), page = await context.newPage()
  try {
    await page.goto('http://127.0.0.1:4175/forms/'+topic+'/')
    await expect(page.locator('main h1')).toBeVisible()
    for(const button of await page.locator('[data-composition-submit]').all()) await expect(button).toBeDisabled()
    if(topic==='validation') {
      const requests: string[]=[];page.on('request',r=>{if(r.isNavigationRequest()||r.method()==='POST')requests.push(r.url())})
      await page.locator('#forms-validation-email').fill('demo@example.com');await page.locator('#forms-validation-email').press('Enter')
      expect(requests).toEqual([]);await expect(page.locator('[data-error-summary]:not([hidden])')).toHaveCount(0)
    }
    if(topic==='form-adorn'){await page.locator('label.form-adorn[for="forms-adorn-site"]').click({position:{x:5,y:10}});await expect(page.locator('#forms-adorn-site')).toBeFocused()}
  } finally { await context.close() }
})
