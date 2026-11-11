import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('documentation matches the measured Bootstrap 6 font scale and desktop columns', async ({ page, request }) => {
  await page.setViewportSize({ width: 1920, height: 911 })
  await page.goto('/getting-started/install/')
  await page.evaluate(() => document.fonts.ready)
  const actual = await page.evaluate(() => {
    const heading = getComputedStyle(document.querySelector('h1')!)
    const body = getComputedStyle(document.body)
    const code = getComputedStyle(document.querySelector('.docs-code pre')!)
    const shell = document.querySelector('.docs-shell')!.getBoundingClientRect()
    const main = document.querySelector('.docs-main')!.getBoundingClientRect()
    const sidebar = document.querySelector('.docs-sidebar')!.getBoundingClientRect()
    const outline = document.querySelector('.docs-toc')!.getBoundingClientRect()
    return {
      textFamily: body.fontFamily, codeFamily: code.fontFamily,
      bodySize: body.fontSize, bodyLine: body.lineHeight,
      titleSize: heading.fontSize, titleWeight: heading.fontWeight, titleLine: heading.lineHeight,
      codeSize: code.fontSize, shellWidth: shell.width,
      contentWidth: main.width - parseFloat(getComputedStyle(document.querySelector('.docs-main')!).paddingInlineStart),
      columnsOrdered: sidebar.right < main.left && main.right < outline.left,
      // Firefox serializes multi-word family names with quotes; compare the
      // actual family identity, retaining the loaded-face requirement.
      loadedFonts: [...document.fonts].filter(font => font.status === 'loaded').map(font => font.family.replace(/^(['"])(.*)\1$/, '$2'))
    }
  })
  expect(actual.textFamily).toMatch(/^Geist,/)
  expect(actual.codeFamily).toContain('Geist Mono')
  expect(actual.loadedFonts).toEqual(expect.arrayContaining(['Geist', 'Geist Mono']))
  expect(actual).toMatchObject({ bodySize: '16px', bodyLine: '24px', titleSize: '40px', titleWeight: '500', titleLine: '48px', codeSize: '13px', shellWidth: 1440, columnsOrdered: true })
  expect(actual.contentWidth).toBeCloseTo(875, 0)
  for (const path of ['/geist-latin.woff2', '/geist-mono-latin.woff2']) {
    const response = await request.get(path)
    expect(response.headers()['content-type']).toContain('font/woff2')
  }
})

for (const theme of ['light', 'dark']) {
  test(`mobile ${theme} documentation preserves reflow and accessible syntax contrast`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/getting-started/install/')
    if (theme === 'dark') await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
    await page.evaluate(() => document.fonts.ready)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expect(page.locator('#docs-sidebar')).toBeHidden()
    const packageTable = page.locator('div.table-responsive[role="region"][aria-labelledby="section-1"]')
    await expect(packageTable).toHaveAccessibleName('Using npm')
    await expect(packageTable).toHaveAttribute('tabindex', '0')
    const horizontalOverflow = await packageTable.evaluate(element => element.scrollWidth > element.clientWidth)
    await packageTable.focus()
    await expect(packageTable).toBeFocused()
    // Firefox can fit the content without overflow. Keep focus and Axe checks
    // in every engine; require keyboard movement when scrolling is available.
    if (horizontalOverflow) {
      await page.keyboard.press('ArrowRight')
      await expect.poll(() => packageTable.evaluate(element => element.scrollLeft)).toBeGreaterThan(0)
    }
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    expect(results.violations).toEqual([])
  })
}
