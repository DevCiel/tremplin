import { expect, test } from '@playwright/test'

// Published documentation needs the site-dist server. Repository wrappers keep
// css-grid.spec.ts's intercepted runtime fixtures; this page stays in test:site.
test('published CSS Grid examples resize with their own container and fit narrow pages', async ({ page }) => {
  const response = await page.goto('/layout/css-grid/')
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1')).toHaveText('CSS Grid')
  const grid = page.locator('[data-layout-demo="modern-query"]')
  await expect(grid).toHaveCSS('container-type', 'inline-size')
  for (const [width, span] of [[500, 'span 12'], [600, 'span 6']] as const) {
    await grid.evaluate((element, value) => { element.style.width = value + 'px'; element.style.maxInlineSize = 'none' }, width)
    await expect(grid.locator('div').first()).toHaveCSS('grid-column-end', span)
  }
  await grid.evaluate(element => { element.style.removeProperty('width'); element.style.maxInlineSize = '100%' })
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expect(page.getByRole('heading', { name: 'Focused Grid bundle', exact: true })).toBeVisible()
})
