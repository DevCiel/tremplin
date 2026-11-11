import { readFileSync } from 'node:fs'
import { utilityCss } from '../helpers/pinned-utilities'
import { expect, test } from '@playwright/test'

const css = readFileSync('dist/css/tremplin.css', 'utf8') + utilityCss("'print-display': (property: display, class: project-display, print: true, values: (none: none))")

test.beforeEach(async ({ page }) => {
  await page.route('**/utility-values.css', route => route.fulfill({ contentType: 'text/css', body: css }))
  await page.route('**/utility-values/', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="en"><head><title>Utility values</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/utility-values.css"></head><body><main><h1>Utility value checks</h1>
    <div id="prefix" class="d-none md:d-inline-grid">Canonical prefix</div><div id="retired" class="d-none d-md-inline-grid d-print-none">Retired alias</div><div id="print-only" class="print:project-display-none">Explicit print family</div>
    <div id="flow" class="d-flow-root border" style="inline-size:240px"><div class="float-start" style="inline-size:50px;block-size:60px">Float</div></div>
    <div class="d-flex"><div id="contents" class="d-contents"><span id="visible-child">Contents child</span></div></div>
    <table id="table" class="d-table"><tbody><tr id="row" class="d-table-row"><td id="cell" class="d-table-cell">Table layout</td></tr></tbody></table>
    <p id="balance" class="text-balance" style="inline-size:240px">Balanced short passage over several available lines.</p><p id="pretty" class="text-pretty">Pretty paragraph wrapping.</p>
    <p id="nowrap" class="text-nowrap" style="inline-size:128px">AReallyLongUnbrokenIdentifierForTheOverflowControl</p><p id="break" class="text-break" style="inline-size:128px">AReallyLongUnbrokenIdentifierForTheOverflowControl</p><p id="wrap" class="text-wrap">Normal wrapping.</p>
    <div class="user-select-none"><span id="select" class="user-select-text">Selectable identifier</span></div>
    </main></body></html>` }))
  await page.setViewportSize({ width: 767, height: 900 })
  await page.goto('/utility-values/')
})

test('canonical display prefixes work without retired aliases or default print behavior', async ({ page }) => {
  await expect(page.locator('#prefix')).toHaveCSS('display', 'none')
  await page.setViewportSize({ width: 768, height: 900 })
  await expect(page.locator('#prefix')).toHaveCSS('display', 'inline-grid')
  await expect(page.locator('#retired')).toHaveCSS('display', 'none')
  await expect(page.locator('#print-only')).toHaveCSS('display', 'block')
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('#prefix')).toHaveCSS('display', 'inline-grid')
  await expect(page.locator('#retired')).toHaveCSS('display', 'none')
  await expect(page.locator('#print-only')).toHaveCSS('display', 'none')
})

test('flow-root encloses floats, contents removes only the wrapper box, and table display remains native', async ({ page }) => {
  await expect(page.locator('#flow')).toHaveCSS('display', 'flow-root')
  expect((await page.locator('#flow').boundingBox())!.height).toBeGreaterThanOrEqual(62)
  await expect(page.locator('#contents')).toHaveCSS('display', 'contents')
  expect(await page.locator('#contents').evaluate(element => element.getBoundingClientRect().width)).toBe(0)
  await expect(page.locator('#visible-child')).toBeVisible()
  for (const [id, value] of [['table', 'table'], ['row', 'table-row'], ['cell', 'table-cell']] as const) await expect(page.locator(`#${id}`)).toHaveCSS('display', value)
})

test('native text-wrap modes and word-breaking preserve content without a legacy white-space generator', async ({ page }) => {
  await expect(page.locator('#balance')).toHaveCSS('text-wrap', 'balance')
  const supportsPretty = await page.evaluate(() => CSS.supports('text-wrap', 'pretty'))
  test.info().annotations.push({ type: 'capability', description: 'text-wrap:pretty=' + supportsPretty })
  await expect(page.locator('#pretty')).toHaveCSS('text-wrap', supportsPretty ? 'pretty' : 'wrap')
  await expect(page.locator('#nowrap')).toHaveCSS('white-space', 'nowrap')
  await expect(page.locator('#wrap')).toHaveCSS('white-space', 'normal')
  await expect(page.locator('#break')).toHaveCSS('overflow-wrap', 'break-word')
  await expect(page.locator('#break')).toHaveCSS('word-break', 'break-word')
  expect(await page.locator('#nowrap').evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true)
  expect(await page.locator('#break').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
})

test('explicit text selection can override a selection-disabled ancestor', async ({ page }) => {
  await expect(page.locator('#select')).toHaveCSS('user-select', 'text')
})
