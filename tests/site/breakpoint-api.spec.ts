import { pinnedLayoutStyles, rejectsPinnedSass } from './pinned-layout.fixture'
import { expect, test } from '@playwright/test'

const styles = await pinnedLayoutStyles({ ranges: `
  @use 'src/scss/config' with ($breakpoints: (base: 0, sm: 400px, md: 600px, lg: 800px));
  @use 'src/scss/layout/breakpoints' as bp;
  html { font-size: 20px; } body { margin: 0; }
  .probe { --matched: no; }
  #frame { container: shell / inline-size; width: 600px; }
  #inner { container-type: inline-size; width: 200px; }
  #em-frame { container: relative / inline-size; width: 600px; font-size: 20px; }
  @include bp.media-breakpoint-up(sm) { #v-up { --matched: yes; } }
  @include bp.media-breakpoint-down(md) { #v-down { --matched: yes; } }
  @include bp.media-breakpoint-between(sm, lg) { #v-between { --matched: yes; } }
  @include bp.media-breakpoint-only(sm) { #v-only { --matched: yes; } }
  @include bp.media-breakpoint-only(base) { #v-first { --matched: yes; } }
  @include bp.media-breakpoint-only(lg) { #v-last { --matched: yes; } }
  @include bp.media-breakpoint-between(md, md) { #v-empty { --matched: yes; } }
  @include bp.media-breakpoint-between(base, null) { #v-open { --matched: yes; } }
  @include bp.media-breakpoint-down(base) { #v-zero { --matched: yes; } }
  @include bp.container-breakpoint-up(sm, shell) { #c-up { --matched: yes; } }
  @include bp.container-breakpoint-down(md, shell) { #c-down { --matched: yes; } }
  @include bp.container-breakpoint-between(sm, lg, shell) { #c-between { --matched: yes; } }
  @include bp.container-breakpoint-only(sm, shell) { #c-only { --matched: yes; } }
  @include bp.container-breakpoint-only(base, shell) { #c-first { --matched: yes; } }
  @include bp.container-breakpoint-only(lg, shell) { #c-last { --matched: yes; } }
  @include bp.container-breakpoint-between(md, md, shell) { #c-empty { --matched: yes; } }
  @include bp.container-breakpoint-between(base, null, shell) { #c-open { --matched: yes; } }
  @include bp.container-breakpoint-down(base, shell) { #c-zero { --matched: yes; } }
  @include bp.container-breakpoint-up(sm) { #nearest { --matched: yes; } }
  @include bp.container-breakpoint-only(sm, absent) { #absent { --matched: yes; } }
  @include bp.container-breakpoint-between(base, null, absent) { #unbounded { --matched: yes; } }
  @include bp.media-breakpoint-up(scale, (base: 0, scale: 30em)) { #em-media { --matched: yes; } }
  @include bp.container-breakpoint-up(scale, relative, (base: 0, scale: 30em)) { #em-container { --matched: yes; } }
  $digit-tiers: (base: 0, '2xl': 500px);
  @include bp.loop-breakpoints-up($digit-tiers) using ($name, $prefix) {
    .#{$prefix}flag { @include bp.media-breakpoint-up($name, $digit-tiers) { --matched: yes; } }
  }
  @include bp.loop-breakpoints($digit-tiers) using ($name, $next, $prefix) {
    .#{$prefix}before-#{$name} { @include bp.media-breakpoint-down($next, $digit-tiers) { --matched: yes; } }
  }
` })
const css = styles.ranges

const keys = ['up', 'down', 'between', 'only', 'first', 'last', 'empty', 'open', 'zero']
const probes = (prefix: string) => keys.map(key => `<span class="probe" id="${prefix}-${key}">${prefix} ${key}</span>`).join('')
const matches = (width: number) => ({ up: width >= 400, down: width < 600, between: width >= 400 && width < 800, only: width >= 400 && width < 600, first: width < 400, last: width >= 800, empty: false, open: true, zero: true })

