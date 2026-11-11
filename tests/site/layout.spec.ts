import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { layoutGuides } from '../helpers/layout-content-contract'

for (const guide of layoutGuides) {
  test(`Layout: ${guide.title} has working navigation and accessible examples`, async ({ page, request }) => {
    await page.goto(`/${guide.slug}/`)
    await expect(page.locator('main h1')).toHaveText(guide.title)
    await expect(page.locator('main h2')).toHaveCount(guide.sections.length)
    await expect(page.locator('#docs-sidebar a[aria-current="page"]')).toHaveAttribute('href', `/${guide.slug}/`)
    await expect(page.locator('#docs-toc-nav a')).toHaveCount(guide.sections.length)
    await expect(page.locator('.docs-page-tools a').first()).toHaveAttribute('href', `https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/${guide.slug}.mdx`)
    await expect(page.locator('.docs-page-tools a').last()).toHaveAttribute('href', guide.reference!.url)
    const links = await page.locator('main a[href^="/"]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('href')!))])
    for (const href of links) expect((await request.get(href)).status(), href).toBe(200)
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([])
    await page.setViewportSize({ width: 390, height: 844 })
    await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([])
  })
}

test('documented grid and zero-offset examples respond at the local md boundary in LTR and RTL', async ({ page }) => {
  await page.goto('/layout/grid/')
  for (const width of [767, 768]) {
    await page.setViewportSize({ width, height: 900 })
    const ratio = await page.locator('[data-layout-demo="responsive"]').evaluate(row => {
      const child = row.firstElementChild!
      return child.getBoundingClientRect().width / row.getBoundingClientRect().width
    })
    expect(ratio).toBeCloseTo(width < 768 ? 1 : 1 / 3, 2)
  }
  await page.goto('/layout/columns/')
  for (const direction of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((element, dir) => element.setAttribute('dir', dir), direction)
    for (const width of [767, 768]) {
      await page.setViewportSize({ width, height: 900 })
      const offset = await page.locator('[data-layout-demo="offset"]').evaluate(row => ({
        margin: parseFloat(getComputedStyle(row.firstElementChild!).marginInlineStart),
        width: row.getBoundingClientRect().width
      }))
      expect(offset.margin / offset.width).toBeCloseTo(width < 768 ? .25 : 0, 2)
    }
  }
})

test('modern CSS Grid guide example responds to its own shared sm boundary', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1200 })
  await page.goto('/layout/css-grid/')
  const grid = page.locator('[data-layout-demo="modern-query"]')
  await expect(grid).toHaveCSS('container-type', 'inline-size')
  for (const width of [575, 576]) {
    await grid.evaluate((element, value) => { element.style.width = `${value}px` }, width)
    await expect(grid.locator('> *').first()).toHaveCSS('grid-column-start', 'auto')
    await expect(grid.locator('> *').first()).toHaveCSS('grid-column-end', width < 576 ? 'span 12' : 'span 6')
  }
})

test('CSS Grid row-token guide example creates two explicit equal rows', async ({ page }) => {
  await page.goto('/layout/css-grid/')
  const grid = page.locator('[data-layout-demo="grid-rows"]')
  await expect(grid).toHaveCSS('--trm-rows', '2')
  await expect(grid).toHaveCSS('grid-template-rows', '60px 60px')
  await expect(grid).toHaveCSS('gap', '8px')
})

test('grid guide demonstrates the focused bundle utilities and documents its reset dependency', async ({ page }) => {
  await page.goto('/layout/grid/')
  const demo = page.locator('[data-layout-demo="grid-utilities"]')
  await page.setViewportSize({ width: 767, height: 900 })
  await expect(demo).toHaveCSS('flex-direction', 'column')
  await page.setViewportSize({ width: 768, height: 900 })
  await expect(demo).toHaveCSS('flex-direction', 'row')
  await expect(demo).toHaveCSS('gap', '8px')
  await expect(page.locator('main')).toContainText('Grid-only CSS deliberately excludes Reboot')
  await page.goto('/layout/css-grid/')
  await expect(page.locator('main')).toContainText('CSS Grid is enabled by default in the Tremplin core.')
})

test('breakpoint guide demonstrates only the canonical largest tier at its boundary', async ({ page }) => {
  await page.goto('/layout/breakpoints/')
  await expect(page.locator('main')).toContainText('The default Sass map has six keys')
  const row = page.locator('[data-layout-demo="largest-canonical"]')
  for (const width of [1535, 1536]) {
    await page.setViewportSize({ width, height: 1000 })
    const ratios = await row.evaluate(element => [...element.children].map(child => child.getBoundingClientRect().width / element.getBoundingClientRect().width))
    for (const ratio of ratios) expect(ratio).toBeCloseTo(width < 1536 ? 1 : .5, 2)
  }
})
