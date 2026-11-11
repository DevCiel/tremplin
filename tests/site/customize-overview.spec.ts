import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { customizeExamples } from '../../site/src/data/customize-examples'

test.use({ reducedMotion: 'reduce' })
test('Customize overview copies the working Sass recipe and keeps guides accessible', async ({ page, request }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/customize/')
  await expect(page.locator('main h1')).toHaveText('Customize Tremplin')
  const source = customizeExamples['customize/sass#2']!.code[0]!.source
  await expect(page.locator('main .docs-code pre code')).toHaveText(source)
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
    writeText: async (text: string) => { (window as unknown as { copiedSassRecipe: string }).copiedSassRecipe = text }
  } }))
  await page.locator('main .docs-copy').click()
  expect(await page.evaluate(() => (window as unknown as { copiedSassRecipe: string }).copiedSassRecipe)).toBe(source)
  const links = await page.locator('main a[href^="/"]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('href')!))])
  for (const href of links) expect((await request.get(href)).status(), href).toBe(200)
  for (const state of [
    { theme: 'light', dir: 'ltr', width: 1280 }, { theme: 'dark', dir: 'ltr', width: 390 },
    { theme: 'light', dir: 'rtl', width: 1280 }, { theme: 'dark', dir: 'rtl', width: 390 }
  ]) {
    await page.locator('html').evaluate((element, state) => { element.setAttribute('dir', state.dir); element.setAttribute('data-trm-theme', state.theme) }, state)
    await page.setViewportSize({ width: state.width, height: 900 })
    await page.evaluate(() => window.scrollTo(0, 0))
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze()).violations).toEqual([])
  }
  expect(errors).toEqual([])
})
