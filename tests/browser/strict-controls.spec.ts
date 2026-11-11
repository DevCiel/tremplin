import { expect, test, type Page } from '@playwright/test'

const errors: string[] = []
test.beforeEach(async ({ page }) => {
  errors.length = 0
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/strict-controls/', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="en"><head>
    <meta name="viewport" content="width=device-width,initial-scale=1"><title>Strict controls</title>
    <link rel="stylesheet" href="/dist/css/tremplin.css"><script type="module" src="/tests/browser/runtime.mjs"></script>
    </head><body><main class="container"><h1>Strict controls</h1>
    <label for="tags">Project tags</label><div id="chips" class="chip-input" data-trm-chips><input id="tags" class="form-ghost"></div>
    <form id="verification"><label for="code">Verification code</label><div id="otp" class="otp" data-trm-otp><input id="code" name="code" maxlength="4"></div></form>
    <label for="volume">Volume</label><div id="range" class="form-range" data-trm-bubble><input id="volume" class="form-range-input" type="range" min="20" max="80" step="5" value="50"></div>
    <label for="password">Password</label><input id="password" type="password"><div id="strength" class="strength" data-trm-strength data-trm-input="#password"><span class="strength-segment"></span><span class="strength-segment"></span><span class="strength-segment"></span><span class="strength-segment"></span></div><span class="strength-text" aria-live="polite"></span>
    <nav id="overflow" class="nav-overflow" data-trm-toggle="nav-overflow" data-trm-collapse-below="400" aria-label="Project navigation" style="width:320px;margin-inline-start:200px">
    <ul class="nav"><li class="nav-item nav-overflow-keep"><a id="home" class="nav-link" href="#home">Home</a></li><li class="nav-item"><a id="one" class="nav-link" href="#one">Introduction</a></li><li class="nav-item"><a id="two" class="nav-link" href="#two">Documentation</a></li></ul></nav>
    <label for="deadline">Deadline</label><input id="deadline" value="2026-11-04" data-trm-toggle="datepicker">
    </main></body></html>` }))
  await page.goto('/strict-controls/')
  await page.waitForFunction(() => {
    const f = (window as any).TremplinFramework
    return f?.Chips.getInstance('#chips') && f.OtpInput.getInstance('#otp') && f.Range.getInstance('#range') && f.NavOverflow.getInstance('#overflow')
  })
})
test.afterEach(() => expect(errors).toEqual([]))

async function paste(page: Page, selector: string, text: string) {
  const payload = await page.locator(selector).evaluate((element, value) => {
    const clipboardData = new DataTransfer()
    clipboardData.setData('text', value)
    // Firefox does not retain ClipboardEventInit.clipboardData consistently for
    // synthetic events. Supply the read-only payload explicitly, then verify
    // what the component actually received rather than assuming it was kept.
    const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', { value: clipboardData })
    element.dispatchEvent(event)
    return event.clipboardData!.getData('text')
  }, text)
  expect(payload).toBe(text)
}

test('Chips data API handles native entry, paste, named dismissal and keyboard selection', async ({ page }) => {
  const input = page.getByLabel('Project tags')
  await input.fill('Alpha')
  await input.press('Enter')
  await input.fill('Beta,Gamma,')
  await paste(page, '#tags', 'Delta,Epsilon')
  const host = page.locator('#chips')
  await expect(host.locator('.chip')).toHaveCount(5)
  await input.press('Backspace')
  const last = host.locator('.chip').last()
  await expect(last).toBeFocused()
  await expect(last).toHaveClass(/active/)
  // Bootstrap selects on Backspace first; it does not immediately delete.
  await expect(host.locator('.chip')).toHaveCount(5)
  await last.press('Delete')
  await expect(host.locator('.chip')).toHaveCount(4)
  await host.locator('.chip').filter({ hasText: 'Alpha' }).getByRole('button', { name: 'Remove', exact: true }).click()
  await expect(host.locator('.chip')).toHaveCount(3)
  await expect(input).toBeFocused()
  expect(await page.evaluate(() => (window as any).TremplinFramework.Chips.getInstance('#chips').getValues())).toEqual(['Beta', 'Gamma', 'Delta'])
})

test('Chips literal text and disposal preserve safe markup and detach retained nodes', async ({ page }) => {
  const input = page.getByLabel('Project tags')
  await input.fill('<img onerror="window.chipPayload=true">')
  await input.press('Enter')
  await expect(page.locator('#chips .chip')).toContainText('<img onerror="window.chipPayload=true">')
  await expect(page.locator('#chips img, #chips [onerror]')).toHaveCount(0)
  await page.evaluate(() => (window as any).TremplinFramework.Chips.getInstance('#chips').dispose())
  await input.fill('After disposal')
  await input.press('Enter')
  await page.locator('#chips .chip-dismiss').click()
  await expect(page.locator('#chips .chip')).toHaveCount(1)
  expect(await page.evaluate(() => Boolean((window as any).chipPayload))).toBe(false)
})

test('OTP uses one accessible input for typing, overwrite, autofill, paste and form submission', async ({ page }) => {
  const input = page.getByLabel('Verification code')
  await expect(page.locator('#otp input')).toHaveCount(1)
  await expect(page.locator('#otp .otp-slot')).toHaveCount(4)
  await expect(page.locator('#otp .otp-slots')).toHaveAttribute('aria-hidden', 'true')
  await expect(input).toHaveAttribute('autocomplete', 'one-time-code')
  await input.pressSequentially('1234')
  await expect(input).toHaveValue('1234')
  await input.evaluate((element: HTMLInputElement) => element.setSelectionRange(1, 2))
  await input.press('9')
  await expect(input).toHaveValue('1934')
  await paste(page, '#code', '5 6-78')
  await expect(input).toHaveValue('5678')
  expect(await page.locator('#verification').evaluate((form: HTMLFormElement) => new FormData(form).get('code'))).toBe('5678')
  await input.fill('12')
  await expect(page.locator('#otp .otp-slot-filled')).toHaveCount(2)
})

test('OTP readonly/mask/disposal behavior keeps the real input available', async ({ page }) => {
  await page.evaluate(() => {
    const f = (window as any).TremplinFramework
    f.OtpInput.getInstance('#otp').dispose()
    const otp = new f.OtpInput('#otp', { mask: true })
    otp.setValue('1234')
    ;(document.querySelector('#code') as HTMLInputElement).readOnly = true
  })
  const input = page.getByLabel('Verification code')
  await expect(input).toHaveJSProperty('type', 'text')
  await expect(page.locator('#otp .otp-slot').first()).toHaveText('•')
  await paste(page, '#code', '5678')
  await expect(input).toHaveValue('1234')
  await page.evaluate(() => (window as any).TremplinFramework.OtpInput.getInstance('#otp').dispose())
  await expect(page.locator('#otp .otp-slots')).toHaveCount(0)
  await expect(input).toHaveValue('1234')
})

test('Range keyboard input updates wrapper fill/bubble and Strength uses segmented feedback', async ({ page }) => {
  const range = page.getByLabel('Volume')
  await range.focus()
  await range.press('ArrowRight')
  await expect(range).toHaveValue('55')
  await expect(page.locator('#range .form-range-bubble .tooltip-inner')).toHaveText('55')
  expect(await page.locator('#range').evaluate((element: HTMLElement) => Number(element.style.getPropertyValue('--trm-range-fill')))).toBeCloseTo(35 / 60)
  await expect(page.locator('#range .form-range-bubble')).toHaveAttribute('aria-hidden', 'true')
  await page.getByLabel('Password', { exact: true }).fill('LongExample123!!')
  await expect(page.locator('.strength-segment.active')).toHaveCount(4)
  await expect(page.locator('.strength-text')).toHaveText('Strong')
  await page.getByLabel('Password', { exact: true }).fill('')
  await expect(page.locator('.strength-segment.active')).toHaveCount(0)
})

test('NavOverflow uses Menu keyboard/focus, restores resized items, and Datepicker uses Calendar Pro placement', async ({ page }) => {
  await page.getByLabel('Deadline').click()
  await expect(page.locator('[data-vc="calendar"]')).toBeVisible()
  await expect(page.locator('[data-vc="calendar"]')).toHaveAttribute('data-vc-position', /bottom/)
  await page.evaluate(async () => { await (window as any).TremplinFramework.Datepicker.getInstance('#deadline').hide() })
  const toggle = page.locator('#overflow .nav-overflow-toggle')
  const menu = page.locator('#overflow .nav-overflow-menu')
  await expect(page.locator('#home')).toBeVisible()
  await expect(menu.locator('.menu-item')).toHaveCount(2)
  await toggle.press('ArrowDown')
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(menu.locator('.menu-item').first()).toBeFocused()
  // Strict Menu's default offset is 2px, not the hybrid overflow helper's 4px.
  await expect.poll(() => menu.evaluate(element => Math.round(element.getBoundingClientRect().top - document.querySelector('.nav-overflow-toggle')!.getBoundingClientRect().bottom))).toBe(2)
  await page.keyboard.press('Escape')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(toggle).toBeFocused()
  await page.locator('#overflow').evaluate((element: HTMLElement) => { element.style.width = '1000px' })
  await expect(menu.locator('.menu-item')).toHaveCount(0)
  await expect(page.locator('#one')).toBeVisible()
  await expect(page.locator('#two')).toBeVisible()
  await page.evaluate(() => (window as any).TremplinFramework.NavOverflow.getInstance('#overflow').dispose())
  await expect(toggle).toHaveCount(0)
  await expect(page.locator('#overflow .nav > .nav-item')).toHaveCount(3)
})
