import { expect, test, type Page } from '@playwright/test'
import { pinnedLayoutStyles } from './pinned-layout.fixture'

const reboot = "@use 'src/scss/tremplin-reboot';"
const styles = await pinnedLayoutStyles({
  full: "@use 'src/scss/tremplin';",
  grid: [reboot, "@use 'src/scss/tremplin-grid';"],
  utilities: [reboot, "@use 'src/scss/tremplin-utilities';"],
  custom: [reboot, "@use 'src/scss/config' with ($grid-gutter-x: 32px, $container-padding-x: 16px, $gutters: (tight: 11px), $negative-spacers: ('-2': -3px)); @use 'src/scss/tremplin-grid';"]
})
const open = async (page: Page, mode: keyof typeof styles) => {
  await page.route('**/spacing-defaults-check/', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="en"><head><title>Spacing defaults</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>${styles[mode]} html{font-size:16px}body{margin:0}.fixture{width:600px}.item{height:20px}</style></head><body>
    <h1>Spacing defaults</h1><div id="positive" class="p-3 ms-2">Positive</div>
    <div id="canonical" class="ms--2 me--1">Canonical</div><div id="legacy" class="m-n2">Legacy</div>
    <div id="axis" class="mx--2 mt--1">Axes</div><div id="responsive" class="ms-0 md:ms--2">Responsive</div>
    <div id="largest" class="ms-0 2xl:ms--2">Largest</div><div id="alias" class="ms-0 xxl:ms--2">Alias</div>
    <div id="gap" class="d-grid grid-cols-2 gap-3 fixture"><div class="item">A</div><div class="item">B</div></div>
    <div id="space" class="space-x-3 d-flex"><span>A</span><span>B</span></div>
    <div id="native" class="grid fixture"><div class="g-col-6 item">A</div><div class="g-col-6 item">B</div></div>
    <div id="row" class="row fixture"><div class="col">A</div><div class="col">B</div></div>
    <div id="gutter" class="row g-3 fixture"><div class="col">A</div><div class="col">B</div></div>
    <div id="tight" class="row g-tight fixture"><div class="col">Custom</div></div><div id="container" class="container-fluid">Container</div>
    </body></html>` }))
  await page.goto('/spacing-defaults-check/')
}

for (const mode of ['full', 'grid', 'utilities'] as const) {
  test(`${mode}: aligned positive and independent negative distances in LTR and RTL`, async ({ page }) => {
    await open(page, mode)
    for (const direction of ['ltr', 'rtl']) {
      await page.locator('html').evaluate((element, dir) => element.setAttribute('dir', dir), direction)
      await expect(page.locator('#positive')).toHaveCSS('padding-top', '8px')
      await expect(page.locator('#positive')).toHaveCSS('margin-inline-start', '6px')
      await expect(page.locator('#canonical')).toHaveCSS('margin-inline-start', '-8px')
      await expect(page.locator('#canonical')).toHaveCSS('margin-inline-end', '-4px')
      await expect(page.locator('#legacy')).toHaveCSS('margin-top', '0px')
      await expect(page.locator('#axis')).toHaveCSS('margin-inline-start', '0px')
      await expect(page.locator('#axis')).toHaveCSS('margin-inline-end', '0px')
      await expect(page.locator('#axis')).toHaveCSS('margin-block-start', '0px')
      await expect(page.locator('#gap')).toHaveCSS('gap', '8px')
      await expect(page.locator('#space > :first-child')).toHaveCSS('margin-inline-end', mode === 'grid' ? '0px' : '8px')
    }
  })

  test(`${mode}: responsive negatives and rem distances remain independent of pixel breakpoints`, async ({ page }) => {
    await open(page, mode)
    for (const width of [767, 768, 1535, 1536]) {
      await page.setViewportSize({ width, height: 900 })
      await expect(page.locator('#responsive')).toHaveCSS('margin-inline-start', width < 768 ? '0px' : '-8px')
      await expect(page.locator('#largest')).toHaveCSS('margin-inline-start', width < 1536 ? '0px' : '-8px')
      await expect(page.locator('#alias')).toHaveCSS('margin-inline-start', '0px')
    }
    await page.locator('html').evaluate(element => element.style.fontSize = '20px')
    await expect(page.locator('#positive')).toHaveCSS('padding-top', '10px')
    await expect(page.locator('#canonical')).toHaveCSS('margin-inline-start', '-10px')
    await expect(page.locator('#legacy')).toHaveCSS('margin-top', '0px')
    await expect(page.locator('#largest')).toHaveCSS('margin-inline-start', '-10px')
  })
}

for (const mode of ['full', 'grid'] as const) {
  test(`${mode}: baseline gutters and Grid gap share 24px without coupling runtime overrides`, async ({ page }) => {
    await open(page, mode)
    await expect(page.locator('#native')).toHaveCSS('gap', '24px')
    await expect(page.locator('#row > :first-child')).toHaveCSS('padding-inline-start', '12px')
    await expect(page.locator('#row > :first-child')).toHaveCSS('margin-block-start', '0px')
    await expect(page.locator('#gutter > :first-child')).toHaveCSS('padding-inline-start', '4px')
    await expect(page.locator('#gutter > :first-child')).toHaveCSS('margin-block-start', '8px')
    await page.locator('#native').evaluate(element => element.style.setProperty('--trm-grid-gap', '7px'))
    await expect(page.locator('#native')).toHaveCSS('gap', '24px')
    await page.locator('#native').evaluate(element => element.style.setProperty('--trm-gap', '9px'))
    await expect(page.locator('#native')).toHaveCSS('gap', '9px')
    await expect(page.locator('#row > :first-child')).toHaveCSS('padding-inline-start', '12px')
    await page.locator('#native').evaluate(element => { element.style.removeProperty('--trm-gap'); element.style.removeProperty('--trm-grid-gap') })
    await page.locator('html').evaluate(element => element.style.fontSize = '20px')
    await expect(page.locator('#native')).toHaveCSS('gap', '30px')
    await expect(page.locator('#row > :first-child')).toHaveCSS('padding-inline-start', '15px')
  })
}

test('configured Grid gap, container padding, replaced gutters and independent negatives are honored', async ({ page }) => {
  await open(page, 'custom')
  await expect(page.locator('#native')).toHaveCSS('gap', '32px')
  await expect(page.locator('#row > :first-child')).toHaveCSS('padding-inline-start', '16px')
  await expect(page.locator('#container')).toHaveCSS('padding-inline-start', '8px')
  await expect(page.locator('#tight > :first-child')).toHaveCSS('padding-inline-start', '5.5px')
  await expect(page.locator('#canonical')).toHaveCSS('margin-inline-start', '-3px')
  await expect(page.locator('#canonical')).toHaveCSS('margin-inline-end', '-4px')
  await expect(page.locator('#gutter > :first-child')).toHaveCSS('padding-inline-start', '16px')
  await expect(page.locator('#gutter > :first-child')).toHaveCSS('margin-block-start', '0px')
  await expect(page.locator('#legacy')).toHaveCSS('margin-top', '0px')
})
