import { compileString } from 'sass'
import { utilitiesGuides } from '../helpers/utilities-mdx-contract'
import { expect, test } from '@playwright/test'

const css = compileString(`@use 'src/scss/layout/breakpoints' as bp; @use 'src/scss/tremplin-utilities' with ($utilities: (
  'project-fade': (property: opacity, class: project-fade, responsive: true, state: hover focus-visible active, print: true, dark: true, important: false, values: (50: .5, 75: .75, 100: 1)),
  'print-display': (property: display, class: project-display, print: true, values: (none: none)),
  'project-disabled': (enabled: false, property: display, class: project-disabled, responsive: true, state: hover, print: true, dark: true, values: (none: none)),
  'animation': (property: animation, class: project-motion, responsive: true, state: focus, print: true, dark: true, values: (pop: animation-pop .3s ease both))
)); .project-container-child { display:block; } @include bp.container-breakpoint-up(sm) { .project-container-child { display:flex; } }`, { loadPaths: [process.cwd()] }).css

test.beforeEach(async ({ page }) => {
  await page.route('**/variant-utilities.css', route => route.fulfill({ contentType: 'text/css', body: css }))
  await page.route('**/utility-variants/', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="en"><head><title>Utility variants</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/dist/css/tremplin.min.css"><link rel="stylesheet" href="/variant-utilities.css"></head><body><main><h1>Utility variant checks</h1>
    <div id="alias" class="d-none md:d-flex md:ms-3 md:ps-2">Prefix</div><div id="legacy" class="d-none d-md-flex ms-md-3 ps-md-2">Legacy</div>
    <button id="state" class="hover:project-fade-50 md:hover:project-fade-75 focus-visible:project-fade-100 md:focus-visible:project-fade-50" type="button">State</button>
    <div id="dark" class="project-fade-100 dark:project-fade-50">OS-driven dark variant</div>
    <div id="print" class="project-fade-100 print:project-fade-50">Print variant</div><div id="print-alias" class="print:project-display-none">Screen only</div>
    <div id="both" class="project-fade-100 print:project-fade-75 dark:project-fade-50">Dark follows print in the cascade</div>
    <div id="container" class="contains-inline" style="inline-size:575px"><div id="container-child" class="project-container-child">Explicit application query</div></div>
    <div id="size-container" class="contains-size" style="inline-size:10rem;block-size:5rem">Size containment</div>
    <div id="motion" tabindex="0" class="project-motion-demo focus:project-motion-pop md:focus:project-motion-pop dark:project-motion-pop print:project-motion-pop">Decorative motion</div>
    <div id="disabled" class="project-disabled-none md:project-disabled-none dark:project-disabled-none print:project-disabled-none hover:project-disabled-none">Still visible</div>
    </main></body></html>` }))
  await page.setViewportSize({ width: 767, height: 900 })
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference', media: 'screen' })
  await page.goto('/utility-variants/')
})

test('canonical responsive spacing works in both directions without retired aliases', async ({ page }) => {
  await expect(page.locator('#alias')).toHaveCSS('display', 'none')
  await page.setViewportSize({ width: 768, height: 900 })
  for (const direction of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((element, dir) => element.setAttribute('dir', dir), direction)
    await expect(page.locator('#alias')).toHaveCSS('display', 'flex')
    await expect(page.locator('#alias')).toHaveCSS('margin-inline-start', '8px')
    await expect(page.locator('#alias')).toHaveCSS('padding-inline-start', '6px')
    await expect(page.locator('#legacy')).toHaveCSS('display', 'none')
  }
})

test('state lists combine with responsive prefixes and keyboard focus-visible', async ({ page }) => {
  await page.locator('#state').hover()
  await expect(page.locator('#state')).toHaveCSS('opacity', '0.5')
  await page.setViewportSize({ width: 768, height: 900 })
  await page.locator('#state').hover()
  await expect(page.locator('#state')).toHaveCSS('opacity', '0.75')
  await page.mouse.move(0, 0)
  await page.keyboard.press('Tab')
  await expect(page.locator('#state')).toBeFocused()
  await expect(page.locator('#state')).toHaveCSS('opacity', '0.5')
  await page.setViewportSize({ width: 767, height: 900 })
  await expect(page.locator('#state')).toHaveCSS('opacity', '1')
})

test('dark prefixes follow the OS media query independently of explicit framework themes', async ({ page }) => {
  await page.locator('html').evaluate(element => element.setAttribute('data-trm-theme', 'dark'))
  await expect(page.locator('#dark')).toHaveCSS('opacity', '1')
  await page.locator('html').evaluate(element => element.setAttribute('data-trm-theme', 'light'))
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('#dark')).toHaveCSS('opacity', '0.5')
  await expect(page.locator('#disabled')).toHaveCSS('display', 'block')
})

test('explicit print variants work and disabled families remain absent', async ({ page }) => {
  await expect(page.locator('#print')).toHaveCSS('opacity', '1')
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('#print')).toHaveCSS('opacity', '0.5')
  await expect(page.locator('#print-alias')).toHaveCSS('display', 'none')
  await expect(page.locator('#disabled')).toHaveCSS('display', 'block')
  await expect(page.locator('#both')).toHaveCSS('opacity', '0.75')
  await page.emulateMedia({ colorScheme: 'dark' })
  expect(await page.evaluate(() => matchMedia('print').matches)).toBe(true)
  const darkInPrint = await page.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches)
  test.info().annotations.push({ type: 'capability', description: 'dark-media-in-print=' + darkInPrint })
  await expect(page.locator('#both')).toHaveCSS('opacity', darkInPrint ? '0.5' : '0.75')
})

test('contains utilities establish containers for an explicit application query, not a hidden CQ alias', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await expect(page.locator('#container')).toHaveCSS('container-type', 'inline-size')
  await expect(page.locator('#size-container')).toHaveCSS('container-type', 'size')
  await expect(page.locator('#container-child')).toHaveCSS('display', 'block')
  await page.locator('#container').evaluate(element => element.style.inlineSize = '576px')
  await expect(page.locator('#container-child')).toHaveCSS('display', 'flex')
})

test('custom motion retains the pinned guard limitation and the documented application rule cancels it', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 })
  await page.locator('#motion').focus()
  await expect(page.locator('#motion')).toHaveCSS('animation-name', 'animation-pop')
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
  await expect(page.locator('#motion')).toHaveCSS('animation-name', 'animation-pop')
  const motion = utilitiesGuides[0]!.sections.find(section => section.heading === 'Motion and preferences')!
  const preference = motion.code!.find(sample => sample.language === 'css')!.source
  await page.addStyleTag({ content: preference })
  await expect(page.locator('#motion')).toHaveCSS('animation-name', 'none')
  await expect(page.locator('#motion')).toHaveCSS('transform', 'none')
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('#motion')).toHaveCSS('animation-name', 'none')
})
