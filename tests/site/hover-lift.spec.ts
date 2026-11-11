import { readFileSync } from 'node:fs'
import { compileString } from 'sass'
import { expect, test } from '@playwright/test'

const styles = {
  full: readFileSync('dist/css/tremplin.css', 'utf8'),
  utilities: readFileSync('dist/css/tremplin-utilities.css', 'utf8'),
  disabled: compileString("@use 'src/scss/config' with ($enable-transitions: false, $enable-shadows: false); @use 'src/scss/tremplin';", { loadPaths: [process.cwd()] }).css,
  configured: compileString("@use 'src/scss/helpers/hover-lift' with ($hover-lift-tokens: ('--trm-hover-lift-transform': translateY(-.5rem), '--trm-hover-lift-transition-duration': .12s, '--trm-hover-lift-box-shadow': none)); @use 'src/scss/tremplin';", { loadPaths: [process.cwd()] }).css
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.route('**/hover-lift.css', route => route.fulfill({ contentType: 'text/css', body: styles.full }))
  await page.route('**/hover-lift-check/', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="en" data-trm-theme="light"><head><title>Hover lift check</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/hover-lift.css"></head><body><main><h1>Hover lift</h1><a id="lift" class="hover-lift focus-ring d-inline-block p-3" href="#destination">Open destination</a><a id="plain" class="d-inline-block p-3" href="#destination">Static link</a><div id="destination">Destination</div></main></body></html>' }))
  await page.goto('/hover-lift-check/')
})

test('default hover lifts by .25rem with a large shadow and transitions both properties', async ({ page }) => {
  const lift = page.locator('#lift')
  await expect(lift).toHaveCSS('transform', 'none')
  await expect(lift).toHaveCSS('box-shadow', 'none')
  await lift.hover()
  await expect(lift).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -4)')
  const expected = await lift.evaluate(element => {
    const probe = document.createElement('span'); probe.style.boxShadow = 'var(--trm-box-shadow-lg)'; element.append(probe)
    const shadow = getComputedStyle(probe).boxShadow; probe.remove(); return shadow
  })
  expect(expected).not.toBe('none')
  await expect(lift).toHaveCSS('box-shadow', expected)
  await expect(lift).toHaveCSS('transition-duration', '0.2s, 0.2s')
  await expect(lift).toHaveCSS('transition-property', 'transform, box-shadow')
  await page.locator('#plain').hover()
  await expect(page.locator('#plain')).toHaveCSS('transform', 'none')
  await expect(lift).toHaveCSS('transform', 'none')
})

test('keyboard-modality focus gives the same lift without requiring hover', async ({ page, browserName }) => {
  await page.mouse.move(0, 0)
  await page.keyboard.press('Tab')
  // Windows WebKit's native Tab policy skips links; preserve keyboard modality.
  if (browserName === 'webkit') await page.locator('#lift').focus()
  const lift = page.locator('#lift')
  await expect(lift).toBeFocused()
  expect(await lift.evaluate(element => element.matches(':focus-visible'))).toBe(true)
  await expect(lift).toHaveCSS('outline-style', 'solid')
  await expect(lift).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -4)')
  await expect(lift).not.toHaveCSS('box-shadow', 'none')
})

test('runtime overrides control distance, timing, and shadow in RTL and dark mode', async ({ page }) => {
  await page.locator('html').evaluate(element => { element.setAttribute('dir', 'rtl'); element.setAttribute('data-trm-theme', 'dark') })
  const lift = page.locator('#lift')
  await lift.evaluate(element => { element.style.setProperty('--trm-hover-lift-transform', 'translateY(-8px)'); element.style.setProperty('--trm-hover-lift-transition-duration', '.12s'); element.style.setProperty('--trm-hover-lift-transition-timing', 'linear'); element.style.setProperty('--trm-hover-lift-box-shadow', '0 2px 4px rgb(18, 52, 86)') })
  await lift.hover()
  await expect(lift).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -8)')
  await expect(lift).toHaveCSS('box-shadow', 'rgb(18, 52, 86) 0px 2px 4px 0px')
  await expect(lift).toHaveCSS('transition-duration', '0.12s, 0.12s')
  await expect(lift).toHaveCSS('transition-timing-function', 'linear, linear')
})

test('reduced motion retains the raised state without a visible transition and permits a no-lift override', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const lift = page.locator('#lift')
  await lift.hover()
  await expect(lift).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -4)')
  await expect(lift).not.toHaveCSS('box-shadow', 'none')
  const durations = await lift.evaluate(element => getComputedStyle(element).transitionDuration.split(',').map(value => parseFloat(value)))
  expect(durations.every(value => value <= .00001)).toBe(true)
  await page.addStyleTag({ content: '@media (prefers-reduced-motion: reduce) { .hover-lift { --trm-hover-lift-transform: none; } }' })
  await expect(lift).toHaveCSS('transform', 'none')
})

test('module-owned Sass overrides are reflected in the active state', async ({ page }) => {
  await page.route('**/hover-lift.css', route => route.fulfill({ contentType: 'text/css', body: styles.configured }))
  await page.reload()
  const lift = page.locator('#lift')
  await lift.hover()
  await expect(lift).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -8)')
  await expect(lift).toHaveCSS('transition-duration', '0.12s, 0.12s')
  await expect(lift).toHaveCSS('box-shadow', 'none')
})

test('disabled transition and shadow switches preserve the transform alone', async ({ page }) => {
  await page.route('**/hover-lift.css', route => route.fulfill({ contentType: 'text/css', body: styles.disabled }))
  await page.reload()
  const lift = page.locator('#lift')
  await lift.hover()
  await expect(lift).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -4)')
  await expect(lift).toHaveCSS('box-shadow', 'none')
  await expect(lift).toHaveCSS('transition-duration', '0s')
})

test('utilities-only CSS includes hover lift with reduced-motion-aware transitions', async ({ page }) => {
  await page.route('**/hover-lift.css', route => route.fulfill({ contentType: 'text/css', body: styles.utilities }))
  await page.reload()
  const lift = page.locator('#lift')
  await lift.hover()
  await expect(lift).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -4)')
  await expect(lift).toHaveCSS('transition-duration', '0.2s, 0.2s')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(lift).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -4)')
  await expect(lift).toHaveCSS('transition-duration', '0s')
})
