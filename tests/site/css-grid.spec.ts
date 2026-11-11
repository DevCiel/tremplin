import { readFileSync } from 'node:fs'
import { compileString } from 'sass'
import { expect, test, type Page } from '@playwright/test'

const styles = {
  full: readFileSync('dist/css/tremplin.css', 'utf8'),
  grid: readFileSync('dist/css/tremplin-grid.css', 'utf8'),
  custom: compileString("@use 'src/scss/config' with ($grid-columns: 6, $breakpoints: (base: 0, '2xl': 500px)); @use 'src/scss/tremplin-grid';", { loadPaths: [process.cwd()] }).css
}
const fixture = `<main><h1>CSS Grid placement</h1>
  <div id="basic" class="grid zero" style="width:480px"><div id="basic-col" class="g-col-6 cell">Six</div><div id="placed" class="g-col-3 g-start-3 cell">Placed</div><div id="start-only" class="g-start-3 cell">Start only</div><div id="plain" class="cell">Plain child</div><div id="lookalike" class="project-g-col-6 cell">Not a grid class</div><div id="pref-only" class="md:g-col-6 cell">Responsive only</div></div>
  <div id="responsive" class="grid zero" style="width:700px"><div id="responsive-col" class="g-col-12 md:g-col-6 cell">Responsive</div></div>
  <div id="viewport" class="row" style="width:700px"><div id="viewport-col" class="col-12 md:col-6 cell">Viewport</div></div>
  <div id="outer" class="grid zero" style="width:1000px"><section class="g-col-12"><div id="inner" class="grid zero" style="width:480px"><div id="inner-col" class="g-col-12 md:g-col-6 cell">Nested</div></div></section></div>
  <div id="reset" class="grid zero" style="width:700px"><div id="reset-col" class="g-col-3 g-start-3 md:g-col-6 cell">Reset start</div><div id="persist-col" class="g-col-3 g-start-3 md:g-col-6 md:g-start-4 cell">Repeat start</div><div id="responsive-start" class="md:g-start-4 cell">Responsive start only</div></div>
  <section style="width:800px;container-type:inline-size"><div id="ancestor-grid" class="grid zero" style="width:300px"><div id="ancestor-col" class="g-col-12 sm:g-col-6 cell">Nearest container</div></div></section>
  <div id="wrap" class="grid" style="width:640px"><div class="g-col-6 cell">First</div><div class="g-col-6 cell">Second</div><div class="g-col-6 cell">Third</div></div>
  <div id="runtime" class="grid zero" style="width:600px"><div id="runtime-col" class="g-col-3 cell">Runtime tracks</div></div>
  <div id="digit" class="grid zero" style="width:499px"><div id="digit-col" class="2xl:g-col-3 cell">Digit prefix</div><div id="digit-start" class="2xl:g-start-3 cell">Digit start</div></div>
</main>`

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1200 })
  await page.route('**/css-grid-check.css', route => route.fulfill({ contentType: 'text/css', body: styles.full }))
  await page.route('**/css-grid-check/', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="en"><head><title>CSS Grid checks</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/css-grid-check.css"><style>html{font-size:16px}body{margin:0}*,::before,::after{box-sizing:border-box}.zero{--trm-gap:0}.cell{min-height:24px;overflow-wrap:anywhere}</style></head><body>${fixture}</body></html>` }))
  await page.goto('/css-grid-check/')
})
const useStyles = async (page: Page, mode: keyof typeof styles) => {
  await page.route('**/css-grid-check.css', route => route.fulfill({ contentType: 'text/css', body: styles[mode] }))
  await page.reload()
}
const ratio = (page: Page, child: string, parent: string) => page.locator(`#${child}`).evaluate((element, id) => element.getBoundingClientRect().width / document.getElementById(id)!.getBoundingClientRect().width, parent)
const setWidth = (page: Page, id: string, width: number) => page.locator(`#${id}`).evaluate((element, value) => { element.style.width = `${value}px` }, width)

test('literal spans coexist with normally auto-placed plain, lookalike and responsive-only items', async ({ page }) => {
  for (const mode of ['full', 'grid'] as const) {
    await useStyles(page, mode)
    await expect(page.locator('#basic')).toHaveCSS('container-type', 'inline-size')
    expect(await ratio(page, 'basic-col', 'basic')).toBeCloseTo(.5, 3)
    expect(await ratio(page, 'placed', 'basic')).toBeCloseTo(.25, 3)
    await expect(page.locator('#placed')).toHaveCSS('grid-column-start', '3')
    await expect(page.locator('#start-only')).toHaveCSS('grid-column-end', 'auto')
    expect(await ratio(page, 'start-only', 'basic')).toBeCloseTo(1 / 12, 3)
    expect(await ratio(page, 'pref-only', 'basic')).toBeCloseTo(1 / 12, 3)
    expect(await ratio(page, 'plain', 'basic')).toBeCloseTo(1 / 12, 3)
    expect(await ratio(page, 'lookalike', 'basic')).toBeCloseTo(1 / 12, 3)
  }
})

