import AxeBuilder from '@axe-core/playwright'
import { writeFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

const pageErrors: string[] = []
test.beforeEach(({ page }) => { pageErrors.length = 0; page.on('pageerror', error => pageErrors.push(error.message)) })
test.afterEach(() => expect(pageErrors, 'Examples must not hide runtime errors behind an Axe pass').toEqual([]))
test.afterEach(async ({ page }, info) => {
  if (info.status === info.expectedStatus) return
  const state = await page.evaluate(() => ({
    viewport: { width: innerWidth, height: innerHeight, scale: devicePixelRatio },
    documentVisibility: document.visibilityState,
    documentFocused: document.hasFocus(),
    activeElement: document.activeElement?.outerHTML,
    rootClasses: document.documentElement.className,
    dialogs: [...document.querySelectorAll<HTMLDialogElement>('dialog')].map(element => {
      const describe = (node: Element) => {
        const style = getComputedStyle(node), rect = node.getBoundingClientRect()
        return { tag: node.tagName, id: node.id, display: style.display,
          visibility: style.visibility, opacity: style.opacity, transform: style.transform,
          position: style.position, rect: rect.toJSON(),
          ariaHidden: node.getAttribute('aria-hidden'), inert: node.hasAttribute('inert') }
      }
      return { ...describe(element), open: element.open, modal: element.matches(':modal'),
        classes: element.className, activeInside: element.contains(document.activeElement),
        headings: [...element.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(describe),
        animations: element.getAnimations().map(animation => ({ playState: animation.playState,
          currentTime: String(animation.currentTime), pending: animation.pending })) }
    })
  })).catch(error => ({ captureError: String(error) }))
  const output = info.outputPath('native-dialog-state.json')
  await writeFile(output, JSON.stringify(state, null, 2) + '\n')
  await info.attach('native-dialog-state.json', { contentType: 'application/json', path: output })
})

const pages = [
  // The real Astro homepage is audited in tests/site/legacy-free.spec.ts.
  '/examples/kitchen-sink.html',
  '/examples/layout.html',
  '/examples/forms-components.html',
  '/examples/interactions.html',
  '/examples/advanced-interactions.html',
  '/examples/discovery.html',
  '/examples/dashboard.html',
  '/examples/sign-in.html'
]

for (const path of pages) {
  test(`${path} has no automatically detectable WCAG A/AA violations`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    // Initial active panes fade in via @starting-style, independently of load.
    // Audit the settled presentation; opacity-only content is still "visible".
    for (const pane of await page.locator('.tab-content > .tab-pane.active').all()) {
      await expect(pane).toBeVisible()
      await expect(pane).toHaveCSS('opacity', '1')
    }
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(results.violations, results.violations.map(item => `${item.id}: ${item.help}`).join('\n')).toEqual([])
  })
}

test('advanced interaction keyboard smoke test', async ({ page }) => {
  await page.goto('/examples/advanced-interactions.html')
  const carousel = page.locator('#demo-carousel')
  await carousel.locator('.carousel-control-next').click()
  await expect(carousel.locator('.carousel-item').nth(1)).toHaveClass(/active/)

  const menuToggle = page.locator('[data-trm-toggle="menu"]')
  await menuToggle.click()
  await expect(page.locator('.menu').first()).toBeVisible()
  await menuToggle.press('ArrowDown')
  await expect(page.locator('.menu-item').first()).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.locator('.menu').first()).toBeHidden()
  await expect(menuToggle).toBeFocused()

  const date = page.locator('#launch-date')
  await date.click()
  const calendar = page.locator('[data-vc="calendar"]')
  await expect(calendar).toBeVisible()
  await expect(calendar).not.toHaveAttribute('data-vc-calendar-hidden')
  await calendar.locator('[data-vc-date="2026-10-25"] [data-vc-date-btn]').press('ArrowRight')
  await expect(calendar.locator('[data-vc-date="2026-10-26"] [data-vc-date-btn]')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(date).toHaveValue('2026-10-26')
  // The native Calendar Pro popup remains mounted and uses opacity/inert.
  await expect(calendar).toHaveAttribute('data-vc-calendar-hidden', '')
  await expect(calendar).toHaveAttribute('aria-hidden', 'true')
})

test('responsive Drawer navbar and bottom sheet use native modal/focus semantics', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, get: () => 1 }))
  await page.goto('/examples/interactions.html')

  const navigationButton = page.locator('.navbar-toggler')
  const navigation = page.locator('#main-nav')
  for (const selector of ['#main-nav', '#demo-sheet']) {
    await page.locator(selector).evaluate(element => element.addEventListener('shown.trm.drawer', () => {
      element.setAttribute('data-test-shown', String(Number(element.getAttribute('data-test-shown') || 0) + 1))
    }))
  }
  await expect(navigation).toBeHidden()
  await expect(navigationButton).toHaveAttribute('aria-haspopup', 'dialog')
  await navigationButton.click()
  await expect(navigation).toHaveAttribute('data-test-shown', '1')
  await expect(page.locator('#main-nav:modal')).toHaveCount(1)
  await expect(navigation).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(navigation).not.toHaveAttribute('open')
  await expect(navigationButton).toBeFocused()
  await expect(page.locator('html')).not.toHaveClass(/dialog-open/)
  await page.setViewportSize({ width: 1280, height: 900 })
  await expect(navigationButton).toBeHidden()
  await expect(navigation).toHaveCSS('position', 'static')
  await expect(navigation).toBeVisible()
  await expect(navigation).not.toHaveAttribute('open')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(navigation).toBeHidden()
  await expect(navigationButton).toBeVisible()
  await expect(navigation).toHaveCSS('position', 'fixed')

  const sheetButton = page.getByRole('button', { name: 'Open bottom sheet' })
  await sheetButton.focus()
  await sheetButton.press('Enter')
  const sheet = page.locator('#demo-sheet')
  await expect(sheet).toHaveAttribute('data-test-shown', '1')
  await expect(sheet).toHaveAttribute('open', '')
  // The completion event and open attribute do not establish CSS visibility.
  // Verify the native modal surface before querying its accessible descendants.
  await expect(page.locator('#demo-sheet:modal')).toBeVisible()
  await expect(sheet.getByRole('heading', { name: 'Quick actions' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(sheet).not.toHaveAttribute('open', '')
  await expect(sheetButton).toBeFocused()

  await sheetButton.press('Enter')
  await expect(sheet).toHaveAttribute('data-test-shown', '2')
  await expect(page.locator('#demo-sheet:modal')).toBeVisible()
  // Exercise the pinned recognizer, not a claim of real-device gesture QA.
  await sheet.dispatchEvent('pointerdown', { clientX: 10, clientY: 100, isPrimary: true, pointerType: 'touch' })
  await sheet.dispatchEvent('pointerup', { clientX: 10, clientY: 120, isPrimary: true, pointerType: 'touch' })
  await expect(sheet).toHaveAttribute('open', '')
  await sheet.dispatchEvent('pointerdown', { clientX: 10, clientY: 100, isPrimary: true, pointerType: 'touch' })
  await sheet.dispatchEvent('pointerup', { clientX: 10, clientY: 200, isPrimary: true, pointerType: 'touch' })
  await expect(sheet).not.toHaveAttribute('open', '')
  await expect(sheetButton).toBeFocused()
})

test('nested dialogs preserve topmost dismissal, scroll locking, and focus restoration', async ({ page }) => {
  await page.goto('/examples/interactions.html')
  await page.evaluate(() => {
    document.body.insertAdjacentHTML('beforeend', `
      <button id="nested-opener" data-trm-toggle="dialog" data-trm-target="#nested-outer">Open nested dialogs</button>
      <dialog id="nested-outer" class="dialog dialog-instant" aria-label="Outer dialog"><button id="nested-trigger" data-trm-toggle="drawer" data-trm-target="#nested-inner">Open inner</button></dialog>
      <dialog id="nested-inner" class="drawer drawer-end drawer-instant" aria-label="Inner drawer"><button id="nested-action">Inner action</button></dialog>
    `)
  })
  await page.locator('#nested-opener').click()
  await page.locator('#nested-trigger').click()
  await page.locator('#nested-action').focus()

  await page.keyboard.press('Escape')
  await expect(page.locator('#nested-inner')).not.toHaveAttribute('open', '')
  await expect(page.locator('#nested-outer')).toHaveAttribute('open', '')
  await expect(page.locator('html')).toHaveClass(/dialog-open/)
  await expect(page.locator('#nested-trigger')).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(page.locator('#nested-outer')).not.toHaveAttribute('open', '')
  await expect(page.locator('html')).not.toHaveClass(/dialog-open/)
  await expect(page.locator('#nested-opener')).toBeFocused()
})

test('forced-colors mode removes decorative shadows', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Forced-colors emulation is validated in Chromium')
  await page.emulateMedia({ forcedColors: 'active' })
  await page.goto('/examples/kitchen-sink.html')
  await page.locator('main').evaluate(element => element.insertAdjacentHTML('beforeend', '<div id="forced-shadow" class="shadow p-3"><button id="forced-focus" class="focus-ring">Focus probe</button></div>'))
  expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
  await expect(page.locator('#forced-shadow')).toHaveCSS('box-shadow', 'none')
  await page.locator('#forced-focus').focus()
  await expect(page.locator('#forced-focus')).toHaveCSS('outline-style', 'solid')
  await expect(page.locator('#forced-focus')).toHaveCSS('outline-width', '3px')
  await page.emulateMedia({ forcedColors: 'none' })
  await expect(page.locator('#forced-shadow')).not.toHaveCSS('box-shadow', 'none')
})

test('discovery components work by keyboard and remain accessible while open', async ({ page }) => {
  await page.goto('/examples/discovery.html')
  const city = page.locator('#city')
  await city.press('Enter')
  const searchCities = page.getByLabel('Search cities')
  await searchCities.fill('lon')
  await searchCities.press('ArrowDown')
  await expect(page.locator('#city-menu [data-trm-value="lon"]')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(city.locator('.combobox-value')).toHaveText('London')
  await expect(page.locator('input[name="city"]')).toHaveValue('lon')
  await expect(city).toBeFocused()

  await page.keyboard.press('Control+k')
  const palette = page.locator('#commands')
  await expect(palette).toBeVisible()
  const search = palette.locator('.command-palette-input')
  await search.fill('settings')
  const results = await new AxeBuilder({ page }).include('#commands').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(results.violations, results.violations.map(item => `${item.id}: ${item.help}`).join('\n')).toEqual([])
  await search.press('Enter')
  await expect(palette).toBeHidden()
})
