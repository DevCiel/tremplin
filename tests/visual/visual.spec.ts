import { expect, test } from '@playwright/test'

test('core component gallery matches its visual baseline', async ({ page }) => {
  await page.goto('/examples/visual-regression.html')
  await expect(page.locator('main')).toHaveScreenshot('core-components.png')
})

test('RTL component gallery matches its visual baseline', async ({ page }) => {
  await page.goto('/examples/visual-regression.html?rtl')
  await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
  await expect(page.locator('main')).toHaveScreenshot('core-components-rtl.png')
})
