import { expect, test } from '@playwright/test'
import { auditDocumentationPage } from './audit-page.fixture'

test('Playground parent and equivalent inert preview pass without relaxing the sandbox', async ({ page }) => {
  await page.goto('/playground/')
  const result = await auditDocumentationPage(page)
  await expect(page.locator('#search input')).toHaveAttribute('aria-label', 'Search documentation')
  expect(result.previewAudit?.renderEquivalent).toBe(true)
  expect(result.previewAudit!.renderedElements).toBeGreaterThan(5)
  expect(result.violations).toEqual([])
  await expect(page.locator('#preview')).toHaveAttribute('sandbox', 'allow-same-origin')
})

test('the preview audit detects a real accessibility failure instead of excluding the frame', async ({ page }) => {
  await page.goto('/playground/')
  await page.locator('#markup').fill('<main><h1>Negative control</h1><button></button></main>')
  await expect(page.frameLocator('#preview').locator('h1')).toHaveText('Negative control')
  const result = await auditDocumentationPage(page)
  expect(result.previewAudit?.renderEquivalent).toBe(true)
  expect(result.previewAudit!.previewViolations.some(violation => violation.id === 'button-name')).toBe(true)
  expect(result.violations.some(violation => violation.id === 'button-name')).toBe(true)
})

test('pasted scripts and event handlers stay blocked in the live preview', async ({ page }) => {
  await page.goto('/playground/')
  await page.locator('#markup').fill('<main><h1>Sandbox check</h1><script>window.playgroundExecuted=true</script><button onclick="window.playgroundExecuted=true">Safe button</button></main>')
  const frame = page.frameLocator('#preview')
  await expect(frame.locator('h1')).toHaveText('Sandbox check')
  await frame.getByRole('button', { name: 'Safe button' }).click()
  expect(await frame.locator('body').evaluate(() => Boolean((window as any).playgroundExecuted))).toBe(false)
  await expect(page.locator('#preview')).toHaveAttribute('sandbox', 'allow-same-origin')
})

test('Playground has usable desktop columns and stacks without narrow strips on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/playground/')
  const editor = await page.locator('#markup').boundingBox(), preview = await page.locator('#preview').boundingBox()
  expect(editor!.width).toBeGreaterThan(300)
  expect(preview!.width).toBeGreaterThan(300)
  expect(preview!.x).toBeGreaterThan(editor!.x + editor!.width)
  await page.setViewportSize({ width: 390, height: 844 })
  const mobileEditor = await page.locator('#markup').boundingBox(), mobilePreview = await page.locator('#preview').boundingBox()
  expect(mobileEditor!.width).toBeGreaterThan(280)
  expect(mobilePreview!.width).toBeGreaterThan(280)
  expect(mobilePreview!.y).toBeGreaterThan(mobileEditor!.y + mobileEditor!.height)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
