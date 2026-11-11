import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import original from '../fixtures/mdx-migration/component-navigation.before.json' with { type: 'json' }

test.use({ reducedMotion: 'reduce' })
for (const item of original) test(item.name + ': authored navigation content and accessible responsive states', async ({ page, request }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/components/' + item.name + '/')
  await expect(page.locator('main h1')).toHaveText(item.title)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', item.description)
  await expect(page.locator('.docs-variant > h3')).toHaveText(item.detail.variants.map(variant => variant.title))
  await expect(page.locator('.docs-page-tools a').first()).toHaveAttribute('href', `https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/components/${item.name}.mdx`)
  await expect(page.locator('.docs-page-tools a').last()).toHaveAttribute('href', item.reference)
  await expect(page.locator('#docs-sidebar a[aria-current="page"]')).toHaveAttribute('href', `/components/${item.name}/`)
  await expect(page.locator('#javascript + p')).toHaveText(item.javascript)
  await expect(page.locator('#options, #methods, #events, #data-attributes')).toHaveCount(0)
  if (item.name === 'button-group') await expect(page.locator('#css-variables')).toHaveCount(0)
  if (item.name === 'close-button') expect(await page.getByRole('region', { name: 'Scrollable CSS variables', exact: true }).locator('table').evaluate(root => getComputedStyle(root).tableLayout)).toBe('fixed')
  const copy = page.locator('.docs-example + .docs-code .docs-copy').first()
  await expect(copy).toBeVisible()
  const exampleCode = await page.locator('.docs-example + .docs-code pre code').first().textContent()
  const links = await page.locator('main a[href^="/"]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('href')!))])
  for (const href of links) expect((await request.get(href)).status(), href).toBe(200)
  for (const theme of ['light', 'dark']) for (const dir of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((element, state) => { element.setAttribute('data-trm-theme', state.theme); element.setAttribute('dir', state.dir) }, { theme, dir })
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 })
      await page.evaluate(() => window.scrollTo(0, 0))
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
    }
  }
  // Exercise focus/scroll-changing copy behavior after the read-only audits.
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async (text: string) => { (window as unknown as { copiedNavigationExample: string }).copiedNavigationExample = text }
    } })
  })
  await copy.click()
  expect(await page.evaluate(() => (window as unknown as { copiedNavigationExample: string }).copiedNavigationExample)).toBe(exampleCode)
  expect(errors).toEqual([])
})

for (const name of ['button-group', 'close-button', 'nav']) test(name + ': native behavior and plugin boundaries without page scripts', async ({ page }) => {
  const blocked: string[] = []
  await page.route('**/*', route => {
    if (route.request().resourceType() === 'script') { blocked.push(route.request().url()); return route.abort() }
    return route.continue()
  })
  await page.goto('/components/' + name + '/')
  expect(blocked.length).toBeGreaterThan(0)
  if (name === 'button-group') {
    const checkbox = page.getByRole('checkbox', { name: 'Bold', exact: true })
    await checkbox.focus(); await checkbox.press('Space'); await expect(checkbox).toBeChecked()
    await checkbox.press('Space'); await expect(checkbox).not.toBeChecked()
    const radio = page.getByRole('radio', { name: 'Align center', exact: true })
    await radio.focus(); await radio.press('Space'); await expect(radio).toBeChecked()
    await expect(page.getByRole('radio', { name: 'Align start', exact: true })).not.toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Locked', exact: true })).toBeDisabled()
    const menu = page.getByRole('button', { name: 'More actions', exact: true })
    await menu.click(); await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('[role="menu"][aria-labelledby="group-menu-trigger"]')).toBeHidden()
  } else if (name === 'close-button') {
    const close = page.getByRole('button', { name: 'Close example', exact: true })
    await close.click(); await expect(close).toBeVisible()
    await expect(page.getByRole('button', { name: 'Unavailable close action', exact: true })).toBeDisabled()
    const alert = page.locator('#reference-close-alert')
    await alert.getByRole('button', { name: 'Dismiss example message' }).click()
    await expect(alert).toBeVisible() // Dismissal requires the explicitly disclosed Alert plugin.
  } else {
    await expect(page.locator('.docs-example [role="tab"], .docs-example [role="tablist"]')).toHaveCount(0)
    const menu = page.getByRole('button', { name: 'More sections', exact: true })
    await menu.click(); await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await expect(page.getByRole('menu', { name: 'More sections', exact: true })).toBeHidden()
    const cards = page.getByRole('navigation', { name: 'Project sections', exact: true }).getByRole('link', { name: 'Cards', exact: true })
    await cards.focus(); await cards.press('Enter')
    await expect.poll(() => new URL(page.url()).pathname).toBe('/components/card/')
  }
})
