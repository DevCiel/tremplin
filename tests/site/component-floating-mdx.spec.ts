import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import original from '../fixtures/mdx-migration/component-floating.before.json' with { type: 'json' }

test.use({ reducedMotion: 'reduce' })

for (const name of ['tooltip', 'popover']) test(name + ': floating plugin behavior requires scripts', async ({ page }) => {
  const blocked: string[] = []
  await page.route('**/*', route => {
    if (route.request().resourceType() === 'script') { blocked.push(route.request().url()); return route.abort() }
    return route.continue()
  })
  await page.goto('/components/' + name + '/')
  expect(blocked.length).toBeGreaterThan(0)
  const trigger = page.locator('#example-' + name)
  await trigger.focus()
  await trigger.hover()
  await trigger.click()
  await expect(trigger).not.toHaveAttribute('aria-describedby')
  await expect(page.locator('body > .' + name)).toHaveCount(0)
})

for (const item of original) test(item.name + ': authored floating content, API and source links', async ({ page, request }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/components/' + item.name + '/')
  await expect(page.locator('main h1')).toHaveText(item.title)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', item.description)
  await expect(page.locator('.docs-variant > h3')).toHaveText(item.detail.variants.map(variant => variant.title))
  await expect(page.locator('.docs-page-tools a').first()).toHaveAttribute('href', `https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/components/${item.name}.mdx`)
  await expect(page.locator('.docs-page-tools a').last()).toHaveAttribute('href', item.reference)
  await expect(page.locator('#docs-sidebar a[aria-current="page"]')).toHaveAttribute('href', `/components/${item.name}/`)
  await expect(page.locator('#javascript + p + .docs-code pre code')).toHaveText(item.javascript)
  await expect(page.locator('#methods + ul code')).toHaveText([...item.commonMethods, ...item.definition.methods])
  await expect(page.locator('#events + .table-responsive tbody tr td:first-child code')).toHaveText(item.definition.events)
  await expect(page.locator('#events + .table-responsive tbody tr td:last-child')).toHaveText(Object.values(item.events))
  await expect(page.locator('#options + .table-responsive tbody tr td:first-child code')).toHaveText(item.definition.options.map(option => option.name))
  await expect(page.locator('#options + .table-responsive tbody tr td:nth-child(2) code')).toHaveText(item.definition.options.map(option => option.type))
  await expect(page.locator('#data-attributes + .docs-class-list code')).toHaveText(item.definition.dataAttributes)
  const copy = page.locator('.docs-example + .docs-code .docs-copy').first()
  await expect(copy).toBeVisible()
  const exampleCode = await page.locator('.docs-example + .docs-code pre code').first().textContent()
  const links = await page.locator('main a[href^="/"]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('href')!))])
  for (const href of links) expect((await request.get(href)).status(), href).toBe(200)
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async (text: string) => { (window as unknown as { copiedOverlayExample: string }).copiedOverlayExample = text }
    } })
  })
  await copy.click()
  expect(await page.evaluate(() => (window as unknown as { copiedOverlayExample: string }).copiedOverlayExample)).toBe(exampleCode)
  expect(errors).toEqual([])
})

for (const item of original) for (const theme of ['light', 'dark']) test(item.name + ': authored floating accessibility ' + theme, async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/components/' + item.name + '/')
  for (const dir of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((element, state) => { element.setAttribute('data-trm-theme', state.theme); element.setAttribute('dir', state.dir) }, { theme, dir })
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 })
      await page.evaluate(() => window.scrollTo(0, 0))
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
    }
  }
  expect(errors).toEqual([])
})
