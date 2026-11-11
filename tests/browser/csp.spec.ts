import { expect, test, type Page } from '@playwright/test'

// A real response header enforces the policy before the framework is loaded.
// Test-runner evaluate() is privileged; negative controls below verify that
// page-created scripts and HTML sinks are still subject to enforcement.
const policy = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; require-trusted-types-for 'script'; trusted-types tremplin"

async function openFixture(page: Page, includeBlockedScript = false): Promise<void> {
  await page.addInitScript(() => {
    ;(window as any).cspViolations = []
    ;(window as any).cspDetails = []
    document.addEventListener('securitypolicyviolation', event => {
      ;(window as any).cspViolations.push(event.effectiveDirective)
      ;(window as any).cspDetails.push({ directive: event.effectiveDirective, blockedURI: event.blockedURI, sourceFile: event.sourceFile })
    })
  })
  await page.route('**/csp-fixture', route => route.fulfill({
    contentType: 'text/html',
    headers: { 'Content-Security-Policy': policy },
    body: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>CSP fixture</title>
      <link rel="stylesheet" href="/dist/css/tremplin.css">
      <script type="module" src="/tests/browser/runtime.mjs"></script>${includeBlockedScript ? '<script>window.inlineScriptRan = true</script>' : ''}</head><body>
      <button id="tip">Tooltip</button><button id="popover">Popover</button>
      <label for="date">Date</label><input id="date" value="2026-10-25">
      <div id="chips" class="chip-input"><input class="form-ghost" aria-label="Chips"></div>
      <div id="overflow" class="nav-overflow"><ul class="nav"><li class="nav-item"><a class="nav-link" href="#one">One</a></li><li class="nav-item"><a class="nav-link" href="#two">Two</a></li></ul></div>
      </body></html>`
  }))
  await page.goto('/csp-fixture')
  await page.waitForFunction(() => Boolean((window as any).TremplinFramework))
}

test('CSP blocks inline scripts and Chromium enforces Trusted Types', async ({ page, browserName }) => {
  await openFixture(page, true)
  const result = await page.evaluate(() => {
    let htmlBlocked = false
    let policyBlocked = false
    if ((window as any).trustedTypes) {
      try { document.createElement('div').innerHTML = '<b>untrusted</b>' } catch { htmlBlocked = true }
      try { (window as any).trustedTypes.createPolicy('unauthorized', { createHTML: (value: string) => value }) } catch { policyBlocked = true }
    }
    return { htmlBlocked, policyBlocked, inlineScriptRan: Boolean((window as any).inlineScriptRan) }
  })
  expect(result.inlineScriptRan).toBe(false)
  await expect.poll(() => page.evaluate(() => (window as any).cspViolations)).toContain('script-src-elem')
  if (browserName === 'chromium') {
    expect(result.htmlBlocked).toBe(true)
    expect(result.policyBlocked).toBe(true)
  }
})

test('rich overlays render HTML and element content without CSP violations', async ({ page }) => {
  await openFixture(page)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.evaluate(async () => {
    const framework = (window as any).TremplinFramework
    const tip = new framework.Tooltip('#tip', { trigger: 'manual', animation: false, html: true,
      title: '<strong>Safe title</strong><a target="_blank">Link</a>' })
    await tip.show()
  })
  await expect(page.locator('.tooltip strong')).toHaveText('Safe title')
  await expect(page.locator('.tooltip [onerror], .tooltip [href]')).toHaveCount(0)
  await expect(page.locator('.tooltip a')).toHaveAttribute('rel', /noopener/)
  await page.evaluate(async () => {
    const framework = (window as any).TremplinFramework
    framework.Tooltip.getInstance('#tip').dispose()
    const content = document.createElement('strong')
    content.textContent = 'Element content'
    const popover = new framework.Popover('#popover', { trigger: 'manual', animation: false, html: true, title: 'Details', content })
    await popover.show()
  })
  await expect(page.locator('.popover strong')).toHaveText('Element content')
  await page.evaluate(() => (window as any).TremplinFramework.Popover.getInstance('#popover').dispose())
  expect(await page.evaluate(() => Boolean((window as any).payloadRan))).toBe(false)
  expect(await page.evaluate(() => (window as any).cspViolations), JSON.stringify(await page.evaluate(() => (window as any).cspDetails))).toEqual([])
  expect(errors).toEqual([])
})

test('malicious overlay content is removed under enforced CSP', async ({ page }) => {
  await openFixture(page)
  await page.evaluate(async () => {
    const tip = new (window as any).TremplinFramework.Tooltip('#tip', { trigger: 'manual', animation: false, html: true,
      title: '<strong>Safe title</strong><img onerror="window.payloadRan=true"><a href="javascript:alert(1)" target="_blank">Link</a>' })
    await tip.show()
  })
  await expect(page.locator('.tooltip strong')).toHaveText('Safe title')
  await expect(page.locator('.tooltip [onerror], .tooltip [href]')).toHaveCount(0)
  expect(await page.evaluate(() => Boolean((window as any).payloadRan))).toBe(false)
  // Chromium can report a blocked handler while the sanitizer parses the
  // attack in its inert document. No other violation is expected or allowed.
  const violations: string[] = await page.evaluate(() => (window as any).cspViolations)
  expect(violations.filter(directive => directive !== 'script-src-attr')).toEqual([])
})

test('Datepicker sanitizes Calendar Pro sinks and navigates without CSP exceptions', async ({ page }) => {
  const iconResponse = page.waitForResponse(response => response.url().endsWith('/dist/icons/datepicker-chevron.svg'))
  await openFixture(page)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.evaluate(() => {
    new (window as any).TremplinFramework.Datepicker('#date', {
      locale: 'en', selectedDates: ['2026-10-25'],
      dateFormat: (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      vcpOptions: { animation: false, labels: { dates: '<b>Dates</b>' } }
    })
  })
  // Input-mode Calendar Pro lazily constructs its popup on a real interaction.
  await page.locator('#date').click()
  const calendar = page.locator('[data-vc="calendar"]')
  await expect(calendar).toBeVisible()
  const icon = await iconResponse
  expect(icon.status()).toBe(200)
  expect(icon.headers()['content-type']).toContain('image/svg+xml')
  expect(await icon.text()).toContain('viewBox="0 0 24 24"')
  await expect(calendar.locator('[data-vc-arrow="next"]')).toHaveCSS('transform', 'none')
  expect(await calendar.locator('[data-vc-arrow="next"]').evaluate(element => getComputedStyle(element, '::before').maskImage)).toContain('/dist/icons/datepicker-chevron.svg')
  // VCP uses five complete weeks for October 2026, not the legacy fixed six.
  await expect(calendar.locator('[data-vc-date-btn]')).toHaveCount(35)
  await expect(calendar.locator('[data-vc-date^="2026-10-"]')).toHaveCount(31)
  await expect(calendar.locator('[data-vc="dates"]')).toHaveAttribute('aria-label', '<b>Dates</b>')
  await expect(calendar.locator('[data-vc="dates"] b')).toHaveCount(0)
  const selected = calendar.locator('[data-vc-date="2026-10-25"] [data-vc-date-btn]')
  await selected.press('ArrowRight')
  await expect(calendar.locator('[data-vc-date="2026-10-26"] [data-vc-date-btn]')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#date')).toHaveValue('2026-10-26')
  // Bootstrap 6 keeps the popup mounted and hides it through opacity/inert;
  // Playwright's visibility predicate deliberately ignores opacity.
  await expect(calendar).toHaveAttribute('data-vc-calendar-hidden', '')
  await expect(calendar).toHaveAttribute('aria-hidden', 'true')
  await expect(calendar).toHaveAttribute('inert', '')
  await expect(calendar).toHaveCSS('opacity', '0')
  await expect(calendar).toHaveCSS('pointer-events', 'none')
  expect(await page.evaluate(() => (window as any).TremplinFramework.Datepicker.getInstance('#date').getSelectedDates())).toEqual(['2026-10-26'])
  await page.evaluate(() => (window as any).TremplinFramework.Datepicker.getInstance('#date').dispose())
  await expect(calendar).toHaveCount(0)
  await page.evaluate(() => {
    const host = document.createElement('div')
    host.id = 'inline-dates'
    document.body.append(host)
    ;(window as any).calendarTransforms = 0
    new (window as any).TremplinFramework.Datepicker(host, {
      inline: true, displayMonthsCount: 2, selectedDates: ['2026-10-25'],
      vcpOptions: { animation: false, sanitizerHTML: (html: string) => {
        ;(window as any).calendarTransforms++
        return html + '<script>window.calendarPayloadRan=true</script><a href="javascript:window.calendarPayloadRan=true">Unsafe URL</a><svg><use href="external.svg#icon"></use></svg>'
      } }
    })
  })
  await expect(page.locator('#inline-dates [data-vc="dates"]')).toHaveCount(2)
  await expect(page.locator('#inline-dates script, #inline-dates svg, #inline-dates [href]')).toHaveCount(0)
  expect(await page.evaluate(() => (window as any).calendarTransforms)).toBeGreaterThan(0)
  expect(await page.evaluate(() => Boolean((window as any).calendarPayloadRan))).toBe(false)
  await page.evaluate(() => (window as any).TremplinFramework.Datepicker.getInstance('#inline-dates').dispose())
  expect(await page.evaluate(() => (window as any).cspViolations), JSON.stringify(await page.evaluate(() => (window as any).cspDetails))).toEqual([])
  expect(errors).toEqual([])
})

test('sanitized icon paths render without Trusted Types or unsafe SVG violations', async ({ page }) => {
  await openFixture(page)
  await page.evaluate(() => {
    const framework = (window as any).TremplinFramework
    const icon = '<svg viewBox="0 0 16 16" onload="window.payloadRan=true"><path d="M1 1h2v2z"></path><script>window.payloadRan=true</script><use href="external.svg#icon"></use></svg>'
    const chips = new framework.Chips('#chips', { dismissIcon: icon })
    chips.add('Safe')
    new framework.NavOverflow('#overflow', { collapseBelow: 2000, moreIcon: icon })
  })
  await expect(page.locator('#chips .chip-dismiss svg')).toHaveAttribute('viewBox', '0 0 16 16')
  await expect(page.locator('#overflow .nav-overflow-icon svg')).toHaveAttribute('viewBox', '0 0 16 16')
  await expect(page.locator('#chips [onload], #overflow [onload], #chips script, #overflow script, #chips use, #overflow use')).toHaveCount(0)
  expect(await page.evaluate(() => Boolean((window as any).payloadRan))).toBe(false)
  const violations: string[] = await page.evaluate(() => (window as any).cspViolations)
  expect(violations.filter(directive => directive !== 'script-src-attr')).toEqual([])
})

test('the sanitizing policy does not install a permissive default or trust raw sinks', async ({ page, browserName }) => {
  await openFixture(page)
  const result = await page.evaluate(async () => {
    const tip = new (window as any).TremplinFramework.Tooltip('#tip', { trigger: 'manual', html: true, title: '<strong>Safe</strong>' })
    await tip.show()
    const types = (window as any).trustedTypes
    let rawBlocked = false, fakeBlocked = false, bypassBlocked = false
    if (types) {
      try { document.createElement('div').innerHTML = '<b>raw</b>' } catch { rawBlocked = true }
      try { (document.createElement('div') as any).innerHTML = { toString: () => '<b>fake</b>' } } catch { fakeBlocked = true }
      try {
        await new (window as any).TremplinFramework.Tooltip('#popover', { trigger: 'manual', html: true, sanitize: false, title: '<strong>Owner opted out</strong>' }).show()
      } catch { bypassBlocked = true }
    }
    return { rawBlocked, fakeBlocked, bypassBlocked, hasDefault: Boolean(types?.defaultPolicy), leakedPolicy: Boolean((window as any)[Symbol.for('tremplin.trusted-types-policy')]) }
  })
  expect(result.hasDefault).toBe(false)
  expect(result.leakedPolicy).toBe(false)
  if (browserName === 'chromium') {
    expect(result.rawBlocked).toBe(true)
    expect(result.fakeBlocked).toBe(true)
    expect(result.bypassBlocked).toBe(true)
  }
})
