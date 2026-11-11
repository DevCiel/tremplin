import { expect, test } from '@playwright/test'

test('copy controls use the reference SVG sizes and copy the active package command', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async (text: string) => { (window as any).copiedCode = text }
    } })
  })
  await page.goto('/getting-started/install/')
  await page.getByRole('tab', { name: 'pnpm', exact: true }).click()
  const panel = page.getByRole('tabpanel')
  const button = panel.locator('.docs-copy')
  await expect(button).toHaveAttribute('aria-label', 'Copy pnpm install command')
  await expect(button.locator('svg use')).toHaveAttribute('href', '/docs-icons.svg#copy')
  const sizes = await button.evaluate(element => ({
    button: element.getBoundingClientRect().width,
    height: element.getBoundingClientRect().height,
    svg: element.querySelector('svg')!.getBoundingClientRect().width
  }))
  expect(sizes).toEqual({ button: 24, height: 24, svg: 16 })
  const command = await panel.locator('code').textContent()
  await page.clock.install()
  await button.click()
  await expect(button).toHaveAttribute('aria-label', 'Copied')
  await expect(button.locator('svg use')).toHaveAttribute('href', '/docs-icons.svg#check2')
  expect(await page.evaluate(() => (window as any).copiedCode)).toBe(command)
  await expect(page.locator('#docs-copy-status')).toHaveText('Code copied to clipboard.')
  await page.clock.fastForward(1600)
  await expect(button).toHaveAttribute('aria-label', 'Copy pnpm install command')
  await expect(button.locator('svg use')).toHaveAttribute('href', '/docs-icons.svg#copy')
})

test('blocked clipboard access reports a recoverable error without removing the icon', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async () => { throw new Error('Permission denied') }
    } })
  })
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/getting-started/install/')
  const button = page.getByRole('tabpanel').getByRole('button')
  await button.click()
  await expect(page.locator('#docs-copy-status')).toContainText('copy it manually')
  await expect(button.locator('svg use')).toHaveAttribute('href', '/docs-icons.svg#copy')
  expect(errors).toEqual([])
})

test('sidebar and edit links use local Bootstrap icon symbols with license attribution', async ({ page, request }) => {
  await page.goto('/getting-started/install/')
  await expect(page.locator('.docs-guide-nav summary svg use').first()).toHaveAttribute('href', '/docs-icons.svg#book-half')
  await expect(page.locator('.docs-page-tools .docs-edit-icon use')).toHaveAttribute('href', '/docs-icons.svg#github')
  const sprite = await request.get('/docs-icons.svg')
  expect(sprite.status()).toBe(200)
  expect(await sprite.text()).toContain('id="copy"')
  const license = await request.get('/docs-icons-LICENSE.txt')
  expect(license.status()).toBe(200)
  expect(await license.text()).toContain('The Bootstrap Authors')
})
