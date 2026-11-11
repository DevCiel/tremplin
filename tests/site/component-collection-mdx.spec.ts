import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import original from '../fixtures/mdx-migration/component-collection.before.json' with { type: 'json' }

test.use({ reducedMotion: 'reduce' })
for (const item of original) test(item.name + ': authored collection content and accessible responsive states', async ({ page, request }) => {
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
  // Run focus/scroll-changing copy behavior after the read-only audit matrix.
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async (text: string) => { (window as unknown as { copiedCollectionExample: string }).copiedCollectionExample = text }
    } })
  })
  await copy.click()
  expect(await page.evaluate(() => (window as unknown as { copiedCollectionExample: string }).copiedCollectionExample)).toBe(exampleCode)
  expect(errors).toEqual([])
})

for (const name of ['breadcrumb', 'list-group', 'pagination']) test(name + ': native collection behavior without page scripts', async ({ page }) => {
  const blocked: string[] = []
  await page.route('**/*', route => {
    if (route.request().resourceType() === 'script') { blocked.push(route.request().url()); return route.abort() }
    return route.continue()
  })
  await page.goto('/components/' + name + '/')
  expect(blocked.length).toBeGreaterThan(0)
  if (name === 'breadcrumb') {
    const example = page.locator('.docs-example').first()
    await expect(example.getByRole('listitem')).toHaveCount(3)
    await expect(example.locator('[aria-current="page"]')).toHaveText('Docs')
    const home = example.getByRole('link', { name: 'Home', exact: true })
    await home.focus(); await home.press('Enter')
    await expect.poll(() => new URL(page.url()).pathname).toBe('/')
  } else if (name === 'list-group') {
    const checkbox = page.getByRole('checkbox', { name: 'Email updates', exact: true })
    await checkbox.focus(); await checkbox.press('Space'); await expect(checkbox).toBeChecked()
    await checkbox.press('Space'); await expect(checkbox).not.toBeChecked()
    const radio = page.getByRole('radio', { name: 'Detailed mode', exact: true })
    await radio.focus(); await radio.press('Space'); await expect(radio).toBeChecked()
    await expect(page.getByRole('radio', { name: 'Compact mode', exact: true })).not.toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Locked updates', exact: true })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Delete project', exact: true })).toBeDisabled()
  } else {
    const navigation = page.getByRole('navigation', { name: 'Search results pages', exact: true })
    await expect(navigation.locator('[aria-disabled="true"]')).not.toHaveAttribute('href')
    const next = navigation.getByRole('link', { name: '2', exact: true })
    await next.focus(); await next.press('Enter')
    await expect.poll(() => new URL(page.url()).search).toBe('?page=2')
    // The documentation sample is static: query navigation is not a results or
    // current-page controller, with or without framework JavaScript.
    await expect(page.getByRole('navigation', { name: 'Search results pages', exact: true }).locator('[aria-current="page"]')).toHaveText('1')
  }
})