test('Grid prefixes follow container bounds while Flexbox prefixes follow the viewport', async ({ page }) => {
  for (const width of [767.984, 768]) {
    await setWidth(page, 'responsive', width)
    expect(await ratio(page, 'responsive-col', 'responsive')).toBeCloseTo(width < 768 ? 1 : .5, 3)
  }
  await setWidth(page, 'responsive', 800)
  for (const viewport of [600, 1000]) {
    await page.setViewportSize({ width: viewport, height: 1200 })
    expect(await ratio(page, 'responsive-col', 'responsive')).toBeCloseTo(.5, 3)
    expect(await ratio(page, 'viewport-col', 'viewport')).toBeCloseTo(viewport < 768 ? 1 : .5, 3)
  }
})

test('nested grids establish independent nearest query ancestors', async ({ page }) => {
  expect(await ratio(page, 'inner-col', 'inner')).toBeCloseTo(1, 3)
  await setWidth(page, 'inner', 800)
  expect(await ratio(page, 'inner-col', 'inner')).toBeCloseTo(.5, 3)
  await setWidth(page, 'outer', 600)
  expect(await ratio(page, 'inner-col', 'inner')).toBeCloseTo(.5, 3)
})

test('responsive column shorthands reset earlier starts and same-tier starts can restore them', async ({ page }) => {
  await expect(page.locator('#reset-col')).toHaveCSS('grid-column-start', '3')
  await expect(page.locator('#responsive-start')).toHaveCSS('grid-column-start', 'auto')
  expect(await ratio(page, 'responsive-start', 'reset')).toBeCloseTo(1 / 12, 3)
  await setWidth(page, 'reset', 768)
  await expect(page.locator('#reset-col')).toHaveCSS('grid-column-start', 'auto')
  await expect(page.locator('#reset-col')).toHaveCSS('grid-column-end', 'span 6')
  await expect(page.locator('#persist-col')).toHaveCSS('grid-column-start', '4')
  await expect(page.locator('#responsive-start')).toHaveCSS('grid-column-start', '4')
  await expect(page.locator('#responsive-start')).toHaveCSS('grid-column-end', 'auto')
})

test('Grid owns the nearest query context unless explicitly opting out to a native ancestor', async ({ page }) => {
  expect(await ratio(page, 'ancestor-col', 'ancestor-grid')).toBeCloseTo(1, 3)
  await setWidth(page, 'ancestor-grid', 575.984)
  expect(await ratio(page, 'ancestor-col', 'ancestor-grid')).toBeCloseTo(1, 3)
  await setWidth(page, 'ancestor-grid', 576)
  expect(await ratio(page, 'ancestor-col', 'ancestor-grid')).toBeCloseTo(.5, 3)
  await setWidth(page, 'ancestor-grid', 300)
  await page.locator('#ancestor-grid').evaluate(element => { element.style.containerType = 'normal' })
  expect(await ratio(page, 'ancestor-col', 'ancestor-grid')).toBeCloseTo(.5, 3)
})

test('spans auto-wrap with the retained native gap rather than Flexbox gutter margins', async ({ page }) => {
  await expect(page.locator('#wrap')).toHaveCSS('gap', '24px')
  const boxes = await page.locator('#wrap > *').evaluateAll(elements => elements.map(element => { const box = element.getBoundingClientRect(); return { x: box.x, y: box.y, width: box.width, height: box.height } }))
  expect(boxes[0]!.y).toBe(boxes[1]!.y)
  expect(boxes[1]!.x - boxes[0]!.x - boxes[0]!.width).toBeCloseTo(24, 2)
  expect(boxes[2]!.y - boxes[0]!.y - boxes[0]!.height).toBeCloseTo(24, 2)
})

test('runtime track counts change literal-span geometry and logical start lines work in RTL', async ({ page }) => {
  expect(await ratio(page, 'runtime-col', 'runtime')).toBeCloseTo(.25, 3)
  await page.locator('#runtime').evaluate(element => element.style.setProperty('--trm-columns', '6'))
  expect(await ratio(page, 'runtime-col', 'runtime')).toBeCloseTo(.5, 3)
  for (const direction of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('dir', value), direction)
    const offset = await page.locator('#placed').evaluate((element, dir) => { const grid = document.getElementById('basic')!.getBoundingClientRect(); const box = element.getBoundingClientRect(); return dir === 'ltr' ? box.left - grid.left : grid.right - box.right }, direction)
    expect(offset).toBeCloseTo(80, 2)
  }
})

test('configured six-column/digit-prefix classes opt into auto placement before activation', async ({ page }) => {
  await useStyles(page, 'custom')
  for (const width of [499.984, 500]) {
    await setWidth(page, 'digit', width)
    expect(await ratio(page, 'digit-col', 'digit')).toBeCloseTo(width < 500 ? 1 / 6 : .5, 3)
    await expect(page.locator('#digit-start')).toHaveCSS('grid-column-start', width < 500 ? 'auto' : '3')
    expect(await ratio(page, 'digit-start', 'digit')).toBeCloseTo(1 / 6, 3)
  }
})

