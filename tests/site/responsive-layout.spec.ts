import { pinnedLayoutStyles, rejectsPinnedSass } from './pinned-layout.fixture'
import { expect, test, type Page } from '@playwright/test'

const styles = await pinnedLayoutStyles({
  full: "@use 'src/scss/tremplin';",
  grid: "@use 'src/scss/tremplin-grid';",
  custom: "@use 'src/scss/config' with ($breakpoints: (base: 0, '2xl': 900px), $container-max-widths: (sm: null, md: null, lg: null, xl: null, 2xl: null, '2xl': 800px), $grid-columns: 6); @use 'src/scss/tremplin-grid';"
})
const content = `<main><h1>Responsive layout checks</h1>
  ${['container', 'container-fluid', 'sm:container', 'md:container', 'lg:container', 'xl:container', '2xl:container'].map(name => `<div data-container="${name}" class="${name}">${name}</div>`).join('')}
  <div id="unsupported-container" class="xxl:container">No default alias</div>
  <div class="container">
    <div id="prefix" class="row g-0"><div class="col-12 md:col-6 lg:col-4">Column</div></div>
    <div id="legacy" class="row g-0"><div class="col-12 col-md-6 col-lg-4">Column</div></div>
    <div id="equal-prefix" class="row g-0"><div class="md:col">Equal</div><div class="md:col">Equal</div></div>
    <div id="equal-legacy" class="row g-0"><div class="col-md">Equal</div><div class="col-md">Equal</div></div>
    <div id="auto-prefix" class="row g-0"><div class="col-12 md:col-auto">Content label</div><div class="col">Flexible</div></div>
    <div id="auto-legacy" class="row g-0"><div class="col-12 col-md-auto">Content label</div><div class="col">Flexible</div></div>
    <div id="row-prefix" class="row row-cols-1 md:row-cols-3 g-0"><div>First<span id="grandchild" style="display:block;width:31px">Nested</span></div><div>Second</div><div>Third</div></div>
    <div id="row-legacy" class="row row-cols-1 row-cols-md-3 g-0"><div>First</div><div>Second</div><div>Third</div></div>
    <div id="row-auto-prefix" class="row row-cols-1 md:row-cols-auto g-0"><div>Short</div><div>Longer label</div></div>
    <div id="row-auto-legacy" class="row row-cols-1 row-cols-md-auto g-0"><div>Short</div><div>Longer label</div></div>
    <div id="offset-prefix" class="row g-0"><div class="col-6 offset-3 md:offset-0">Reset</div></div>
    <div id="offset-legacy" class="row g-0"><div class="col-6 offset-3 offset-md-0">Reset</div></div>
    <div id="gutter-prefix" class="row g-1 md:gx-4 md:gy-3"><div class="col-6">Gutters</div></div>
    <div id="gutter-legacy" class="row g-1 gx-md-4 gy-md-3"><div class="col-6">Gutters</div></div>
    <div id="mixed" class="row g-0"><div class="col-12 md:col-4 md:col-6">Conflicting canonical widths</div></div>
    <div id="order-prefix" class="row g-0"><div class="col order-2 md:order-1">Ordered</div></div>
    <div id="order-legacy" class="row g-0"><div class="col order-2 order-md-1">Ordered</div></div>
  </div>
  <section style="width:300px;container-type:inline-size"><div id="narrow-container" class="md:container"><div id="narrow-row" class="row g-0"><div class="col-12 md:col-6">Viewport, not container, responsive</div></div></div></section>
  <div class="2xl:container" id="digit-container"><div class="row g-0" id="digit-prefix"><div class="col-6 2xl:col-3">Digit prefix</div></div><div class="row g-0" id="digit-legacy"><div class="col-6 col-2xl-3">Digit prefix</div></div><div class="row g-0" id="digit-offset"><div class="col-3 offset-1 2xl:offset-0">Reset</div></div></div>
</main>`

