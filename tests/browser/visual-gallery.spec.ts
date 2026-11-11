import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

for (const theme of ['light', 'dark']) {
  for (const direction of ['ltr', 'rtl']) {
    test(`current gallery ${theme}/${direction} preserves layout, contrast and keyboard access`, async ({ page }, testInfo) => {
      const errors: string[] = []
      page.on('pageerror', error => errors.push(error.message))
      expect((await page.goto('/examples/visual-regression.html'))?.status()).toBe(200)
      await page.locator('html').evaluate((element, state) => {
        element.setAttribute('data-trm-theme', state.theme)
        element.setAttribute('dir', state.direction)
      }, { theme, direction })
      const metrics = await page.locator('main').evaluate(element => {
        const grid = element.querySelector('.fixture-grid')!, box = element.querySelector('.fixture-box')!
        const bar = element.querySelector('.progress-bar')!, track = element.querySelector('.progress')!
        return {
          background: getComputedStyle(element).backgroundColor,
          radius: parseFloat(getComputedStyle(box).borderRadius),
          stack: getComputedStyle(element.querySelector('.hstack')!).display,
          gap: parseFloat(getComputedStyle(element.querySelector('.hstack')!).columnGap),
          columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
          progress: bar.getBoundingClientRect().width / track.getBoundingClientRect().width,
          headingSize: parseFloat(getComputedStyle(element.querySelector('h1')!).fontSize),
          font: getComputedStyle(element.querySelector('h1')!).fontFamily,
          bodyFont: getComputedStyle(document.body).fontFamily
        }
      })
      expect(metrics.background).not.toBe('rgba(0, 0, 0, 0)')
      expect(metrics.radius).toBeGreaterThan(0)
      expect(metrics.stack).toBe('flex')
      expect(metrics.gap).toBeGreaterThan(0)
      expect(metrics.columns).toBe(2)
      expect(metrics.progress).toBeCloseTo(.64, 2)
      expect(metrics.headingSize).toBeGreaterThan(20)
      expect(metrics.headingSize).toBeLessThan(40)
      expect(metrics.font).toBe(metrics.bodyFont)
      await page.keyboard.press('Tab')
      await expect(page.getByRole('button', { name: 'Solid', exact: true })).toBeFocused()
      await page.keyboard.press('Tab')
      await expect(page.getByRole('button', { name: 'Outline', exact: true })).toBeFocused()
      await page.keyboard.press('Tab')
      await expect(page.getByLabel('Email', { exact: true })).toBeFocused()
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
      await testInfo.attach('gallery-desktop', { body: await page.screenshot({ fullPage: true, animations: 'disabled' }), contentType: 'image/png' })
      await page.setViewportSize({ width: 390, height: 844 })
      expect(await page.locator('.fixture-grid').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(1)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
      await testInfo.attach('gallery-mobile', { body: await page.screenshot({ fullPage: true, animations: 'disabled' }), contentType: 'image/png' })
      expect(errors).toEqual([])
    })
  }
}