test.beforeEach(async ({ page }) => {
  await page.route('**/breakpoint-api.css', route => route.fulfill({ contentType: 'text/css', body: css }))
  await page.route('**/breakpoint-api-check/', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="en"><head><title>Breakpoint API checks</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/breakpoint-api.css"></head><body><main><h1>Breakpoint API checks</h1>${probes('v')}<div id="frame"><div id="inner">${probes('c')}<span class="probe" id="nearest">Nearest container</span><span class="probe" id="absent">Absent name</span></div></div><span class="probe" id="unbounded">Unbounded, no container</span><span class="probe" id="em-media">Media em bound</span><div id="em-frame"><span class="probe" id="em-container">Container em bound</span></div><span class="probe 2xl:flag" id="digit-up">Escaped up prefix</span><span class="probe 2xl:before-base" id="digit-down">Escaped next prefix</span></main></body></html>` }))
  await page.goto('/breakpoint-api-check/')
})

test('viewport intervals include lower and exclude upper edges with canonical range APIs', async ({ page }) => {
  for (const width of [399, 400, 599, 600, 799, 800, 801]) {
    await page.setViewportSize({ width, height: 900 })
    const expected = matches(width)
    for (const [key, on] of Object.entries(expected)) await expect(page.locator(`#v-${key}`)).toHaveCSS('--matched', on ? 'yes' : 'no')
  }
})

test('container intervals remain continuous at fractional widths just below each boundary', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  for (const width of [399.984, 400, 599.984, 600, 799.984, 800]) {
    await page.locator('#frame').evaluate((element, value) => { element.style.width = `${value}px` }, width)
    for (const [key, on] of Object.entries(matches(width))) await expect(page.locator(`#c-${key}`)).toHaveCSS('--matched', on ? 'yes' : 'no')
  }
})

test('named queries bypass nearer unnamed containers while unbounded branches need no ancestor', async ({ page }) => {
  await expect(page.locator('#c-up')).toHaveCSS('--matched', 'yes')
  await expect(page.locator('#nearest')).toHaveCSS('--matched', 'no')
  await expect(page.locator('#absent')).toHaveCSS('--matched', 'no')
  await expect(page.locator('#unbounded')).toHaveCSS('--matched', 'yes')
  await page.locator('#inner').evaluate(element => { element.style.width = '450px' })
  await expect(page.locator('#nearest')).toHaveCSS('--matched', 'yes')
  await page.locator('#frame').evaluate(element => { element.style.width = '350px' })
  await expect(page.locator('#c-up')).toHaveCSS('--matched', 'no')
  await expect(page.locator('#nearest')).toHaveCSS('--matched', 'yes')
})

test('container ranges are independent of viewport and direction and query physical width', async ({ page }) => {
  for (const direction of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('dir', value), direction)
    for (const width of [350, 1000]) {
      await page.setViewportSize({ width, height: 900 })
      await expect(page.locator('#c-between')).toHaveCSS('--matched', 'yes')
      await expect(page.locator('#c-only')).toHaveCSS('--matched', 'no')
    }
  }
  await page.locator('#frame').evaluate(element => { element.style.containerType = 'size'; element.style.writingMode = 'vertical-rl'; element.style.width = '450px'; element.style.height = '850px' })
  await expect(page.locator('#c-only')).toHaveCSS('--matched', 'yes')
  await expect(page.locator('#c-last')).toHaveCSS('--matched', 'no')
})

test('em container bounds use the container font while em media bounds use the initial font', async ({ page }) => {
  for (const width of [479, 480]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(page.locator('#em-media')).toHaveCSS('--matched', width >= 480 ? 'yes' : 'no')
  }
  await expect(page.locator('#em-container')).toHaveCSS('--matched', 'yes')
  await page.locator('#em-frame').evaluate(element => { element.style.width = '599.984px' })
  await expect(page.locator('#em-container')).toHaveCSS('--matched', 'no')
})

test('digit-prefixed loop selectors and next-tier down prefixes match real class names', async ({ page }) => {
  for (const width of [499, 500]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(page.locator('#digit-up')).toHaveCSS('--matched', width >= 500 ? 'yes' : 'no')
    await expect(page.locator('#digit-down')).toHaveCSS('--matched', width < 500 ? 'yes' : 'no')
  }
})


test('does not reintroduce the removed media-up convenience mixin', () => {
  rejectsPinnedSass("@use 'src/scss/layout/breakpoints' as bp; @include bp.media-up(sm) { .bad { display: block; } }", /Undefined mixin/)
})