test.beforeEach(async ({ page }) => {
  await page.route('**/responsive-layout.css', route => route.fulfill({ contentType: 'text/css', body: styles.full }))
  await page.route('**/responsive-layout-check/', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="en"><head><title>Responsive layouts</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/responsive-layout.css"><style>html{font-size:16px}body{margin:0}*,::before,::after{box-sizing:border-box}</style></head><body>${content}</body></html>` }))
  await page.goto('/responsive-layout-check/')
})

const useStyles = async (page: Page, mode: keyof typeof styles) => {
  await page.route('**/responsive-layout.css', route => route.fulfill({ contentType: 'text/css', body: styles[mode] }))
  await page.reload()
}
const ratio = (page: Page, id: string) => page.locator(`#${id}`).evaluate(row => row.firstElementChild!.getBoundingClientRect().width / row.getBoundingClientRect().width)

test('responsive container progression and fluid geometry work in full and grid-only CSS', async ({ page }) => {
  const tiers = [576, 768, 1024, 1280, 1536]
  const maximums = [540, 720, 960, 1200, 1440]
  for (const mode of ['full', 'grid'] as const) {
    await useStyles(page, mode)
    for (const width of [575, 576, 767, 768, 991, 992, 1023, 1024, 1279, 1280, 1400, 1535, 1536, 1600]) {
      await page.setViewportSize({ width, height: 1200 })
      const layout = await page.locator('[data-container]').evaluateAll(elements => ({ available: document.querySelector('main')!.getBoundingClientRect().width, boxes: elements.map(element => ({ name: element.getAttribute('data-container')!, width: element.getBoundingClientRect().width, start: parseFloat(getComputedStyle(element).paddingInlineStart), end: parseFloat(getComputedStyle(element).paddingInlineEnd) })) }))
      let tier = -1
      for (let i = 0; i < tiers.length; i++) if (width >= tiers[i]!) tier = i
      for (const [index, box] of layout.boxes.entries()) {
        const activation = index < 2 ? 0 : tiers[Math.min(index - 2, tiers.length - 1)]!
        const expected = index === 1 || width < activation || tier === -1 ? layout.available : Math.min(layout.available, maximums[tier]!)
        expect(box.width, `${mode} ${width}px ${box.name}`).toBeCloseTo(expected, 1)
        expect(box.start).toBe(12)
        expect(box.end).toBe(12)
      }
    }
  }
})

test('column, equal and auto prefixes respond while retired infix names remain inert', async ({ page }) => {
  for (const mode of ['full', 'grid'] as const) {
    await useStyles(page, mode)
    for (const width of [767, 768, 991, 992, 1023, 1024]) {
      await page.setViewportSize({ width, height: 1200 })
      const expected = width < 768 ? 1 : width < 1024 ? .5 : 1 / 3
      expect(await ratio(page, 'prefix')).toBeCloseTo(expected, 3)
      expect(await ratio(page, 'legacy')).toBeCloseTo(1, 3)
      expect(await ratio(page, 'equal-prefix')).toBeCloseTo(width < 768 ? 1 : .5, 3)
      expect(await ratio(page, 'equal-legacy')).toBeCloseTo(1, 3)
      expect(await ratio(page, 'auto-legacy')).toBeCloseTo(1, 3)
      if (width < 768) expect(await ratio(page, 'auto-prefix')).toBeCloseTo(1, 3)
      else { expect(await ratio(page, 'auto-prefix')).toBeGreaterThan(0); expect(await ratio(page, 'auto-prefix')).toBeLessThan(.5) }
    }
  }
})

test('row-column prefixes affect only direct children and order prefixes work in grid-only CSS', async ({ page }) => {
  await useStyles(page, 'grid')
  for (const width of [767, 768]) {
    await page.setViewportSize({ width, height: 1200 })
    expect(await ratio(page, 'row-prefix')).toBeCloseTo(width < 768 ? 1 : 1 / 3, 3)
    expect(await ratio(page, 'row-legacy')).toBeCloseTo(1, 3)
    expect(await ratio(page, 'row-auto-legacy')).toBeCloseTo(1, 3)
    if (width < 768) expect(await ratio(page, 'row-auto-prefix')).toBeCloseTo(1, 3)
    else expect(await ratio(page, 'row-auto-prefix')).toBeLessThan(.5)
    await expect(page.locator('#grandchild')).toHaveCSS('width', '31px')
    await expect(page.locator('#order-prefix > *')).toHaveCSS('order', width < 768 ? '2' : '1')
    await expect(page.locator('#order-legacy > *')).toHaveCSS('order', '2')
  }
})

test('gutter axes and zero-offset resets retain their LTR/RTL behavior', async ({ page }) => {
  for (const direction of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('dir', value), direction)
    for (const width of [767, 768]) {
      await page.setViewportSize({ width, height: 1200 })
      for (const name of ['prefix', 'legacy']) {
        const offset = await page.locator(`#offset-${name}`).evaluate(row => parseFloat(getComputedStyle(row.firstElementChild!).marginInlineStart) / row.getBoundingClientRect().width)
        expect(offset).toBeCloseTo(name === 'legacy' || width < 768 ? .25 : 0, 3)
        await expect(page.locator(`#gutter-${name} > *`)).toHaveCSS('padding-inline-start', name === 'legacy' || width < 768 ? '2px' : '6px')
        await expect(page.locator(`#gutter-${name} > *`)).toHaveCSS('margin-block-start', name === 'legacy' || width < 768 ? '4px' : '8px')
      }
    }
  }
})

