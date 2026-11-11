import { registryInstallCommand } from '../../site/src/data/installation-examples'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('reference entry layout keeps desktop proportions and honest installation status', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 911 })
  await page.goto('/')
  await expect(page.locator('.docs-install-command code')).toHaveText(registryInstallCommand)
  await expect(page.getByRole('link', { name: 'For AI tools', exact: true })).toHaveAttribute('href', '/getting-started/ai/')
  expect(await page.locator('.docs-hero h1').evaluate(element => getComputedStyle(element).fontSize)).toBe('48px')
  await page.goto('/getting-started/install/')
  const title = page.locator('main h1')
  expect(await title.evaluate(element => getComputedStyle(element).fontFamily)).toContain('Geist')
  const box = (await title.boundingBox())!
  expect(box.x).toBeGreaterThan(500)
  expect(box.x).toBeLessThan(540)
  await expect(page.locator('.docs-section').first()).toContainText('unreleased development preview')
  await expect(page.locator('.docs-main > .docs-callout')).toHaveCount(0)
  const panel = page.getByRole('tabpanel')
  await expect(panel).toContainText('npm i tremplin')
  expect((await panel.locator('.docs-copy').boundingBox())!.y).toBeLessThan((await panel.boundingBox())!.y)
})

for (const theme of ['light', 'dark']) {
  test(`homepage styling resolves strict tokens in ${theme}`, async ({ page }) => {
    await page.goto('/')
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-trm-theme', value), theme)
    await expect(page.locator('.docs-hero h1')).toContainText('framework for everyone')
    expect(await page.locator('.docs-hero').evaluate(element => getComputedStyle(element, '::before').backgroundImage)).not.toBe('none')
    expect(await page.locator('.docs-hero h1').evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeLessThanOrEqual(48)
    expect(await page.locator('.docs-brand-mark').first().evaluate(element => getComputedStyle(element).backgroundImage)).not.toBe('none')
    expect(await page.locator('.docs-hero-actions').evaluate(element => getComputedStyle(element).display)).toBe('flex')
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    expect(result.violations).toEqual([])
  })

  test(`guide headings and nested theme examples retain independent styling in ${theme}`, async ({ page }) => {
    await page.goto('/getting-started/install/')
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-trm-theme', value), theme)
    expect(await page.locator('.docs-main').evaluate(element => getComputedStyle(element).display)).toBe('block')
    const heading = page.locator('.docs-section > h3').first()
    const paragraph = heading.locator('xpath=following-sibling::p[1]')
    expect((await paragraph.boundingBox())!.y - ((await heading.boundingBox())!.y + (await heading.boundingBox())!.height)).toBeGreaterThanOrEqual(8)
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    expect(result.violations).toEqual([])
  })
}

test('Command Palette uses one runtime, opens, filters and restores focus', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/components/command-palette/')
  const example = page.locator('.docs-example').first()
  const trigger = example.locator('[data-trm-toggle="command-palette"]')
  // Safari does not focus buttons on pointer activation. Start from a real
  // keyboard-focused opener so restoration has the same contract in all engines.
  await trigger.focus()
  await trigger.press('Enter')
  const palette = example.locator('.command-palette')
  await expect(palette).toBeVisible()
  const input = palette.locator('.command-palette-input')
  await expect(input).toBeFocused()
  await input.fill('settings')
  await expect(palette.locator('.command-item:not([hidden])')).toHaveCount(1)
  await expect(palette.locator('.command-item:not([hidden])')).toContainText('Preview settings')
  await input.press('Escape')
  await expect(palette).toBeHidden()
  await expect(trigger).toBeFocused()
  expect(await page.locator('script[src*="tremplin"]').count()).toBe(1)
  expect(errors).toEqual([])
})

test('copy icon remains a named SVG button and mobile docs navigation works', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/getting-started/install/')
  const copy = page.locator('.docs-copy').first()
  await expect(copy.locator('svg use')).toHaveAttribute('href', '/docs-icons.svg#copy')
  await expect(copy).toHaveAttribute('aria-label', /Copy/)
  const toggle = page.getByRole('button', { name: 'Toggle documentation navigation' })
  await toggle.click()
  await expect(page.locator('#docs-sidebar')).toBeVisible()
  await toggle.press('Escape')
  await expect(page.locator('#docs-sidebar')).toBeHidden()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
