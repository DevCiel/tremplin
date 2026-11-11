import { readFileSync } from 'node:fs'
import { compileString } from 'sass'
import { expect, test, type Page } from '@playwright/test'

const read = (name: string) => readFileSync(`dist/css/tremplin${name}.css`, 'utf8')
const reboot = read('-reboot')
const grid = read('-grid')
const stateGrid = compileString("@use 'src/scss/tremplin-grid' with ($utilities: ('display': (property: display, class: d, responsive: true, print: true, state: enabled, dark: true, values: (none: none, block: block, flex: flex))));", { loadPaths: [process.cwd()] }).css
const styles = { full: read(''), grid: reboot + grid, utilities: reboot + read('-utilities'), state: reboot + stateGrid, standalone: grid }

const open = async (page: Page, mode: keyof typeof styles) => {
  await page.route('**/grid-bundle-check/', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="en"><head><title>Grid bundle contract</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>${styles[mode]} html{font-size:16px}body{margin:0}</style></head><body>
    <h1>Grid bundle contract</h1><button id="before">Before</button>
    <button id="hidden-base" hidden class="d-block">Hidden</button>
    <button id="hidden-responsive" hidden class="d-block md:d-flex">Responsive hidden</button>
    <button id="hidden-state" hidden class="enabled:d-block">State hidden</button>
    <button id="hidden-print" hidden class="print:d-block">Print hidden</button>
    <button id="hidden-inline" hidden style="display:flex">Inline hidden</button>
    <button id="hidden-value" hidden="hidden" class="d-block">Value hidden</button>
    <button id="hidden-found" hidden="until-found" class="d-block">Until found</button>
    <button id="after">After</button>
    <div id="flex" class="d-flex flex-column md:flex-row gap-3 px-3" style="width:400px"><span>First</span><span id="flex-end" class="md:ms-auto">Last</span></div>
    <div id="tracks" class="d-grid grid-cols-2 gap-3" style="width:400px"><div>One</div><div>Two</div></div>
    <div id="negative" class="ms--1 me--2">Negative margins</div>
    <div id="frame" class="container-fluid" style="width:400px"><div id="row" class="row"><div class="col-6">One</div><div class="col-6">Two</div></div></div>
    <div id="print" class="d-flex print:d-none">Screen only</div>
    </body></html>` }))
  await page.goto('/grid-bundle-check/')
}

for (const mode of ['full', 'grid', 'utilities', 'state'] as const) {
  test(`${mode}: Reboot protects hidden elements from display utilities and keyboard focus`, async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 900 })
    await open(page, mode)
    for (const id of ['hidden-base', 'hidden-responsive', 'hidden-state', 'hidden-inline', 'hidden-value', 'hidden-found']) {
      await expect(page.locator(`#${id}`)).toHaveCSS('display', 'none')
    }
    await page.locator('#before').focus()
    await page.keyboard.press('Tab')
    await expect(page.locator('#after')).toBeFocused()
    await page.emulateMedia({ media: 'print' })
    await expect(page.locator('#hidden-print')).toHaveCSS('display', 'none')
    await page.emulateMedia({ media: 'screen', colorScheme: 'dark' })
    await page.locator('#hidden-state').evaluate(element => element.classList.add('dark:enabled:d-block'))
    await expect(page.locator('#hidden-state')).toHaveCSS('display', 'none')
    await page.locator('#hidden-responsive').evaluate(element => element.removeAttribute('hidden'))
    await expect(page.locator('#hidden-responsive')).toHaveCSS('display', 'flex')
    await page.setViewportSize({ width: 767, height: 900 })
    await expect(page.locator('#hidden-responsive')).toHaveCSS('display', 'block')
    await page.locator('#hidden-responsive').evaluate(element => element.setAttribute('hidden', ''))
    await expect(page.locator('#hidden-responsive')).toHaveCSS('display', 'none')
  })
}

test('grid-only layout utilities respond to viewport and RTL without default print variants', async ({ page }) => {
  await page.setViewportSize({ width: 767, height: 900 })
  await open(page, 'grid')
  await expect(page.locator('#flex')).toHaveCSS('flex-direction', 'column')
  await expect(page.locator('#flex')).toHaveCSS('gap', '8px')
  await expect(page.locator('#flex')).toHaveCSS('padding-inline-start', '8px')
  await page.setViewportSize({ width: 768, height: 900 })
  await expect(page.locator('#flex')).toHaveCSS('flex-direction', 'row')
  for (const dir of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('dir', value), dir)
    const boxes = await page.locator('#flex > *').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().x))
    expect(dir === 'ltr' ? boxes[1]! - boxes[0]! : boxes[0]! - boxes[1]!).toBeGreaterThan(200)
    await expect(page.locator('#negative')).toHaveCSS('margin-inline-start', '-4px')
    await expect(page.locator('#negative')).toHaveCSS('margin-inline-end', '-8px')
    await expect(page.locator('#negative')).toHaveCSS('margin-block-start', '0px')
  }
  const tracks = await page.locator('#tracks > *').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().width))
  expect(tracks).toEqual([196, 196])
  expect(await page.locator('html').evaluate(element => getComputedStyle(element).getPropertyValue('--trm-breakpoint-md').trim())).toBe('768px')
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('#print')).toHaveCSS('display', 'flex')
})

test('grid-only still requires Reboot or an application border-box reset', async ({ page }) => {
  await open(page, 'standalone')
  await expect(page.locator('#frame')).toHaveCSS('box-sizing', 'content-box')
  expect((await page.locator('#frame').boundingBox())!.width).toBe(424)
  const withoutReset = await page.locator('#row > *').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().y))
  expect(withoutReset[1]).toBeGreaterThan(withoutReset[0]!)
  // Like upstream, the grid-only bundle does not supply the Reboot guarantee.
  await expect(page.locator('#hidden-base')).toHaveCSS('display', 'block')
  await page.addStyleTag({ content: '*,::before,::after { box-sizing:border-box }' })
  expect((await page.locator('#frame').boundingBox())!.width).toBe(400)
  const withReset = await page.locator('#row > *').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().y))
  expect(withReset[1]).toBe(withReset[0])
  await page.addStyleTag({ content: reboot })
  await expect(page.locator('#hidden-base')).toHaveCSS('display', 'none')
})

test('display print and dark-state variants require an explicit family override', async ({ page }) => {
  await open(page, 'state')
  await expect(page.locator('#print')).toHaveCSS('display', 'flex')
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('#print')).toHaveCSS('display', 'none')
  await page.emulateMedia({ media: 'screen', colorScheme: 'dark' })
  await page.locator('#after').evaluate(element => element.setAttribute('class', 'dark:enabled:d-none'))
  await expect(page.locator('#after')).toHaveCSS('display', 'none')
})
