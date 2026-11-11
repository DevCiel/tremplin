import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import original from '../fixtures/mdx-migration/component-adaptive.before.json' with { type: 'json' }

test.use({ reducedMotion: 'reduce' })

for (const name of ['navbar', 'nav-overflow', 'toggler']) test(name + ': adaptive plugin behavior requires scripts', async ({ page }) => {
  const blocked: string[] = []
  await page.route('**/*', route => {
    if (route.request().resourceType() === 'script') { blocked.push(route.request().url()); return route.abort() }
    return route.continue()
  })
  await page.goto('/components/' + name + '/')
  expect(blocked.length).toBeGreaterThan(0)
  if (name === 'navbar') {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
    await expect(page.locator('#docs-navbar')).not.toHaveAttribute('open')
    await expect(page.locator('html')).not.toHaveClass(/dialog-open/)
    await expect(page.getByRole('navigation', { name: 'Main navigation', exact: true })).toBeVisible()
  } else if (name === 'nav-overflow') {
    const root = page.locator('#project-navigation')
    await expect(root).not.toHaveClass(/nav-overflow-initialized/)
    await expect(root.locator('.nav-overflow-toggle')).toHaveCount(0)
    // No application no-script fallback is supplied by this plugin example.
    await expect(page.locator('main')).toContainText('Provide your own no-script fallback')
  } else {
    const target = page.locator('#generic-panel')
    await page.locator('[data-trm-target="#generic-panel"]').click()
    await expect(target).not.toHaveClass(/bg-2/)
    await expect(target).toBeVisible()
  }
})

for (const item of original) test(item.name + ': authored adaptive content, API and source links', async ({ page, request }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/components/' + item.name + '/')
  await expect(page.locator('main h1')).toHaveText(item.title)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', item.description)
  await expect(page.locator('.docs-variant > h3')).toHaveText(item.detail.variants.map(variant => variant.title))
  await expect(page.locator('.docs-page-tools a').first()).toHaveAttribute('href', `https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/components/${item.name}.mdx`)
  await expect(page.locator('.docs-page-tools a').last()).toHaveAttribute('href', item.reference)
  await expect(page.locator('#docs-sidebar a[aria-current="page"]')).toHaveAttribute('href', `/components/${item.name}/`)
  if (item.definition) {
    await expect(page.locator('#javascript + p + .docs-code pre code')).toHaveText(item.javascript!)
    await expect(page.locator('#methods + ul code')).toHaveText([...item.commonMethods!, ...item.definition.methods])
    const events = page.getByRole('region', { name: 'Scrollable lifecycle events', exact: true })
    await expect(events.locator('tbody tr td:first-child code')).toHaveText(Object.keys(item.events!))
    await expect(events.locator('tbody tr td:last-child')).toHaveText(Object.values(item.events!))
    if (item.name === 'toggler') {
      const options = page.getByRole('region', { name: 'Scrollable Toggler options', exact: true })
      await expect(options.locator('tbody tr td:first-child code')).toHaveText(item.sourceOptions!.map(option => option.name))
      await expect(options.locator('tbody tr td:nth-child(3) code')).toHaveText(item.sourceOptions!.map(option => option.defaultValue))
      await expect(page.locator('main')).not.toContainText('This component has no configuration options.')
    } else {
      await expect(page.locator('#options + .table-responsive tbody tr td:first-child code')).toHaveText(item.definition.options.map(option => option.name))
      await expect(page.locator('#options + .table-responsive tbody tr td:nth-child(2) code')).toHaveText(item.definition.options.map(option => option.type))
      await expect(page.locator('#events + p')).toContainText('Runtime events use .trm.navoverflow')
    }
    const attributes = page.locator('#data-attributes').locator('xpath=following-sibling::div[1]').locator('code')
    await expect(attributes).toHaveText(item.definition.dataAttributes)
  } else {
    await expect(page.locator('#methods, #options, #events')).toHaveCount(0)
    await expect(page.locator('#javascript + p')).toContainText('Navbar layout is CSS-only')
    await expect(page.getByRole('button', { name: 'Copy Navbar application focus handler', exact: true })).toBeVisible()
  }
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

for (const item of original) for (const theme of ['light', 'dark']) test(item.name + ': authored adaptive accessibility ' + theme, async ({ page }) => {
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
