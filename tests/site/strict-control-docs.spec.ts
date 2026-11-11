import { expect, test } from '@playwright/test'

const pages = ['components/chip', 'components/chips', 'components/otp-input', 'components/range', 'components/strength', 'components/datepicker', 'components/nav-overflow', 'forms/chips', 'forms/otp-input', 'forms/range', 'forms/password-strength', 'forms/datepicker']
for (const route of pages) test(`strict documentation loads: ${route}`, async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  const response = await page.goto(`/${route}/`)
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('.docs-example').first()).toBeVisible()
  expect(errors).toEqual([])
})

for (const section of ['components', 'forms']) {
  test(`${section}: Chips adds, selects and removes a value with the strict control`, async ({ page }) => {
    await page.goto(`/${section}/chips/`)
    const example = page.locator('.docs-example').first()
    const input = example.locator('.form-ghost')
    await input.fill('Testing')
    await input.press('Enter')
    const chip = example.locator('.chip').filter({ hasText: 'Testing' })
    await expect(chip).toHaveCount(1)
    await input.press('Backspace')
    await expect(chip).toBeFocused()
    await chip.getByRole('button', { name: 'Remove', exact: true }).click()
    await expect(chip).toHaveCount(0)
    await expect(input).toBeFocused()
  })
  test(`${section}: OTP submits one input and generates four hidden visual slots`, async ({ page }) => {
    await page.goto(`/${section}/otp-input/`)
    const example = page.locator('.docs-example').first()
    const input = example.locator('[data-trm-otp] input')
    await expect(input).toHaveCount(1)
    await input.fill('1234')
    await expect(example.locator('.otp-slot')).toHaveCount(4)
    await expect(example.locator('.otp-slot-filled')).toHaveCount(4)
    await expect(example.locator('.otp-slots')).toHaveAttribute('aria-hidden', 'true')
    await expect(input).toHaveAttribute('name', 'code')
    await expect(input).toHaveAttribute('autocomplete', 'one-time-code')
  })
  test(`${section}: Range uses native keyboard values and a wrapper fill ratio`, async ({ page }) => {
    await page.goto(`/${section}/range/`)
    const example = page.locator('.docs-example').first()
    const input = example.getByRole('slider')
    await input.focus()
    await input.press('ArrowRight')
    await expect(input).toHaveValue('45')
    await expect(example.locator('.form-range-bubble .tooltip-inner')).toHaveText('45')
    expect(await example.locator('.form-range').evaluate((element: HTMLElement) => Number(element.style.getPropertyValue('--trm-range-fill')))).toBeCloseTo(.45)
  })
  test(`${section}: Strength shows readable segmented feedback rather than an implicit meter`, async ({ page }) => {
    await page.goto(`/${section}/${section === 'forms' ? 'password-strength' : 'strength'}/`)
    const example = page.locator('.docs-example').first()
    await example.locator('input[type="password"]').fill('LongExample123!!')
    await expect(example.locator('.strength-segment.active')).toHaveCount(4)
    await expect(example.locator('.strength-text')).toHaveText('Strong')
    await expect(example.locator('.strength-text')).toHaveAttribute('role', 'status')
  })
  test(`${section}: Datepicker renders the real calendar and resolves its external SVG`, async ({ page, request }) => {
    await page.goto(`/${section}/datepicker/`)
    const input = page.locator('.docs-example').first().locator('input[data-trm-toggle="datepicker"]')
    await input.click()
    const popup = page.locator('[data-vc="calendar"][data-vc-input]')
    await expect(popup).toBeVisible()
    await expect(popup.locator('[data-vc-date^="2026-10-"]')).toHaveCount(31)
    const response = await request.get('/icons/datepicker-chevron.svg')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('image/svg+xml')
    await page.locator('h1').click()
    await expect(popup).toHaveAttribute('aria-hidden', 'true')
  })
}

test('NavOverflow documentation uses Menu and keeps cloned-link content free of IDs', async ({ page }) => {
  await page.goto('/components/nav-overflow/')
  const example = page.locator('.docs-example').first()
  const toggle = example.getByRole('button', { name: 'More', exact: true })
  await toggle.press('ArrowDown')
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(example.locator('.nav-overflow-menu .menu-item').first()).toBeFocused()
  await expect(example.locator('.nav-overflow-menu .menu-item [id]')).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(toggle).toBeFocused()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
})

test('the standalone strict example initializes the same production controls', async ({ page }) => {
  await page.goto('/examples/controls/')
  await expect(page.locator('[data-control]')).toHaveCount(6)
  await page.locator('[data-control="chips"] .form-ghost').fill('Integrated demo')
  await page.locator('[data-control="chips"] .form-ghost').press('Enter')
  await expect(page.locator('[data-control="chips"] .chip').filter({ hasText: 'Integrated demo' })).toHaveCount(1)
  await page.locator('[data-control="otp-input"] input').fill('1234')
  await expect(page.locator('[data-control="otp-input"] .otp-slot-filled')).toHaveCount(4)
  await expect(page.locator('[data-control="range"] .form-range-bubble')).toHaveCount(1)
  await expect(page.locator('[data-control="nav-overflow"] .nav-overflow-toggle')).toBeVisible()
})

test('control examples remain usable at a narrow width and in RTL', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const route of ['chips', 'otp-input', 'range', 'strength', 'nav-overflow']) {
    await page.goto(`/components/${route}/`)
    await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
    const example = page.locator('.docs-example').first()
    expect(await example.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true)
    if (route === 'otp-input') {
      await example.locator('input').fill('1234')
      await expect(example.locator('.otp-slot-filled')).toHaveCount(4)
    }
  }
})
