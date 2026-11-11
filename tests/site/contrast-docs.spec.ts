import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const routes = ['components/alert', 'components/avatar', 'components/badge', 'components/button', 'components/chip', 'components/datepicker', 'components/drawer', 'components/list-group', 'components/pagination', 'components/progress', 'helpers/stretched-link', 'utilities/background', 'utilities/theme']
for (const theme of ['light', 'dark']) for (const route of routes) test(`${theme} demo contrast: ${route}`, async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`/${route}/`)
  await page.locator('html').evaluate((element, value) => element.setAttribute('data-trm-theme', value), theme)
  // The body scheme changes immediately, but nav-link colors transition.
  // Audit the requested stable theme, not a half-painted transition frame.
  // Keep normal motion and all WCAG checks; wait for the actual final color.
  // Use a concrete theme-state assertion, not every sidebar animation's lifetime.
  const neutralLink = page.locator('#docs-sidebar .nav-link:visible:not([aria-current])').first()
  const settledColor = await neutralLink.evaluate(element => {
    const probe = document.createElement('span')
    probe.style.color = 'var(--docs-muted)'
    element.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  })
  await expect(neutralLink).toHaveCSS('color', settledColor)
  await expect(page.getByText(/Explicit demo contrast customization/).first()).toBeVisible()
  await expect(page.locator('.demo-contrast').first()).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(results.violations).toEqual([])
  expect(errors).toEqual([])
})

test('calendar popup carries the copyable contrast class despite being appended to body', async ({ page }) => {
  await page.goto('/components/datepicker/')
  await page.locator('#deadline').click()
  const calendar = page.locator('[data-vc="calendar"][data-vc-input]')
  await expect(calendar).toHaveClass(/demo-calendar-contrast/)
  await expect(calendar).not.toHaveAttribute('aria-hidden', 'true')
  await expect(calendar).toHaveCSS('opacity', '1')
  expect(await calendar.evaluate(element => element.hasAttribute('inert'))).toBe(false)
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(results.violations).toEqual([])
})