test('conflicting canonical widths follow generated CSS order rather than HTML class order', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 1200 })
  expect(await ratio(page, 'mixed')).toBeCloseTo(.5, 3)
  await page.locator('#mixed > *').evaluate(element => element.setAttribute('class', 'md:col-6 md:col-4 col-12'))
  expect(await ratio(page, 'mixed')).toBeCloseTo(.5, 3)
})

test('Flexbox prefixes query the viewport even inside a narrow container-query ancestor', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1200 })
  expect(await ratio(page, 'narrow-row')).toBeCloseTo(.5, 3)
  await expect(page.locator('#narrow-container')).toHaveCSS('width', '300px')
  await page.locator('#narrow-container').evaluate(element => element.style.setProperty('--trm-gutter-x', '40px'))
  await expect(page.locator('#narrow-container')).toHaveCSS('padding-inline-start', '20px')
  await page.setViewportSize({ width: 767, height: 1200 })
  expect(await ratio(page, 'narrow-row')).toBeCloseTo(1, 3)
})

test('custom digit-prefixed tiers and six-column fractions work in a configured grid-only build', async ({ page }) => {
  await useStyles(page, 'custom')
  for (const width of [899, 900]) {
    await page.setViewportSize({ width, height: 1200 })
    expect(await ratio(page, 'digit-prefix')).toBeCloseTo(width < 900 ? 1 : .5, 3)
    expect(await ratio(page, 'digit-legacy')).toBeCloseTo(1, 3)
    const container = await page.locator('#digit-container').boundingBox()
    expect(container!.width).toBeCloseTo(width < 900 ? width : 800, 1)
    const offset = await page.locator('#digit-offset').evaluate(row => parseFloat(getComputedStyle(row.firstElementChild!).marginInlineStart) / row.getBoundingClientRect().width)
    expect(offset).toBeCloseTo(width < 900 ? 1 / 6 : 0, 3)
  }
})


test('does not generate an xxl container alias or accept retired width/shared-entry configuration', async ({ page }) => {
  await expect(page.locator('#unsupported-container')).toHaveCSS('padding-inline-start', '0px')
  rejectsPinnedSass("@use 'src/scss/config' with ($container-widths: (sm: 400px));", /not declared with !default/)
  rejectsPinnedSass("@use 'src/scss/tremplin-grid' with ($breakpoints: (base: 0));", /not declared with !default/)
})
