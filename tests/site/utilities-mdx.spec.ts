import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
const selected = ['api','background','theme','grid','gap','display','position','colors','overflow','shadows']
test.use({ reducedMotion: 'reduce' })
for (const topic of selected) test(topic + ': authored Utilities RTL light/dark accessibility and native table regions', async ({ page }) => {
  await page.goto('/utilities/' + topic + '/')
  await page.locator('html').evaluate(element => element.setAttribute('dir','rtl'))
  for (const state of [{ theme: 'light', width: 1280 }, { theme: 'dark', width: 390 }]) {
    await page.locator('html').evaluate((element, theme) => element.setAttribute('data-trm-theme', theme), state.theme)
    await page.setViewportSize({ width: state.width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze()).violations).toEqual([])
  }
  if (topic === 'api') {
    const tables = page.locator('main .table-responsive[role="region"]')
    await expect(tables).toHaveCount(2)
    await expect(tables.first()).toHaveAttribute('tabindex','0')
    await tables.first().focus(); await expect(tables.first()).toBeFocused()
    await expect(tables.first()).toHaveAccessibleName('Options')
  }
})
test.describe('native Utilities without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  for (const topic of ['api','background','theme','grid','position','overflow']) test(topic + ': authored content and native controls remain available', async ({ page }) => {
    await page.goto('/utilities/' + topic + '/')
    await expect(page.locator('main h1')).not.toBeEmpty()
    await expect(page.locator('main .docs-section')).not.toHaveCount(0)
    await expect(page.locator('main .docs-code pre').first()).toBeVisible()
    if (topic === 'api') {
      const region = page.getByRole('region', { name: 'Options', exact: true }).and(page.locator('.table-responsive'))
      await region.focus(); await expect(region).toBeFocused()
    }
  })
})
test('Utilities overview links to all 48 topics and copies canonical examples', async ({ page, request }) => {
  await page.goto('/utilities/')
  await expect(page.locator('main h1')).toHaveText('Utilities')
  const links = await page.locator('main a[href^="/utilities/"]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('href')!))])
  expect(links).toHaveLength(48)
  for (const href of links) expect((await request.get(href)).status(), href).toBe(200)
  await expect(page.locator('main pre').nth(0)).toContainText('md:row-cols-2 lg:row-cols-4')
  await expect(page.locator('main pre').nth(1)).toContainText('btn-solid theme-inverse')
  expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag22aa']).analyze()).violations).toEqual([])
})
