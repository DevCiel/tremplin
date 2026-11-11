import { compileString } from 'sass'
import { expect, test } from '@playwright/test'

const css = compileString(String.raw`@use 'src/scss/tremplin-utilities' with ($utilities: (
  'starts': (selector: attr-starts, class: 'project-start-', property: padding-inline-start, values: 6px),
  'includes': (selector: attr-includes, class: 'project-part-', property: padding-inline-end, values: 10px),
  'slash': (selector: attr-starts, class: 'project-\\\\mark', property: margin-block-end, values: 9px),
  'children': (selector: attr-includes, class: project-children, property: margin-block-end, values: .5rem, child-selector: '> * + *'),
  'tone': (property: ('--project-tone': null, color: var(--project-tone)), class: project-tone, values: (brand: #075985)),
  'static': (property: color, class: project-static, variables: (project-static: #075985), values: var(--trm-project-static)),
  'list': (property: padding-inline-start, class: project-pad, variables: (project-pad, project-pad-fallback), values: (2: 2px)),
  'duplicate': (property: color, class: project-duplicate, variables: (project-tone: #075985), values: var(--project-tone)),
  'reference': (property: color, class: project-reference, values: var(--project-reference)),
  'disabled': (enabled: false, property: --project-disabled, variables: project-disabled-variable, values: red)
));`, { loadPaths: [process.cwd()] }).css

test.beforeEach(async ({ page }) => {
  await page.route('**/selector-utilities.css', route => route.fulfill({ contentType: 'text/css', body: css }))
  await page.route('**/utility-selectors/', route => route.fulfill({ contentType: 'text/html', body: String.raw`<!doctype html><html lang="en"><head><title>Utility selectors</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/selector-utilities.css"></head><body><main><h1>Utility selector checks</h1>
    <div id="start" class="project-start-card other">Starts</div><div id="not-start" class="other project-start-card">Not at the start</div>
    <div id="part" class="other prefix-project-part-card">Substring anywhere</div><div id="not-part" class="project-particle-card">Not the substring</div>
    <div id="quoted" class='project-"mark'>Quoted pattern</div><div id="slash" class="project-\mark">Backslash pattern</div>
    <div class="project-children"><div id="child-first">First</div><div id="child-second"><div id="grandchild">Nested</div></div></div>
    <div class="project-tone-brand" id="tone-parent"><span id="inherited-color">Standard color inherits</span><span id="private-fallback" style="color:var(--project-tone,#b91c1c)">Private variable does not</span><span id="own-tone" class="project-tone-brand">Own assignment</span></div>
    <div class="project-static" id="static-parent"><span id="static-child" style="color:var(--trm-project-static,#b91c1c)">Static variable does not inherit</span></div>
    <div class="project-pad-2"><div id="pad-child" style="padding-inline-start:var(--trm-project-pad,0px)">List variable does not inherit</div></div>
    <div style="--project-disabled:#075985"><span id="disabled-child" style="color:var(--project-disabled)">Disabled variables still inherit</span></div>
    <div style="--project-reference:#123456"><span id="reference-child" class="project-reference">Referenced theme tokens still inherit</span></div>
    </main></body></html>` }))
  await page.goto('/utility-selectors/')
})

test('attribute helpers match the entire class string with logical-axis behavior', async ({ page }) => {
  for (const direction of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((element, dir) => element.setAttribute('dir', dir), direction)
    await expect(page.locator('#start')).toHaveCSS('padding-inline-start', '6px')
    await expect(page.locator('#not-start')).toHaveCSS('padding-inline-start', '0px')
    await expect(page.locator('#part')).toHaveCSS('padding-inline-end', '10px')
    await expect(page.locator('#not-part')).toHaveCSS('padding-inline-end', '0px')
  }
  await expect(page.locator('#child-first')).toHaveCSS('margin-block-end', '0px')
  await expect(page.locator('#child-second')).toHaveCSS('margin-block-end', '8px')
  await expect(page.locator('#grandchild')).toHaveCSS('margin-block-end', '0px')
})

test('deliberately escaped backslashes match while an unsupported quoted pattern has no generated rule', async ({ page }) => {
  await expect(page.locator('#quoted')).toHaveCSS('margin-block-start', '0px')
  await expect(page.locator('#slash')).toHaveCSS('margin-block-end', '9px')
})

test('explicit property maps isolate composition while the pinned variables namespace mismatch still inherits', async ({ page }) => {
  await expect(page.locator('#tone-parent')).toHaveCSS('color', 'rgb(7, 89, 133)')
  await expect(page.locator('#inherited-color')).toHaveCSS('color', 'rgb(7, 89, 133)')
  await expect(page.locator('#private-fallback')).toHaveCSS('color', 'rgb(185, 28, 28)')
  await expect(page.locator('#own-tone')).toHaveCSS('color', 'rgb(7, 89, 133)')
  await expect(page.locator('#static-child')).toHaveCSS('color', 'rgb(7, 89, 133)')
  await expect(page.locator('#pad-child')).toHaveCSS('padding-inline-start', '2px')
  await expect(page.locator('#disabled-child')).toHaveCSS('color', 'rgb(7, 89, 133)')
  await expect(page.locator('#reference-child')).toHaveCSS('color', 'rgb(18, 52, 86)')
})

test('the browser accepts one global registration per assigned variable and none for referenced/disabled tokens', async ({ page }) => {
  const names = await page.evaluate(() => [...document.styleSheets].flatMap(sheet => [...sheet.cssRules]).filter(rule => rule.cssText.startsWith('@property ')).map(rule => rule.cssText.match(/^@property (\S+)/)![1]))
  expect(names.filter(name => name?.startsWith('--project-')).sort()).toEqual(['--project-pad', '--project-pad-fallback', '--project-static', '--project-tone'])
  expect(names).not.toContain('--project-reference')
  expect(names).not.toContain('--trm-project-static')
  expect(names).not.toContain('--trm-project-pad')
})
