import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { contentGuides } from '../helpers/layout-content-contract'

for (const guide of contentGuides) {
  test(`Content: ${guide.title} has working examples and accessible documentation`, async ({ page, request }) => {
    await page.goto(`/${guide.slug}/`)
    await expect(page.locator('main h1')).toHaveText(guide.title)
    await expect(page.locator('main h2')).toHaveCount(guide.sections.length)
    await expect(page.locator('#docs-sidebar a[aria-current="page"]')).toHaveAttribute('href', `/${guide.slug}/`)
    await expect(page.locator('#docs-toc-nav a')).toHaveCount(guide.sections.length)
    await expect(page.locator('.docs-page-tools a').first()).toHaveAttribute('href', `https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/${guide.slug}.mdx`)
    await expect(page.locator('.docs-page-tools a').last()).toHaveAttribute('href', guide.reference!.url)
    const links = await page.locator('main a[href^="/"]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('href')!))])
    for (const href of links) expect((await request.get(href)).status(), href).toBe(200)
    for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport)
      if (viewport.width === 390) await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([])
    }
  })
}

test('content examples render against framework CSS without documentation overrides', async ({ page }) => {
  const selected = ['Responsive images', 'Display headings and lead text', 'Responsive tables']
  const examples = contentGuides.flatMap(guide => guide.sections.flatMap(section => section.example && selected.includes(section.heading) ? [section.example] : [])).join('\n')
  await page.route('**/content-fixture/', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Content fixture</title><link rel="stylesheet" href="/dist/css/tremplin.min.css"></head><body><main style="inline-size:320px;max-inline-size:100%;margin-inline:auto"><h1>Content examples</h1>${examples}</main></body></html>` }))
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/content-fixture/')
  const image = page.locator('[data-content-demo="image"] img')
  await expect.poll(() => image.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBe(800)
  const box = await image.boundingBox()
  expect(box!.width).toBeCloseTo(320, 0)
  expect(box!.height).toBeCloseTo(160, 0)
  expect(await page.locator('body').evaluate(element => parseFloat(getComputedStyle(element).lineHeight))).toBeCloseTo(24, 1)
  expect(await page.locator('.fw-light').evaluate(element => getComputedStyle(element).fontWeight)).toBe('300')
  const scroll = page.locator('[data-content-demo="table-scroll"]')
  await scroll.locator('table').evaluate(element => { (element as HTMLElement).style.minInlineSize = '768px' })
  expect(await scroll.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('active table state and hover follow the pinned cell-layer cascade', async ({ page }) => {
  await page.route('**/table-state-fixture/', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="en" data-trm-theme="light"><head><title>Table state</title><link rel="stylesheet" href="/dist/css/tremplin.min.css"></head><body><main><h1>Table state</h1><table class="table table-striped table-hover" style="--trm-table-color:#000;--trm-table-bg:#fff"><caption>States</caption><tbody><tr class="table-active"><th scope="row">First</th><td id="row-state">Active row</td></tr><tr><th scope="row">Second</th><td id="cell-state" class="table-active">Active cell</td></tr></tbody></table><div id="active-probe" style="box-shadow:inset 0 0 0 9999px color-mix(in srgb,black 10%,transparent)">Expected active</div><div id="hover-probe" style="box-shadow:inset 0 0 0 9999px color-mix(in srgb,black 7.5%,transparent)">Expected hover</div></main></body></html>' }))
  await page.goto('/table-state-fixture/')
  const shadow = (selector: string) => page.locator(selector).evaluate(element => getComputedStyle(element).boxShadow)
  const active = await shadow('#active-probe'), hover = await shadow('#hover-probe')
  for (const id of ['#row-state', '#cell-state']) {
    await page.mouse.move(0, 0)
    await expect.poll(() => shadow(id)).toBe(active)
    await page.locator(id).hover()
    await expect.poll(() => shadow(id)).toBe(hover)
  }
})

test('not-prose excludes descendant spacing but not inherited text or parent flex layout', async ({ page }) => {
  await page.route('**/prose-fixture/', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="en"><head><title>Prose fixture</title><link rel="stylesheet" href="/dist/css/tremplin.min.css"></head><body><main class="prose"><h1>Article</h1><div><p>Introduction</p><h3 id="normal-heading">Normal heading</h3><ul><li id="normal-item">First</li><li>Second</li></ul></div><div class="not-prose"><p>Introduction</p><h3 id="excluded-heading">Embedded heading</h3><ul><li id="excluded-item">First</li><li>Second</li></ul></div></main></body></html>' }))
  await page.goto('/prose-fixture/')
  const margin = (selector: string, property: 'marginTop' | 'marginBottom') => page.locator(selector).evaluate((element, key) => parseFloat(getComputedStyle(element)[key]), property)
  expect(await margin('#normal-heading', 'marginTop')).toBeGreaterThan(0)
  expect(await margin('#normal-item', 'marginBottom')).toBeGreaterThan(0)
  expect(await margin('#excluded-heading', 'marginTop')).toBe(0)
  expect(await margin('#excluded-item', 'marginBottom')).toBe(0)
  await expect(page.locator('main')).toHaveCSS('display', 'flex')
  await expect(page.locator('main')).toHaveCSS('max-width', '1000px')
  expect(await page.locator('main').evaluate(element => parseFloat(getComputedStyle(element).gap))).toBeGreaterThan(0)
})

test('stacked tables follow the ancestor container, not the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/content/tables/')
  const wrapper = page.locator('.docs-example .table-card .table-responsive')
  const cell = wrapper.locator('tbody td').nth(1)
  for (const width of [767, 768]) {
    await wrapper.evaluate((element, size) => { element.style.width = size + 'px'; element.style.maxWidth = 'none' }, width)
    await expect(cell).toHaveCSS('display', width < 768 ? 'block' : 'table-cell')
    if (width < 768) expect(await cell.evaluate(element => getComputedStyle(element, '::before').content)).toBe('"Status"')
  }
})
