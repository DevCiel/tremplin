import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

const css = readFileSync('dist/css/tremplin.css', 'utf8')

test.beforeEach(async ({ page }) => {
  await page.route('**/grid-gap.css', route => route.fulfill({ contentType: 'text/css', body: css }))
  await page.route('**/grid-gap-check/', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="en"><head><title>Grid and gap checks</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/grid-gap.css"></head><body><main><h1>Grid and gap checks</h1>
    <div id="basic" class="d-grid grid-cols-2 row-gap-2 column-gap-3" style="inline-size:600px"><span>First</span><span>Second</span><span class="grid-cols-fill">Full row</span></div>
    <div id="prefix" class="d-grid grid-cols-1 md:grid-cols-3 row-gap-2 md:row-gap-4 column-gap-2 md:column-gap-3" style="inline-size:600px"><span>A</span><span>B</span><span>C</span></div>
    <div id="retired-infix" class="d-grid grid-cols-1 grid-cols-md-3 row-gap-2 row-gap-md-4 column-gap-2 column-gap-md-3" style="inline-size:600px"><span>A</span><span>B</span><span>C</span></div>
    <div id="subgrid-parent" class="d-grid grid-cols-3 column-gap-2" style="inline-size:600px"><span>A</span><span>B</span><span>C</span><div id="subgrid" class="d-grid grid-cols-fill grid-cols-subgrid"><span>Aligned A</span><span>Aligned B</span><span>Aligned C</span></div></div>
    <div id="flow" class="d-grid grid-auto-flow-column" style="grid-template-rows:repeat(2,30px);grid-auto-columns:100px"><span>A</span><span>B</span><span>C</span><span>D</span></div>
    <div id="dense" class="d-grid grid-cols-3 grid-auto-flow-row" style="inline-size:600px"><span style="grid-column:span 2">Wide A</span><span style="grid-column:span 2">Wide B</span><span>Narrow C</span></div>
    <div id="flex" class="d-flex flex-wrap row-gap-2 column-gap-3" style="inline-size:220px"><span style="inline-size:100px;block-size:20px">A</span><span style="inline-size:100px;block-size:20px">B</span><span style="inline-size:100px;block-size:20px">C</span></div>
    <div id="layout" class="grid"><span class="g-col-6">First half</span><span class="g-col-6">Second half</span></div>
    </main></body></html>` }))
  await page.goto('/grid-gap-check/')
})

test('grid track counts and full-track placement have the expected geometry in LTR and RTL', async ({ page }) => {
  for (const direction of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('dir', value), direction)
    const boxes = await page.locator('#basic > span').evaluateAll(elements => elements.map(element => { const rect = element.getBoundingClientRect(); return { x: rect.x, y: rect.y, width: rect.width } }))
    expect(boxes[0]!.width).toBeCloseTo(296, 0)
    expect(Math.abs(boxes[0]!.x - boxes[1]!.x)).toBeCloseTo(304, 0)
    expect(boxes[0]!.y).toBe(boxes[1]!.y)
    expect(boxes[2]!.width).toBeCloseTo(600, 0)
    expect(boxes[2]!.y).toBeGreaterThan(boxes[0]!.y)
  }
})

test('canonical viewport prefixes switch at md while retired infix names have no effect', async ({ page }) => {
  for (const [width, count, row, column] of [[767, 1, '6px', '6px'], [768, 3, '12px', '8px']] as const) {
    await page.setViewportSize({ width, height: 900 })
    const grid = page.locator('#prefix')
    expect(await grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(count)
    await expect(grid).toHaveCSS('row-gap', row)
    await expect(grid).toHaveCSS('column-gap', column)
    const retired = page.locator('#retired-infix')
    expect(await retired.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(1)
    await expect(retired).toHaveCSS('row-gap', '6px')
    await expect(retired).toHaveCSS('column-gap', '6px')
  }
})

test('subgrid aligns nested tracks to the parent rather than creating unrelated columns', async ({ page }) => {
  for (const direction of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('dir', value), direction)
    expect(await page.locator('#subgrid').evaluate(element => getComputedStyle(element).gridTemplateColumns)).toContain('subgrid')
    const parent = await page.locator('#subgrid-parent > span').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().x))
    const nested = await page.locator('#subgrid > span').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().x))
    for (let index = 0; index < parent.length; index++) expect(Math.abs(parent[index]! - nested[index]!)).toBeLessThan(.1)
  }
})

test('column auto-flow and dense packing change real item placement', async ({ page }) => {
  const flow = await page.locator('#flow > span').evaluateAll(elements => elements.map(element => { const rect = element.getBoundingClientRect(); return { x: rect.x, y: rect.y } }))
  expect(flow[0]!.x).toBe(flow[1]!.x)
  expect(flow[1]!.y).toBeGreaterThan(flow[0]!.y)
  expect(flow[2]!.x).toBeGreaterThan(flow[0]!.x)
  const before = await page.locator('#dense > span').last().boundingBox()
  await page.locator('#dense').evaluate(element => element.classList.replace('grid-auto-flow-row', 'grid-auto-flow-dense'))
  const after = await page.locator('#dense > span').last().boundingBox()
  expect(after!.y).toBeLessThan(before!.y)
  await expect(page.locator('#dense')).toHaveCSS('grid-auto-flow', 'dense')
})

test('independent gap axes work in wrapped flex layout and do not change literal layout spans', async ({ page }) => {
  const boxes = await page.locator('#flex > span').evaluateAll(elements => elements.map(element => { const rect = element.getBoundingClientRect(); return { x: rect.x, y: rect.y } }))
  expect(boxes[1]!.x - boxes[0]!.x).toBe(108)
  expect(boxes[2]!.y - boxes[0]!.y).toBe(26)
  await expect(page.locator('#layout > span').first()).toHaveCSS('grid-column-end', 'span 6')
  await expect(page.locator('#layout')).toHaveCSS('display', 'grid')
})

test('gap and grid controls use logical layout naturally in vertical writing', async ({ page }) => {
  await page.locator('#basic').evaluate(element => { element.style.writingMode = 'vertical-rl'; element.style.inlineSize = '400px'; element.style.blockSize = '300px' })
  const first = await page.locator('#basic > span').first().boundingBox()
  const second = await page.locator('#basic > span').nth(1).boundingBox()
  expect(first!.x).toBe(second!.x)
  expect(second!.y - first!.y - first!.height).toBeCloseTo(8, 0)
  await expect(page.locator('#basic')).toHaveCSS('row-gap', '6px')
})

test('published gap examples render independent axes at desktop and narrow widths', async ({ page }) => {
  await page.goto('/utilities/gap/')
  await expect(page.locator('h1')).toHaveText('Gap')
  const grid = page.locator('.docs-example .grid-cols-2.row-gap-2.column-gap-4')
  await expect(grid).toHaveCSS('row-gap', '6px')
  await expect(grid).toHaveCSS('column-gap', '12px')
  for (const direction of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('dir', value), direction)
    await expect(grid).toHaveCSS('display', 'grid')
  }
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('published Grid utility example follows viewport prefixes and spans its explicit tracks', async ({ page }) => {
  await page.goto('/utilities/grid/')
  await expect(page.locator('h1')).toHaveText('Grid')
  const grid = page.locator('.docs-example .d-grid.grid-cols-2').first()
  for (const [width, count] of [[767, 2], [768, 3]] as const) {
    await page.setViewportSize({ width, height: 900 })
    expect(await grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(count)
    await expect(grid.locator('.grid-cols-fill')).toHaveCSS('grid-column', '1 / -1')
  }
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
