import { readFileSync } from 'node:fs'
import { compileString } from 'sass'
import { expect, test } from '@playwright/test'

const css = readFileSync('dist/css/tremplin.css', 'utf8')
const standalone = readFileSync('dist/css/tremplin-utilities.css', 'utf8')
const named = compileString("@use 'src/scss/layout/breakpoints' as trm; .named-frame { @include trm.set-container(inline-size, project-frame); } .named-items { display: flex; flex-direction: column; } @include trm.container-breakpoint-up(sm, project-frame, (xs: 0, sm: 30rem)) { .named-items { flex-direction: row; } }", { loadPaths: [process.cwd()] }).css

test.beforeEach(async ({ page }) => {
  await page.route('**/stack-position.css', route => route.fulfill({ contentType: 'text/css', body: css + named }))
  await page.route('**/stack-position-check/', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="en"><head><title>Stack and position helpers</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/stack-position.css"></head><body><main><h1>Stack and position checks</h1>
    <div id="container" class="stack-container" style="inline-size:600px"><div id="responsive" class="vstack md:hstack gap-2"><span>First</span><span>Second</span></div><div id="prefix-only" class="md:vstack"><span>First</span><span>Second</span></div></div>
    <div id="retired-stack" class="stack"><span>First</span><span>Second</span></div><div id="retired-cluster" class="cluster"><span>First</span><span>Second</span></div>
    <div id="horizontal" class="hstack" style="--trm-stack-flex:0 0 auto;--trm-stack-align-self:center"><span>A</span><span>B</span></div>
    <div id="top-frame" style="block-size:120px;overflow:auto;--trm-z-sticky:77"><div id="top" class="md:sticky-top" style="background:var(--trm-bg-body)">Sticky heading</div><div style="block-size:500px">Scrollable top region</div></div>
    <div id="bottom-frame" style="block-size:120px;overflow:auto;--trm-z-sticky:78"><div style="block-size:500px">Scrollable bottom region</div><div id="bottom" class="md:sticky-bottom" style="background:var(--trm-bg-body)">Sticky footer</div></div>
    <div class="stack-container" style="inline-size:900px"><div id="viewport-probe" class="md:sticky-top">Viewport, not container</div></div>
    <div id="named-frame" class="named-frame" style="inline-size:600px"><div class="stack-container" style="inline-size:200px"><div id="named-stack" class="named-items"><span>Named first</span><span>Named second</span></div></div></div>
    </main></body></html>` }))
  await page.setViewportSize({ width: 1100, height: 1000 })
  await page.goto('/stack-position-check/')
})

test('stack direction follows the container width independently of the viewport', async ({ page }) => {
  await expect(page.locator('#responsive')).toHaveCSS('flex-direction', 'column')
  await expect(page.locator('#responsive')).toHaveCSS('align-items', 'stretch')
  await page.locator('#container').evaluate(element => element.style.inlineSize = '800px')
  await expect(page.locator('#responsive')).toHaveCSS('flex-direction', 'row')
  await expect(page.locator('#responsive')).toHaveCSS('align-items', 'flex-start')
  await expect(page.locator('#responsive')).toHaveCSS('gap', '6px')
  await page.locator('#container').evaluate(element => element.style.inlineSize = '600px')
  await expect(page.locator('#responsive')).toHaveCSS('flex-direction', 'column')
})

test('prefix-only stack names still establish a flex box before their query matches', async ({ page }) => {
  await expect(page.locator('#prefix-only')).toHaveCSS('display', 'flex')
  await expect(page.locator('#prefix-only')).toHaveCSS('flex-direction', 'row')
  await expect(page.locator('#prefix-only')).toHaveCSS('align-items', 'center')
  await page.locator('#container').evaluate(element => element.style.inlineSize = '800px')
  await expect(page.locator('#prefix-only')).toHaveCSS('flex-direction', 'column')
  await expect(page.locator('#prefix-only')).toHaveCSS('align-items', 'stretch')
})

test('stack controls are independent of explicit gaps, wrapping and retired class names', async ({ page }) => {
  await expect(page.locator('#horizontal')).toHaveCSS('flex', '0 0 auto')
  await expect(page.locator('#horizontal')).toHaveCSS('align-self', 'center')
  await expect(page.locator('#horizontal')).toHaveCSS('align-items', 'flex-start')
  await expect(page.locator('#horizontal')).toHaveCSS('column-gap', 'normal')
  for (const id of ['retired-stack', 'retired-cluster']) {
    await expect(page.locator('#' + id)).toHaveCSS('display', 'block')
    await expect(page.locator('#' + id)).toHaveCSS('gap', 'normal')
  }
  await page.locator('#horizontal').evaluate(element => element.classList.add('gap-3', 'flex-wrap'))
  await expect(page.locator('#horizontal')).toHaveCSS('gap', '8px')
  await expect(page.locator('#horizontal')).toHaveCSS('flex-wrap', 'wrap')
})

test('sticky prefixes follow the viewport rather than a wide query container', async ({ page }) => {
  await page.setViewportSize({ width: 767, height: 1000 })
  await expect(page.locator('#top')).toHaveCSS('position', 'static')
  await expect(page.locator('#viewport-probe')).toHaveCSS('position', 'static')
  await page.setViewportSize({ width: 768, height: 1000 })
  await expect(page.locator('#top')).toHaveCSS('position', 'sticky')
  await expect(page.locator('#bottom')).toHaveCSS('position', 'sticky')
  await expect(page.locator('#top')).toHaveCSS('z-index', '77')
  await expect(page.locator('#bottom')).toHaveCSS('z-index', '78')
})

test('responsive sticky edges hold their actual scroll positions in LTR and RTL', async ({ page }) => {
  for (const direction of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('dir', value), direction)
    await page.locator('#top-frame').evaluate(element => element.scrollTop = 0)
    const top = (await page.locator('#top').boundingBox())!.y
    await page.locator('#top-frame').evaluate(element => element.scrollTop = 100)
    expect((await page.locator('#top').boundingBox())!.y).toBeCloseTo(top, 0)
    await page.locator('#bottom-frame').evaluate(element => element.scrollTop = 0)
    const bottom = (await page.locator('#bottom').boundingBox())!.y
    await page.locator('#bottom-frame').evaluate(element => element.scrollTop = 100)
    expect((await page.locator('#bottom').boundingBox())!.y).toBeCloseTo(bottom, 0)
  }
})

test('sticky edges retain the physical top and bottom contract in vertical writing', async ({ page }) => {
  await page.locator('#top').evaluate(element => element.style.writingMode = 'vertical-rl')
  await page.locator('#bottom').evaluate(element => element.style.writingMode = 'vertical-rl')
  await expect(page.locator('#top')).toHaveCSS('top', '0px')
  await expect(page.locator('#bottom')).toHaveCSS('bottom', '0px')
  await expect(page.locator('#top')).toHaveCSS('right', 'auto')
})

test('utilities-only entry includes container stacks and viewport sticky helpers', async ({ page }) => {
  await page.route('**/stack-position.css', route => route.fulfill({ contentType: 'text/css', body: standalone + named }))
  await page.reload()
  await expect(page.locator('#container')).toHaveCSS('container-type', 'inline-size')
  await expect(page.locator('#responsive')).toHaveCSS('flex-direction', 'column')
  await expect(page.locator('#top')).toHaveCSS('position', 'sticky')
  await page.locator('#container').evaluate(element => element.style.inlineSize = '800px')
  await expect(page.locator('#responsive')).toHaveCSS('flex-direction', 'row')
})

test('named container mixins select the intended ancestor rather than a nearer unnamed container', async ({ page }) => {
  await expect(page.locator('#named-stack')).toHaveCSS('flex-direction', 'row')
  await page.locator('#named-frame').evaluate(element => element.style.inlineSize = '400px')
  await expect(page.locator('#named-stack')).toHaveCSS('flex-direction', 'column')
})
