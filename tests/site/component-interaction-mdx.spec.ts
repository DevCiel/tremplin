import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import original from '../fixtures/mdx-migration/component-interaction.before.json' with { type: 'json' }

test.use({ reducedMotion: 'reduce' })
for (const item of original) test(item.name + ': authored interaction content and accessible responsive states', async ({ page, request }) => {
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
  await expect(page.locator('#data-attributes + .docs-class-list code')).toHaveText(item.definition.dataAttributes)
  if (item.definition.options.length) {
    await expect(page.locator('#options + .table-responsive tbody tr td:first-child code')).toHaveText(item.definition.options.map(option => option.name))
    await expect(page.locator('#options + .table-responsive tbody tr td:nth-child(2) code')).toHaveText(item.definition.options.map(option => option.type))
    await expect(page.locator('#options + .table-responsive tbody tr td:last-child')).toHaveText(item.definition.options.map(option => option.required ? 'Yes' : 'No'))
  } else await expect(page.locator('#options + p')).toHaveText('This component has no configuration options.')
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
  // Copying changes focus/scroll, so run it after the read-only audit matrix.
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async (text: string) => { (window as unknown as { copiedInteractionExample: string }).copiedInteractionExample = text }
    } })
  })
  await copy.click()
  expect(await page.evaluate(() => (window as unknown as { copiedInteractionExample: string }).copiedInteractionExample)).toBe(exampleCode)
  expect(errors).toEqual([])
})

for (const name of ['menu', 'tab']) test(name + ': plugin behavior requires scripts', async ({ page }) => {
  const blocked: string[] = []
  await page.route('**/*', route => {
    if (route.request().resourceType() === 'script') { blocked.push(route.request().url()); return route.abort() }
    return route.continue()
  })
  await page.goto('/components/' + name + '/')
  expect(blocked.length).toBeGreaterThan(0)
  if (name === 'menu') {
    const trigger = page.getByRole('button', { name: 'Actions', exact: true })
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('#example-actions')).toBeHidden()
    await expect(page.getByRole('button', { name: 'Archive unavailable', exact: true }).first()).toBeDisabled()
  } else {
    const tabs = page.getByRole('tablist', { name: 'Profile sections', exact: true })
    const settings = tabs.getByRole('tab', { name: 'Settings', exact: true })
    await settings.click()
    await expect(settings).toHaveAttribute('aria-selected', 'false')
    await expect(tabs.getByRole('tab', { name: 'Profile', exact: true })).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('#profile')).toBeVisible()
    await expect(page.locator('#settings')).toBeHidden()
  }
})
