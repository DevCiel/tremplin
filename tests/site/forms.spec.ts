import { formsGuides } from '../helpers/forms-mdx-contract'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { publishedFormsGuides as guides } from '../helpers/forms-mdx-contract'
import { openScopedValidation } from './scoped-validation.fixture'

for (const guide of formsGuides) {
  test(`Forms: ${guide.title} has accessible examples and working navigation`, async ({ page, request }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`/${guide.slug}/`)
    await expect(page.locator('main h1')).toHaveText(guide.title)
    const published = guides.find(entry => entry.slug === guide.slug)!
    // Includes the explicit contrast section; excludes widget-internal headings.
    await expect(page.locator('main > .docs-section > :is(h2, h3)')).toHaveText(published.sections.map(section => section.heading))
    await expect(page.locator('#docs-sidebar a[aria-current="page"]')).toHaveAttribute('href', `/${guide.slug}/`)
    await expect(page.locator('#docs-toc-nav a')).toHaveCount(published.sections.length)
    for (let index = 0; index < published.sections.length; index++) await expect(page.locator('#docs-toc-nav a').nth(index)).toHaveAttribute('href', '#section-' + index)
    await expect(page.locator('.docs-page-tools a').first()).toHaveAttribute('href', `https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/${guide.slug}.mdx`)
    await expect(page.locator('.docs-page-tools a').last()).toHaveAttribute('href', guide.reference!.url)
    const links = await page.locator('main a[href^="/"]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('href')!))])
    for (const href of links) expect((await request.get(href)).status(), href).toBe(200)
    for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport)
      if (viewport.width === 390) await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([])
    }
    expect(errors).toEqual([])
  })
}

