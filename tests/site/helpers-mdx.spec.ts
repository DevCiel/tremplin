import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import original from '../fixtures/mdx-migration/helpers.before.json' with { type: 'json' }

test.use({ reducedMotion: 'reduce' })
for (const guide of original.published) for (const theme of ['light', 'dark']) test(guide.slug + ': authored MDX ' + theme + ' desktop/mobile LTR/RTL accessibility', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/' + guide.slug + '/')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', guide.description)
  await expect(page.locator('main .docs-section > h2')).toHaveText(guide.sections.map(section => section.heading))
  const firstCode = guide.sections.find(section => 'code' in section && section.code?.length)
  if (firstCode && 'code' in firstCode) {
    const source = firstCode.code![0]!.source
    await expect(page.locator('.docs-code pre code').first()).toHaveText(source)
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async (text: string) => { (window as unknown as { copiedHelperExample: string }).copiedHelperExample = text }
    } }))
    await page.locator('.docs-copy').first().click()
    expect(await page.evaluate(() => (window as unknown as { copiedHelperExample: string }).copiedHelperExample)).toBe(source)
  }
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

test.describe('native helpers without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  for (const guide of original.published) test(guide.slug + ': authored examples remain usable', async ({ page }) => {
    await page.goto('/' + guide.slug + '/')
    await expect(page.locator('main h1')).toHaveText(guide.title)
    await expect(page.locator('main .docs-section > h2')).toHaveCount(guide.sections.length)
    await expect(page.locator('.docs-example').first()).toBeVisible()
    const nativeLink = page.locator('.docs-example a').first()
    if (await nativeLink.count()) await expect(nativeLink).toHaveAttribute('href', /^(?:\/|#)/)
    if (guide.slug === 'helpers/visually-hidden') {
      await page.locator('#helper-skip-example').focus()
      await expect(page.locator('#helper-skip-example')).toHaveCSS('clip', 'auto')
      await page.locator('#helper-skip-example').press('Enter')
      await expect(page.locator('#helper-skip-target')).toBeFocused()
    }
    if (guide.slug === 'helpers/stretched-link') {
      await page.locator('#helper-stretched-link').press('Enter')
      await expect(page).toHaveURL(/\/layout\/grid\/$/)
    }
  })
})
