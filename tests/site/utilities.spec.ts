import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { publishedUtilitiesGuides } from '../helpers/utilities-mdx-contract'

// Include the explicitly disclosed application contrast sections in the model.
for (const guide of publishedUtilitiesGuides) {
  test(`Utilities: ${guide.title} has working examples and accessible content`, async ({ page, request }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`/${guide.slug}/`)
    await expect(page.locator('main h1')).toHaveText(guide.title)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', guide.description)
    await expect(page.locator('main h2')).toHaveCount(guide.sections.length)
    await expect(page.locator('#docs-sidebar a[aria-current="page"]')).toHaveAttribute('href', `/${guide.slug}/`)
    await expect(page.locator('#docs-toc-nav a')).toHaveCount(guide.sections.length)
    await expect(page.locator('.docs-page-tools a').first()).toHaveAttribute('href', `https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/${guide.slug}.mdx`)
    await expect(page.locator('.docs-page-tools a').last()).toHaveAttribute('href', guide.reference!.url)
    const links = await page.locator('main a[href^="/"]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('href')!))])
    for (const href of links) expect((await request.get(href)).status(), href).toBe(200)
    const first = guide.sections.find(section => section.code?.length)?.code![0]!
    await expect(page.locator('.docs-code pre code').first()).toHaveText(first.source)
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async (text: string) => { (window as unknown as { copiedUtilityExample: string }).copiedUtilityExample = text }
    } }))
    await page.locator('.docs-copy').first().click()
    expect(await page.evaluate(() => (window as unknown as { copiedUtilityExample: string }).copiedUtilityExample)).toBe(first.source)
    for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport)
      if (viewport.width === 390) await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([])
    }
    expect(errors).toEqual([])
  })
}

test('default utilities use canonical viewport names, logical spacing and current visibility without invented variants', async ({ page }) => {
  await page.route('**/utility-fixture/', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="en"><head><title>Utility fixture</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/dist/css/tremplin.min.css"></head><body><main><h1>Utility checks</h1><div id="responsive" class="d-none md:d-flex">Responsive</div><div id="logical" class="ms-3 ps-2">Logical spacing</div><div id="print" class="d-flex print:d-none">No default print alias</div><div id="invisible" class="invisible">Reserved space</div><button id="state" class="hover:opacity-75" type="button">No default opacity states</button></main></body></html>' }))
  await page.setViewportSize({ width: 767, height: 900 })
  await page.goto('/utility-fixture/')
  await expect(page.locator('#responsive')).toHaveCSS('display', 'none')
  await page.setViewportSize({ width: 768, height: 900 })
  await expect(page.locator('#responsive')).toHaveCSS('display', 'flex')
  for (const direction of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((element, dir) => element.setAttribute('dir', dir), direction)
    await expect(page.locator('#logical')).toHaveCSS('margin-inline-start', '8px')
    await expect(page.locator('#logical')).toHaveCSS('padding-inline-start', '6px')
  }
  await expect(page.locator('#invisible')).toHaveCSS('visibility', 'hidden')
  await page.locator('#state').hover()
  await expect(page.locator('#state')).toHaveCSS('opacity', '1')
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('#print')).toHaveCSS('display', 'flex')
})
