import { expect, test, type Page } from '@playwright/test'
import { pinnedLayoutStyles } from './pinned-layout.fixture'

const reboot = "@use 'src/scss/tremplin-reboot';"
const styles = await pinnedLayoutStyles({
  full: "@use 'src/scss/tremplin';",
  grid: [reboot, "@use 'src/scss/tremplin-grid';"],
  states: [reboot, "@use 'src/scss/config' with ($utilities: ('display': (property: display, class: d, responsive: true, state: hover, values: (none: none, flex: flex)))); @use 'src/scss/tremplin-grid';"]
})
const open = async (page: Page, mode: keyof typeof styles) => {
  await page.route('**/layout-defaults-check/', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="en"><head><title>Layout defaults</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>${styles[mode]} body{margin:0}html{font-size:16px}.test-row{width:600px;max-inline-size:100%}.cell{min-height:24px}</style></head><body>
    <h1>Layout defaults</h1>
    <div id="columns" class="row g-0 test-row"><div class="col-12 lg:col-6 xl:col-4 2xl:col-3 cell">Canonical</div></div>
    <div id="legacy" class="row g-0 test-row"><div class="col-12 col-lg-6 col-xl-4 col-xxl-3 cell">Legacy</div></div>
    <div id="canonical-container" class="2xl:container">Canonical container</div><div id="legacy-container" class="xxl:container">Legacy container</div>
    <div id="query" class="grid" style="width:1535.75px;--trm-gap:0"><div class="g-col-12 2xl:g-col-6 cell">Canonical grid</div><div class="g-col-12 xxl:g-col-6 cell">Legacy grid</div></div>
    <div id="stack-a" class="stack-container" style="width:1535.75px"><div class="hstack 2xl:vstack"><span>A</span><span>B</span></div></div>
    <div id="stack-b" class="stack-container" style="width:1535.75px"><div class="hstack xxl:vstack"><span>A</span><span>B</span></div></div>
    <div id="space-a" class="2xl:p-3">Spacing A</div><div id="space-b" class="xxl:p-3">Spacing B</div>
    <div id="state-a" class="d-none 2xl:hover:d-flex">State A</div><div id="state-b" class="d-none xxl:hover:d-flex">State B</div>
    <div id="sticky-a" class="2xl:sticky-top">Sticky A</div><div id="sticky-b" class="xxl:sticky-top">Sticky B</div>
    </body></html>` }))
  await page.goto('/layout-defaults-check/')
}
const ratio = (page: Page, id: string) => page.locator(id).evaluate(row => row.firstElementChild!.getBoundingClientRect().width / row.getBoundingClientRect().width)

for (const mode of ['full', 'grid'] as const) {
  test(`${mode}: canonical viewport tiers work while legacy aliases stay inert in LTR and RTL`, async ({ page }) => {
    await open(page, mode)
    for (const direction of ['ltr', 'rtl']) {
      await page.locator('html').evaluate((element, dir) => element.setAttribute('dir', dir), direction)
      for (const width of [991, 992, 1023, 1024, 1279, 1280, 1400, 1535, 1536]) {
        await page.setViewportSize({ width, height: 900 })
        const expected = width < 1024 ? 1 : width < 1280 ? .5 : width < 1536 ? 1 / 3 : .25
        expect(await ratio(page, '#columns'), `${mode} ${width}px`).toBeCloseTo(expected, 3)
        expect(await ratio(page, '#legacy')).toBeCloseTo(1, 3)
        const boxes = await page.locator('#canonical-container, #legacy-container').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().width))
        const available = await page.locator('body').evaluate(element => element.getBoundingClientRect().width)
        expect(boxes[0]).toBeCloseTo(width < 1536 ? available : 1440, 1)
        expect(boxes[1]).toBeCloseTo(available, 1)
        await expect(page.locator('#legacy-container')).toHaveCSS('padding-inline-start', '0px')
        await expect(page.locator('#canonical-container')).toHaveCSS('padding-inline-start', '12px')
      }
    }
  })

  test(`${mode}: canonical Grid queries the fractional container edge without an xxl alias`, async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 })
    await open(page, mode)
    for (const width of [1535.75, 1536]) {
      await page.locator('#query').evaluate((element, value) => { element.style.width = `${value}px` }, width)
      await expect(page.locator('#query > *').first()).toHaveCSS('grid-column-end', width < 1536 ? 'span 12' : 'span 6')
      await expect(page.locator('#query > *').last()).toHaveCSS('grid-column-end', 'span 12')
    }
    await page.locator('html').evaluate(element => element.style.fontSize = '20px')
    await expect(page.locator('#query > *').first()).toHaveCSS('grid-column-end', 'span 6')
    await expect(page.locator('#query > *').last()).toHaveCSS('grid-column-end', 'span 12')
  })
}

test('canonical helper viewport/container boundaries and spacing do not activate xxl aliases', async ({ page }) => {
  await open(page, 'full')
  for (const width of [1535, 1536]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(page.locator('#sticky-a')).toHaveCSS('position', width < 1536 ? 'static' : 'sticky')
    await expect(page.locator('#sticky-b')).toHaveCSS('position', 'static')
    await expect(page.locator('#space-a')).toHaveCSS('padding-top', width < 1536 ? '0px' : '8px')
    await expect(page.locator('#space-b')).toHaveCSS('padding-top', '0px')
    for (const id of ['#stack-a', '#stack-b']) await page.locator(id).evaluate((element, value) => { element.style.width = `${value}px` }, width)
    await expect(page.locator('#stack-a > *')).toHaveCSS('flex-direction', width < 1536 ? 'row' : 'column')
    await expect(page.locator('#stack-b > *')).toHaveCSS('flex-direction', 'row')
  }
})

test('numeric viewport tiers stay at pixel widths when the document root font changes', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1536, height: 900 }, javaScriptEnabled: true })
  const page = await context.newPage()
  try {
    await open(page, 'full')
    await page.locator('html').evaluate(element => element.style.fontSize = '20px')
    expect(await ratio(page, '#columns')).toBeCloseTo(.25, 3)
    await expect(page.locator('#space-a')).toHaveCSS('padding-top', '10px')
    await expect(page.locator('#space-b')).toHaveCSS('padding-top', '0px')
  } finally { await context.close() }
})

test('canonical compound hover state uses a pixel tier without an xxl alias', async ({ page }) => {
  await open(page, 'states')
  for (const id of ['#state-a', '#state-b']) await page.locator(id).evaluate(element => element.classList.remove('d-none'))
  for (const width of [1535, 1536]) {
    await page.setViewportSize({ width, height: 900 })
    for (const id of ['#state-a', '#state-b']) {
      await page.locator(id).hover()
      await expect(page.locator(id)).toHaveCSS('display', id === '#state-a' && width >= 1536 ? 'flex' : 'block')
    }
  }
})
