import { expect, test } from '@playwright/test'

test('homepage matches the Tremplin Bootstrap-style shell', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('main')).toHaveScreenshot('homepage.png')
})

test('installation guide matches the Tremplin Bootstrap-style shell', async ({ page }) => {
  await page.goto('/getting-started/install/')
  await expect(page.locator('main')).toHaveScreenshot('installation-guide.png')
})

for (const [name, route] of [['homepage','/'],['installation-guide','/getting-started/install/']]) for (const theme of ['dark','rtl']) test(`${name} ${theme} reviewed presentation`, async ({page}) => {
  await page.goto(route!)
  await page.locator('html').evaluate((element,state) => {element.setAttribute('data-trm-theme',state==='dark'?'dark':'light');element.setAttribute('dir',state==='rtl'?'rtl':'ltr')}, theme)
  await expect(page.locator('main')).toHaveScreenshot(`${name}-${theme}.png`)
})
