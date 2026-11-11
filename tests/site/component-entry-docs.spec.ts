import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { installationGuide } from '../helpers/getting-started-contract'
import { installationManagers, registryInstallCommand, starterHtml } from '../../site/src/data/installation-examples'

test.use({ reducedMotion: 'reduce' })
const errors = new WeakMap<Page, string[]>()
test.beforeEach(({page}) => { const list: string[] = []; errors.set(page, list); page.on('pageerror', error => list.push(error.message)) })
test.afterEach(({page}) => { expect(errors.get(page)).toEqual([]) })
const audit = async (page: Page) => expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze()).violations).toEqual([])

for (const route of ['/', '/getting-started/install/', '/getting-started/']) for (const theme of ['light','dark']) for (const dir of ['ltr','rtl']) test(`entry ${route} ${theme}/${dir}: desktop/mobile layout, WCAG and one runtime`, async ({page}) => {
  await page.goto(route)
  await page.locator('html').evaluate((element,state) => {element.setAttribute('data-trm-theme',state.theme);element.setAttribute('dir',state.dir)}, {theme,dir})
  await expect(page.locator('main h1')).toHaveCount(1)
  await expect(page.locator('script[src*="/js/tremplin"]')).toHaveCount(1)
  for (const width of [1280,390]) {
    await page.setViewportSize({width,height:844})
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (route === '/') expect(await page.locator('.docs-announcement').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
    await audit(page)
  }
})

test('installation tabs show registry templates and support arrows, Home, End and copied SVG feedback', async ({page}) => {
  const copied: string[] = []
  await page.exposeFunction('entryCopy', (text: string) => {copied.push(text)})
  await page.goto('/getting-started/install/')
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{writeText:(text:string) => (window as unknown as {entryCopy:(text:string)=>Promise<void>}).entryCopy(text)}}))
  const tabs = page.getByRole('tablist',{name:'Package managers'})
  for (const [manager,command] of installationManagers) {
    const tab = tabs.getByRole('tab',{name:manager,exact:true})
    await tab.click()
    await expect(tab).toHaveAttribute('aria-selected','true')
    const panel = page.getByRole('tabpanel')
    await expect(panel).toContainText(command)
    await expect(panel.locator('svg')).toHaveAttribute('aria-hidden','true')
    // The accessible name changes to Copied; keep the action locator stable.
    const copy = panel.locator('button.docs-copy')
    await expect(copy).toHaveAttribute('aria-label',`Copy ${manager.toLowerCase()} install command`)
    await expect(copy.locator('use')).toHaveAttribute('href','/docs-icons.svg#copy')
    await copy.click()
    await expect(copy).toHaveAttribute('aria-label','Copied')
    await expect(copy.locator('use')).toHaveAttribute('href','/docs-icons.svg#check2')
    expect(copied.at(-1)).toBe(command)
  }
  const npm = tabs.getByRole('tab',{name:'npm',exact:true})
  await npm.focus();await npm.press('ArrowRight')
  await expect(tabs.getByRole('tab',{name:'pnpm',exact:true})).toBeFocused()
  await page.keyboard.press('End');await expect(tabs.getByRole('tab',{name:'Bun',exact:true})).toBeFocused()
  await page.keyboard.press('Home');await expect(npm).toBeFocused()
  await npm.press('ArrowLeft');await expect(tabs.getByRole('tab',{name:'Bun',exact:true})).toBeFocused()
  await audit(page)
})

test('homepage copies the versioned registry command and reports clipboard denial without losing focus', async ({page}) => {
  const copied: string[] = []
  await page.exposeFunction('entryCopy',(text:string)=>{copied.push(text)})
  await page.goto('/')
  await page.evaluate(() => Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:(text:string)=>(window as unknown as {entryCopy:(text:string)=>Promise<void>}).entryCopy(text)}}))
  const button=page.locator('.docs-install-command button.docs-copy')
  await expect(button).toHaveAttribute('aria-label','Copy package installation command')
  await button.focus();await button.press('Enter')
  await expect(button).toHaveAttribute('aria-label','Copied')
  expect(copied).toEqual([registryInstallCommand])
  await expect(button).toHaveAttribute('aria-label','Copy package installation command')
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('Denied for this test'))}}))
  await button.press('Enter')
  await expect(page.locator('#docs-copy-status')).toContainText('Clipboard access is unavailable')
  await expect(button).toBeFocused()
  await expect(button.locator('use')).toHaveAttribute('href','/docs-icons.svg#copy')
  await expect(button).toHaveAttribute('aria-label','Copy failed. Select the code and copy it manually.')
})

test('installation headings, local downloads and starter copies follow the reviewed contract', async ({page,request}) => {
  await page.goto('/getting-started/install/')
  await expect(page.locator('main h2')).toHaveText(installationGuide.sections.filter(s=>s.level!==3).map(s=>s.heading))
  await expect(page.locator('main h3')).toHaveText(installationGuide.sections.filter(s=>s.level===3).map(s=>s.heading))
  await expect(page.locator('#docs-toc-nav a')).toHaveCount(installationGuide.sections.length)
  const links=await page.locator('main a[href^="/"]').evaluateAll(links=>[...new Set(links.map(link=>link.getAttribute('href')!))])
  for(const link of links) expect((await request.get(link)).status(),link).toBe(200)
  const source=await page.locator('main pre').allTextContents()
  expect(source.find(code=>code.startsWith('<!doctype html>'))).toBe(starterHtml)
  await expect(page.locator('main')).toContainText('Vanilla Calendar Pro are included')
  const anchors=await page.locator('main a[href^="#"]').evaluateAll(links=>links.map(link=>link.getAttribute('href')!))
  for(const anchor of anchors) await expect(page.locator(anchor)).toBeAttached()
})

test('copied local document works with actual CSS and one self-contained browser download', async ({page}) => {
  await page.goto('/getting-started/install/')
  const source=(await page.locator('main pre').allTextContents()).find(code=>code.startsWith('<!doctype html>'))!
  await page.route('**/entry-demo/index.html',route=>route.fulfill({contentType:'text/html',body:source}))
  await page.route('**/entry-demo/dist/**',route=>{const url=new URL(route.request().url());url.pathname=url.pathname.replace('/entry-demo','');return route.continue({url:url.toString()})})
  await page.goto('/entry-demo/index.html')
  const button=page.getByRole('button',{name:'Show details'})
  expect(await button.evaluate(element=>parseFloat(getComputedStyle(element).minHeight))).toBeGreaterThan(30)
  await button.focus();await button.press('Enter')
  await expect(button).toHaveAttribute('aria-expanded','true')
  await expect(page.locator('#welcome')).toBeVisible()
  await button.press('Enter');await expect(button).toHaveAttribute('aria-expanded','false')
  await expect(page.locator('#welcome')).toBeHidden()
  await expect(button).toBeFocused()
  await audit(page)
  await page.setViewportSize({width:390,height:844})
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
})

test('shared quickstart uses matching assets and a styled functional disclosure', async ({page}) => {
  await page.goto('/getting-started/')
  await expect(page.locator('main')).toContainText('dist/icons/')
  const button=page.locator('.docs-example').getByRole('button',{name:'Show details'})
  await expect(button).toHaveClass('btn-solid theme-inverse')
  await button.click();await expect(page.locator('#first-page-details')).toBeVisible()
  await button.click();await expect(page.locator('#first-page-details')).toBeHidden()
})
