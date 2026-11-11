import { expect, test, type Page } from '@playwright/test'
import { pinnedLayoutStyles, rejectsPinnedSass } from './pinned-layout.fixture'

const styles = await pinnedLayoutStyles({
  full: "@use 'src/scss/tremplin';",
  grid: "@use 'src/scss/tremplin-grid';",
  configured: "@use 'src/scss/config' with ($grid-gutter-x: 32px, $container-padding-x: 16px, $grid-row-columns: 2, $gutters: (0: 0, tight: 8px)); @use 'src/scss/tremplin-grid';",
  manual: "@use 'src/scss/config' with ($enable-grid-classes: false, $grid-row-columns: 2, $gutters: (0: 0, tight: 8px)); @use 'src/scss/mixins/grid' as grid; @use 'src/scss/layout/containers' as containers; .project-frame { @include containers.make-container(16px); max-width: 600px; } .project-row { @include grid.make-row(0, 0); > * { @include grid.make-col-ready(); } } @include grid.make-grid-columns(4, $breakpoints: (base: 0, '2xl': 600px));"
})

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1200 })
  await page.route('**/layout-generators.css', route => route.fulfill({ contentType: 'text/css', body: styles.full }))
  await page.route('**/layout-generators-check/', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="en"><head><title>Grid tokens and generators</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/layout-generators.css"><style>html{font-size:16px}body{margin:0}*,::before,::after{box-sizing:border-box}.cell{min-height:24px;line-height:24px}</style></head><body><main><h1>Grid tokens and generators</h1>
    <div id="tokens" class="grid" style="width:600px;--trm-gap:0"><div id="token-col" class="g-col-3 cell">Tokens</div></div>
    <div style="--trm-rows:3"><div id="rows" class="grid" style="width:400px;height:200px;--trm-columns:2;--trm-gap:0"><div class="g-col-1 cell">One</div><div class="g-col-1 cell">Two</div><div class="g-col-1 cell">Three</div></div></div>
    <div id="parent" class="grid" style="width:600px;--trm-columns:4;--trm-rows:3;--trm-gap:12px"><section class="g-col-4"><div id="child" class="grid" style="width:400px"><div class="g-col-1 cell">Nested</div></div></section></div>
    <div id="configured-frame" class="container"><div id="configured-row" class="row g-tight"><div class="col-6 cell">Configured gutter</div></div><div id="configured-count" class="row row-cols-1 md:row-cols-2 g-0"><div class="cell">One</div><div class="cell">Two</div></div></div>
    <div class="project-frame" id="manual-frame"><div id="manual-columns" class="project-row g-0"><div class="col-4 2xl:col-2 cell">Generated column</div></div><div id="manual-offset" class="project-row g-0"><div class="col-2 offset-1 2xl:offset-0 cell">Offset</div></div><div id="manual-count" class="project-row row-cols-1 2xl:row-cols-2 g-0"><div class="cell">One</div><div class="cell">Two</div></div><div id="manual-gutter" class="project-row g-0 2xl:gx-tight 2xl:gy-tight"><div class="col-2 cell">Spacing</div></div></div>
    </main></body></html>` }))
  await page.goto('/layout-generators-check/')
})
const useStyles = async (page: Page, mode: keyof typeof styles) => {
  await page.route('**/layout-generators.css', route => route.fulfill({ contentType: 'text/css', body: styles[mode] }))
  await page.reload()
}
const ratio = (page: Page, id: string) => page.locator(`#${id}`).evaluate(row => row.firstElementChild!.getBoundingClientRect().width / row.getBoundingClientRect().width)

test('canonical column/gap tokens work without legacy fallbacks in both entries', async ({ page }) => {
  for (const mode of ['full', 'grid'] as const) {
    await useStyles(page, mode)
    expect(await ratio(page, 'tokens')).toBeCloseTo(.25, 3)
    await page.locator('#tokens').evaluate(element => element.style.setProperty('--trm-grid-columns', '6'))
    expect(await ratio(page, 'tokens')).toBeCloseTo(.25, 3)
    await page.locator('#tokens').evaluate(element => element.style.setProperty('--trm-columns', '3'))
    expect(await ratio(page, 'tokens')).toBeCloseTo(1, 3)
    await page.locator('#tokens').evaluate(element => { element.style.setProperty('--trm-grid-gap', '20px'); element.style.setProperty('--trm-gap', '4px') })
    await expect(page.locator('#tokens')).toHaveCSS('gap', '4px')
  }
})

test('nested grids redeclare canonical defaults and ignore inherited legacy token names', async ({ page }) => {
  const child = page.locator('#child')
  expect(await child.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(12)
  await expect(child).toHaveCSS('gap', '24px')
  await expect(child).toHaveCSS('--trm-rows', '1')
  await page.locator('#parent').evaluate(element => { element.style.setProperty('--trm-grid-columns', '6'); element.style.setProperty('--trm-grid-gap', '8px') })
  expect(await child.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(12)
  await expect(child).toHaveCSS('gap', '24px')
  expect(await page.locator('#parent').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(4)
})

test('row tokens create explicit equal rows and the migration override restores automatic rows', async ({ page }) => {
  for (const mode of ['full', 'grid'] as const) {
    await useStyles(page, mode)
    const rows = page.locator('#rows')
    const tracks = () => rows.evaluate(element => getComputedStyle(element).gridTemplateRows.split(' ').map(value => parseFloat(value)))
    const initial = await tracks()
    expect(initial[0]!).toBeGreaterThan(initial[1]!)
    await rows.evaluate(element => element.style.setProperty('--trm-rows', '2'))
    expect(await tracks()).toEqual([100, 100])
    await rows.evaluate(element => { element.style.setProperty('--trm-rows', '1'); element.style.gridTemplateRows = 'none' })
    expect(await tracks()).toEqual([100, 100])
  }
})

test('gap tokens accept independent row/column values and preserve RTL geometry', async ({ page }) => {
  const rows = page.locator('#rows')
  await rows.evaluate(element => { element.style.setProperty('--trm-rows', '2'); element.style.setProperty('--trm-gap', '10px 20px') })
  for (const direction of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('dir', value), direction)
    await expect(rows).toHaveCSS('row-gap', '10px')
    await expect(rows).toHaveCSS('column-gap', '20px')
    const boxes = await rows.locator('> *').evaluateAll(elements => elements.map(element => { const box = element.getBoundingClientRect(); return { x: box.x, y: box.y, width: box.width, height: box.height } }))
    expect(Math.abs(boxes[1]!.x - boxes[0]!.x) - boxes[0]!.width).toBeCloseTo(20, 2)
    expect(boxes[2]!.y - boxes[0]!.y - boxes[0]!.height).toBeCloseTo(10, 2)
  }
})

test('container padding, row gutters, and numbered-row limits are independently configurable', async ({ page }) => {
  await useStyles(page, 'configured')
  await expect(page.locator('#configured-frame')).toHaveCSS('padding-inline-start', '8px')
  await expect(page.locator('#configured-frame')).toHaveCSS('--trm-gutter-y', '0')
  await expect(page.locator('#configured-row > *')).toHaveCSS('padding-inline-start', '4px')
  await expect(page.locator('#configured-row > *')).toHaveCSS('margin-block-start', '8px')
  for (const width of [767, 768]) {
    await page.setViewportSize({ width, height: 1200 })
    expect(await ratio(page, 'configured-count')).toBeCloseTo(width < 768 ? 1 : .5, 3)
  }
})

test('public factories build a prepared custom grid without default grid class output', async ({ page }) => {
  await useStyles(page, 'manual')
  await expect(page.locator('#manual-frame')).toHaveCSS('padding-inline-start', '8px')
  for (const direction of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('dir', value), direction)
    for (const width of [599, 600]) {
      await page.setViewportSize({ width, height: 1200 })
      expect(await ratio(page, 'manual-columns')).toBeCloseTo(width < 600 ? 1 : .5, 3)
      expect(await ratio(page, 'manual-count')).toBeCloseTo(width < 600 ? 1 : .5, 3)
      const offset = await page.locator('#manual-offset').evaluate(row => parseFloat(getComputedStyle(row.firstElementChild!).marginInlineStart) / row.getBoundingClientRect().width)
      expect(offset).toBeCloseTo(width < 600 ? .25 : 0, 3)
      await expect(page.locator('#manual-gutter > *')).toHaveCSS('padding-inline-start', width < 600 ? '0px' : '4px')
      await expect(page.locator('#manual-gutter > *')).toHaveCSS('margin-block-start', width < 600 ? '0px' : '8px')
    }
  }
})


test('requires shared configuration and factories from their actual owning modules', () => {
  rejectsPinnedSass("@use 'src/scss/tremplin-grid' with ($grid-gutter-x: 32px);", /not declared with !default/)
  rejectsPinnedSass("@use 'src/scss/mixins' as m; .bad { @include m.make-container(); }", /Undefined mixin/)
})
