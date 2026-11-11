import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import original from '../fixtures/mdx-migration/component-feedback.before.json' with { type: 'json' }

test.use({ reducedMotion: 'reduce' })
for (const item of original) test(item.name + ': authored feedback content, API and source links', async ({ page, request }) => {
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
  if (item.implementation === 'toast') {
    await expect(page.locator('#data-attributes + p')).toContainText('data-trm-dismiss="toast"')
    await expect(page.locator('#demo-live-toast')).toBeHidden()
  } else {
    await expect(page.locator('#data-attributes + p')).toContainText('not a Scrollspy initialization hook')
    await expect(page.locator('#data-attributes + p + .docs-class-list code')).toHaveText(item.definition.dataAttributes)
    if (item.detail.variables.length) await expect(page.locator('#css-variables + p + p')).toContainText('reused Nav presentation')
  }
  const copy = page.locator('.docs-example + .docs-code .docs-copy').first()
  await expect(copy).toBeVisible()
  const exampleCode = await page.locator('.docs-example + .docs-code pre code').first().textContent()
  const links = await page.locator('main a[href^="/"]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('href')!))])
  for (const href of links) expect((await request.get(href)).status(), href).toBe(200)
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async (text: string) => { (window as unknown as { copiedFeedbackExample: string }).copiedFeedbackExample = text }
    } })
  })
  await copy.click()
  expect(await page.evaluate(() => (window as unknown as { copiedFeedbackExample: string }).copiedFeedbackExample)).toBe(exampleCode)
  expect(errors).toEqual([])
})

// Isolate content/copy and each theme's audit matrix. Each page still receives
// all eight theme/direction/viewport audits, without one long combined test.
for (const item of original) for (const theme of ['light', 'dark']) test(item.name + ': authored feedback accessibility ' + theme, async ({ page }) => {
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

for (const name of ['toast', 'toasts', 'scrollspy']) test(name + ': feedback plugin behavior requires scripts', async ({ page }) => {
  const blocked: string[] = []
  await page.route('**/*', route => {
    if (route.request().resourceType() === 'script') { blocked.push(route.request().url()); return route.abort() }
    return route.continue()
  })
  await page.goto('/components/' + name + '/')
  expect(blocked.length).toBeGreaterThan(0)
  if (name !== 'scrollspy') {
    await page.getByRole('button', { name: 'Show live toast', exact: true }).click()
    await expect(page.locator('#demo-live-toast')).toBeHidden()
    const toast = page.locator('#example-toast')
    await toast.getByRole('button', { name: 'Dismiss', exact: true }).click()
    await expect(toast).toBeVisible()
  } else {
    const root = page.locator('#guide-spy-content'), links = page.locator('#guide-spy-nav')
    await expect(links.locator('a.active')).toHaveCount(0)
    await root.evaluate(element => { element.scrollTop = element.scrollHeight })
    await expect(links.locator('a.active')).toHaveCount(0)
    expect(await root.evaluate(element => element.scrollTop)).toBeGreaterThan(0)
  }
})

test('Toast alias keeps explicit show, cancellation and non-removing dismissal', async ({ page }) => {
  await page.goto('/components/toasts/')
  const live = page.locator('#demo-live-toast'), trigger = page.getByRole('button', { name: 'Show live toast', exact: true })
  await expect(live).toBeHidden()
  await live.evaluate(root => root.addEventListener('show.trm.toast', event => event.preventDefault(), { once: true }))
  await trigger.click(); await expect(live).toBeHidden()
  await trigger.click(); await expect(live).toBeVisible()
  await live.getByRole('button', { name: 'Dismiss live notification', exact: true }).click()
  await expect(live).toBeHidden()
  await expect(live).toHaveCount(1)
})