test('validation demo focuses its summary, recovers errors, and sends no requests', async ({ page }) => {
  await page.goto('/forms/validation/')
  const submissions: string[] = []
  page.on('request', request => { if (request.isNavigationRequest() || request.method() === 'POST') submissions.push(request.url()) })
  const form = page.locator('#forms-validation-demo')
  await form.getByRole('button', { name: 'Check details' }).click()
  await expect(form.locator('[data-error-summary]')).toBeFocused()
  await expect(form.locator('.invalid-feedback')).toBeVisible()
  await expect(form.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  await form.getByRole('link', { name: 'Enter a valid email address' }).click()
  await expect(form.getByRole('textbox')).toBeFocused()
  await form.getByRole('textbox').fill('demo@example.com')
  await form.getByRole('button', { name: 'Check details' }).click()
  await expect(form.locator('[data-error-summary]')).toBeHidden()
  await expect(form.getByRole('status')).toHaveText('Valid. This demo does not send data.')
  await expect(form.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false')
  await expect(form.locator('.invalid-feedback')).toBeHidden()
  await page.locator('#forms-native-email').fill('demo@example.com')
  await page.getByRole('button', { name: 'Try native validation' }).click()
  expect(submissions).toEqual([])
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([])
})

test('checkbox, radio, and switch examples preserve native keyboard behavior', async ({ page }) => {
  await page.goto('/forms/checkbox/')
  const checkbox = page.locator('#forms-checkbox-updates')
  await checkbox.focus()
  await checkbox.press('Space')
  await expect(checkbox).toBeChecked()
  await page.locator('#forms-checkbox-partial').evaluate(element => { (element as HTMLInputElement).indeterminate = true })
  await expect(page.locator('#forms-checkbox-partial')).toHaveJSProperty('indeterminate', true)
  await page.goto('/forms/radio/')
  await page.locator('#forms-radio-monthly').focus()
  await page.keyboard.press('ArrowDown')
  await expect(page.locator('#forms-radio-yearly')).toBeChecked()
  await page.goto('/forms/switch/')
  const toggle = page.getByRole('switch', { name: 'Enable notifications' })
  await toggle.focus()
  await toggle.press('Space')
  await expect(toggle).toBeChecked()
})

test('chip, combobox, OTP, range, and strength examples operate from the browser bundle', async ({ page }) => {
  await page.goto('/forms/chips/')
  await page.getByRole('textbox', { name: 'Project tags', exact: true }).fill('Testing')
  await page.getByRole('textbox', { name: 'Project tags', exact: true }).press('Enter')
  const testing = page.locator('#forms-chips .chip').filter({ hasText: 'Testing' })
  await expect(testing.getByRole('button', { name: 'Remove', exact: true })).toBeVisible()
  await testing.getByRole('button', { name: 'Remove', exact: true }).click()
  await expect(testing).toHaveCount(0)
  await page.goto('/forms/combobox/')
  const city = page.locator('#forms-combo-city')
  await city.click()
  const search = page.getByRole('searchbox', { name: 'Search City', exact: true })
  await search.fill('Lon')
  await search.press('ArrowDown')
  await expect(page.locator('#forms-combo-city-menu [data-trm-value="lon"]')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(city.locator('.combobox-value')).toHaveText('London')
  await expect(page.locator('input[name="forms-combo-city"]')).toHaveValue('lon')
  await expect(city).toHaveAttribute('aria-expanded', 'false')
  await expect(city).toBeFocused()
  await page.goto('/forms/datepicker/')
  await page.getByLabel('Project deadline', { exact: true }).click()
  await expect(page.locator('[data-vc="calendar"][data-vc-input]')).toBeVisible()
  await page.locator('h1').click()
  await expect(page.locator('[data-vc="calendar"][data-vc-input]')).toHaveAttribute('aria-hidden', 'true')
  await page.goto('/forms/otp-input/')
  const verification = page.getByRole('textbox', { name: 'Verification code', exact: true })
  await verification.focus()
  const pasted = await verification.evaluate(element => {
    const data = new DataTransfer()
    data.setData('text', '12 34')
    // Firefox ignores ClipboardEventInit.clipboardData for synthetic events.
    // Match the component-level test and verify the payload actually delivered.
    const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', { value: data })
    element.dispatchEvent(event)
    return event.clipboardData?.getData('text')
  })
  expect(pasted).toBe('12 34')
  await expect(page.locator('#forms-otp input')).toHaveCount(1)
  await expect(page.locator('#forms-otp input')).toHaveValue('1234')
  await expect(page.locator('#forms-otp .otp-slot-filled')).toHaveCount(4)
  await page.goto('/forms/range/')
  const range = page.getByRole('slider', { name: 'Volume', exact: true })
  await range.focus()
  await range.press('ArrowRight')
  await expect(range).toHaveValue('45')
  await expect(page.locator('.form-range-bubble .tooltip-inner').first()).toHaveText('45')
  await page.goto('/forms/password-strength/')
  await page.getByLabel('New password', { exact: true }).fill('LongExample123!!')
  await expect(page.locator('.strength-segment.active')).toHaveCount(4)
  await expect(page.locator('#forms-strength-password-feedback')).toHaveText('Strong')
})

test('adorned focus and multiple grouped inputs work at narrow widths in both directions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/forms/input-group/')
  for (const direction of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((element, dir) => element.setAttribute('dir', dir), direction)
    const group = page.locator('[data-forms-demo="multiple"]')
    expect(await group.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
    await expect(group.getByRole('textbox', { name: 'First name' })).toBeVisible()
    await expect(group.getByRole('textbox', { name: 'Last name' })).toBeVisible()
  }
  await page.goto('/forms/form-adorn/')
  await page.getByLabel('Website', { exact: true }).focus()
  const websiteWrapper = page.locator('label.form-control.form-adorn[for="forms-adorn-site"]')
  await expect(websiteWrapper).toHaveCSS('display', 'flex')
  await expect(websiteWrapper).toHaveCSS('outline-style', 'solid')
})

test('valid feedback is scoped to constrained native controls after a validation attempt', async ({ page }) => {
  await openScopedValidation(page)
  await page.locator('#required-field').fill('Example')
  await page.locator('#required-field').press('Tab')
  await expect(page.locator('#required-feedback')).toBeVisible()
  await expect(page.locator('#optional-feedback')).toBeHidden()
  await page.locator('#required-field').clear()
  await page.locator('#required-field').press('Tab')
  await expect(page.locator('#required-feedback')).toBeHidden()
})
