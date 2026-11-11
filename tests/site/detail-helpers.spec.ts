import { readFileSync } from 'node:fs'
import { compileString } from 'sass'
import { expect, test } from '@playwright/test'

const css = readFileSync('dist/css/tremplin.css', 'utf8')
const standalone = readFileSync('dist/css/tremplin-utilities.css', 'utf8')
const before = compileString("@use 'src/scss/helpers/stretched-link' with ($stretched-link-pseudo-element: before, $stretched-link-tokens: ('--trm-stretched-link-z-index': 7)); @use 'src/scss/tremplin';", { loadPaths: [process.cwd()] }).css
const icon = '<svg class="bi" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" stroke-width="2"></path></svg>'

test.beforeEach(async ({ page }) => {
  await page.route('**/detail-helpers.css', route => route.fulfill({ contentType: 'text/css', body: css }))
  await page.route('**/detail-helpers-check/', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="en" data-trm-theme="light"><head><title>Detailed helpers</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/detail-helpers.css"></head><body><main><h1>Detailed helper checks</h1>
    <a id="focus" class="focus-ring d-inline-block p-3" href="#target" style="--trm-focus-ring-color:#075985">Custom focus color</a>
    <div class="theme-success"><a id="themed-focus" class="focus-ring d-inline-block p-3" href="#target" style="--trm-focus-ring-color:red">Contextual focus</a></div>
    <a id="motion" class="icon-link icon-link-hover focus-ring" href="#target">${icon}<span>Animated icon link</span></a>
    <a id="plain" class="icon-link" href="#target">${icon}<span>Static icon link</span></a>
    <a id="unhooked" class="icon-link icon-link-hover" href="#target"><svg class="icon" width="24" height="24" aria-hidden="true"><path d="M0 0h10v10z"></path></svg><span>Unhooked icon stays static</span></a>
    <a id="nested" class="icon-link icon-link-hover" href="#target"><span>${icon}</span><span>Nested icon stays static</span></a>
    <article id="card" class="position-relative border p-3" style="inline-size:300px;block-size:140px"><p>A positioned card with one destination.</p><a id="stretched" class="stretched-link" href="#target">Read more</a></article>
    <div class="hstack gap-3" style="min-block-size:60px"><span>First<br>region</span><span id="rule" class="vr" aria-hidden="true" style="color:red"></span><span>Second<br>region</span></div>
    <div id="target" tabindex="-1">Target content</div>
    </main></body></html>` }))
  await page.goto('/detail-helpers-check/')
})

test('focus geometry, explicit offset and theme color priority support keyboard-modality focus', async ({ page, browserName }) => {
  await page.keyboard.press('Tab')
  // Windows WebKit skips links in its native Tab policy. Establish keyboard
  // modality above, then focus explicitly as in the existing helper tests.
  if (browserName === 'webkit') await page.locator('#focus').focus()
  await expect(page.locator('#focus')).toBeFocused()
  await expect(page.locator('#focus')).toHaveJSProperty('tagName', 'A')
  expect(await page.locator('#focus').evaluate(element => element.matches(':focus-visible'))).toBe(true)
  await expect(page.locator('#focus')).toHaveCSS('outline-color', 'rgb(7, 89, 133)')
  const defaultWidth = await page.locator('#focus').evaluate(element => { const probe = document.createElement('span'); probe.style.outline = '3px solid transparent'; element.append(probe); const width = getComputedStyle(probe).outlineWidth; probe.remove(); return width })
  await expect(page.locator('#focus')).toHaveCSS('outline-width', defaultWidth)
  const nativeOffset = await page.locator('#focus').evaluate(element => getComputedStyle(element).outlineOffset)
  await page.locator('#focus').evaluate(element => { element.style.setProperty('--trm-focus-ring-width', '5px'); element.style.setProperty('--trm-focus-ring-offset', '4px'); element.style.setProperty('--trm-focus-ring-color', '#123456') })
  await expect(page.locator('#focus')).toHaveCSS('outline-width', '5px')
  await expect(page.locator('#focus')).toHaveCSS('outline-offset', nativeOffset)
  await page.locator('#focus').evaluate(element => { element.style.outlineOffset = 'var(--trm-focus-ring-offset)' })
  await expect(page.locator('#focus')).toHaveCSS('outline-offset', '4px')
  await expect(page.locator('#focus')).toHaveCSS('outline-color', 'rgb(18, 52, 86)')
  await page.locator('#themed-focus').focus()
  const expected = await page.locator('#themed-focus').evaluate(element => {
    const probe = document.createElement('span'); probe.style.color = 'var(--trm-theme-focus-ring)'; element.append(probe)
    const color = getComputedStyle(probe).color; probe.remove(); return color
  })
  await expect(page.locator('#themed-focus')).toHaveCSS('outline-color', expected)
})

test('icon-link tokens size direct bi children and hover/focus move only opted-in icons', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator('#motion')).toHaveCSS('column-gap', '6px')
  await expect(page.locator('#motion > svg')).toHaveCSS('width', '16px')
  await page.locator('#motion').hover()
  await expect(page.locator('#motion > svg')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 4, 0)')
  await expect(page.locator('#motion > svg')).toHaveCSS('transition-duration', '0.2s')
  await page.locator('#plain').hover()
  await expect(page.locator('#plain > svg')).toHaveCSS('transform', 'none')
  await page.locator('#unhooked').hover()
  await expect(page.locator('#unhooked > svg')).toHaveCSS('transform', 'none')
  await expect(page.locator('#unhooked > svg')).toHaveCSS('width', '24px')
  await page.locator('#nested').hover()
  await expect(page.locator('#nested svg')).toHaveCSS('transform', 'none')
  await page.mouse.move(0, 0)
  await page.keyboard.press('Tab')
  await page.locator('#motion').focus()
  await expect(page.locator('#motion > svg')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 4, 0)')
})

test('runtime icon overrides work in RTL and reduced motion suppresses the transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
  await page.locator('#motion').evaluate(element => { element.style.setProperty('--trm-icon-link-gap', '12px'); element.style.setProperty('--trm-icon-link-icon-size', '24px'); element.style.setProperty('--trm-icon-link-transform', 'translate3d(-8px,0,0)') })
  await page.locator('#motion').hover()
  await expect(page.locator('#motion')).toHaveCSS('column-gap', '12px')
  await expect(page.locator('#motion > svg')).toHaveCSS('width', '24px')
  await expect(page.locator('#motion > svg')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, -8, 0)')
  const duration = await page.locator('#motion > svg').evaluate(element => parseFloat(getComputedStyle(element).transitionDuration))
  expect(duration).toBeLessThanOrEqual(.00001)
})

test('stretched-link keeps its hit area inside a positioned container and exposes its overlay layer', async ({ page }) => {
  const link = page.locator('#stretched')
  expect(await link.evaluate(element => getComputedStyle(element, '::after').zIndex)).toBe('1')
  await link.evaluate(element => element.style.setProperty('--trm-stretched-link-z-index', '9'))
  expect(await link.evaluate(element => getComputedStyle(element, '::after').zIndex)).toBe('9')
  const box = (await page.locator('#card').boundingBox())!
  await page.mouse.click(box.x + box.width - 10, box.y + 10)
  await expect(page).toHaveURL(/#target$/)
})

test('the before configuration preserves the expanded pointer target', async ({ page }) => {
  await page.route('**/detail-helpers.css', route => route.fulfill({ contentType: 'text/css', body: before }))
  await page.reload()
  const pseudo = await page.locator('#stretched').evaluate(element => ({ before: getComputedStyle(element, '::before').zIndex, after: getComputedStyle(element, '::after').content }))
  expect(pseudo.before).toBe('7')
  expect(pseudo.after).toBe('none')
  const box = (await page.locator('#card').boundingBox())!
  await page.mouse.click(box.x + box.width - 10, box.y + 10)
  await expect(page).toHaveURL(/#target$/)
})

test('vertical rules use current boundary colors and preserve physical width in vertical writing', async ({ page }) => {
  await expect(page.locator('#rule')).toHaveCSS('opacity', '1')
  await expect(page.locator('#rule')).toHaveCSS('width', '1px')
  const boundary = () => page.locator('#rule').evaluate(element => { const probe = document.createElement('span'); probe.style.backgroundColor = 'var(--trm-border-color)'; element.append(probe); const color = getComputedStyle(probe).backgroundColor; probe.remove(); return color })
  await expect(page.locator('#rule')).toHaveCSS('background-color', await boundary())
  await page.locator('html').evaluate(element => element.setAttribute('data-trm-theme', 'dark'))
  await expect(page.locator('#rule')).toHaveCSS('background-color', await boundary())
  await page.locator('#rule').evaluate(element => { element.style.setProperty('--trm-vr-border-width', '3px'); element.style.setProperty('--trm-border-color', '#123456'); element.style.writingMode = 'vertical-rl' })
  await expect(page.locator('#rule')).toHaveCSS('width', '3px')
  await expect(page.locator('#rule')).toHaveCSS('background-color', 'rgb(18, 52, 86)')
})

test('utilities-only entry includes the detailed helper behaviors', async ({ page, browserName }) => {
  await page.route('**/detail-helpers.css', route => route.fulfill({ contentType: 'text/css', body: standalone }))
  await page.reload()
  await expect(page.locator('#motion')).toHaveCSS('display', 'inline-flex')
  await expect(page.locator('#rule')).toHaveCSS('width', '1px')
  expect(await page.locator('#stretched').evaluate(element => getComputedStyle(element, '::after').content)).toBe('""')
  await page.keyboard.press('Tab')
  if (browserName === 'webkit') await page.locator('#focus').focus()
  await expect(page.locator('#focus')).toBeFocused()
  await expect(page.locator('#focus')).toHaveCSS('outline-color', 'rgb(7, 89, 133)')
})

test('native forced-color adjustment preserves visible focus geometry', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Native forced-colors emulation is checked in Chromium; other engines require manual platform review')
  await page.emulateMedia({ forcedColors: 'active' })
  await page.keyboard.press('Tab')
  await expect(page.locator('#focus')).toHaveCSS('outline-style', 'solid')
  await expect(page.locator('#focus')).toHaveCSS('outline-width', '3px')
  const color = await page.locator('#focus').evaluate(element => getComputedStyle(element).outlineColor)
  expect(color).not.toBe('rgba(0, 0, 0, 0)')
  expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
})
