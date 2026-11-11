import { expect, test, type Page } from '@playwright/test'
import { pinnedLayoutStyles, rejectsPinnedSass } from './pinned-layout.fixture'

const styles = await pinnedLayoutStyles({
  full: "@use 'src/scss/tremplin';",
  important: "@use 'src/scss/tremplin' with ($utilities: ('padding': (property: padding, class: p, values: (3: .5rem), important: true), 'animation-duration': (property: animation-duration, class: duration, values: (slow: 10s), important: true)));",
  grid: ["@use 'src/scss/tremplin-reboot';", "@use 'src/scss/tremplin-grid';"],
  utilities: "@use 'src/scss/tremplin-utilities';"
})
const open = async (page: Page, mode: keyof typeof styles) => {
  await page.route('**/cascade-layer-check/', route => route.fulfill({ contentType: 'text/html', body: "<!doctype html><html lang=\"en\" data-trm-theme=\"light\"><head><title>Cascade layers</title><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>" + styles[mode] + "</style><style>\n@layer custom { #custom-wins {padding:9px} #utility-wins {padding:9px} #focus-helper {outline:1px solid red} }\n@layer components { #utility-wins {padding:99px} #priority {outline-color:rgb(10,20,30)!important} }\n@layer utilities { #priority {outline-color:blue!important} }\n.application-rule {padding:7px} #priority {outline-color:green!important}\n.property-probe {color:var(--trm-primary-base);border-color:var(--trm-danger-border)}\n#primary-reference {border-color:var(--trm-primary-bg)}\n</style></head><body><h1>Cascade layers</h1>\n<button id=\"utility-wins\" class=\"btn p-3\">Utility over custom/component specificity</button>\n<button id=\"custom-wins\" class=\"btn\">Custom over component</button>\n<button id=\"application-wins\" class=\"btn p-3 application-rule\">Unlayered application</button>\n<button id=\"focus-helper\" class=\"focus-ring\">Focus helper</button>\n<input id=\"invalid\" class=\"form-control is-invalid\" aria-label=\"Invalid value\" aria-invalid=\"true\">\n<div id=\"hidden\" hidden class=\"d-block\">Never visible</div><div id=\"priority\">Important priority</div>\n<div id=\"fade\" class=\"fade opacity-100\">Fade</div><div id=\"motion\" class=\"animation-pop duration-slow\">Motion</div>\n<div class=\"theme-danger\"><div id=\"surface\" class=\"theme-subtle p-3\">Themed surface</div></div>\n<div id=\"reference\" class=\"property-probe\">Reference</div><div id=\"primary-reference\">Primary border reference</div>\n</body></html>" }))
  await page.goto('/cascade-layer-check/')
}

for (const mode of ['full', 'grid', 'utilities'] as const) {
  test(mode + ': normal utilities beat earlier layers but yield to unlayered application CSS', async ({ page }) => {
    await open(page, mode)
    await expect(page.locator('#utility-wins')).toHaveCSS('padding-top', '8px')
    await expect(page.locator('#application-wins')).toHaveCSS('padding-top', '7px')
    await expect(page.locator('#custom-wins')).toHaveCSS('padding-top', '9px')
    const order = await page.evaluate(() => [...document.styleSheets[0]!.cssRules].find(rule => rule.cssText.startsWith('@layer colors,'))?.cssText)
    expect(order).toBe('@layer colors, config, root, reboot, layout, content, forms, components, custom, helpers, utilities;')
    await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
    await expect(page.locator('#utility-wins')).toHaveCSS('padding-inline-start', '8px')
  })
}

test('per-family importance beats normal application CSS while important layers reverse order', async ({ page }) => {
  await open(page, 'important')
  await expect(page.locator('#application-wins')).toHaveCSS('padding-top', '8px')
  await expect(page.locator('#priority')).toHaveCSS('outline-color', 'rgb(10, 20, 30)')
  await expect(page.locator('#hidden')).toHaveCSS('display', 'none')
  await page.addStyleTag({ content: '#hidden {display:block!important}' })
  await expect(page.locator('#hidden')).toHaveCSS('display', 'none')
})

test('validation consumes state tokens but does not invent always-important border protection', async ({ page }) => {
  await open(page, 'full')
  const danger = await page.locator('#reference').evaluate(element => getComputedStyle(element).borderTopColor)
  const primary = await page.locator('#primary-reference').evaluate(element => getComputedStyle(element).borderTopColor)
  await expect(page.locator('#invalid')).toHaveCSS('border-top-color', danger)
  await page.locator('#invalid').evaluate(element => element.classList.add('border-primary'))
  await expect(page.locator('#invalid')).toHaveCSS('border-top-color', primary)
  await page.addStyleTag({ content: '#invalid {border-color:rgb(3,4,5)}' })
  await expect(page.locator('#invalid')).toHaveCSS('border-top-color', 'rgb(3, 4, 5)')
})

test('helpers beat custom layer normal rules and preserve keyboard focus appearance', async ({ page }) => {
  await open(page, 'full')
  await page.locator('#focus-helper').focus()
  await expect(page.locator('#focus-helper')).toHaveCSS('outline-width', '3px')
  await expect(page.locator('#focus-helper')).toHaveCSS('outline-style', 'solid')
  await page.addStyleTag({ content: '.focus-ring:focus-visible {outline:5px solid green}' })
  await expect(page.locator('#focus-helper')).toHaveCSS('outline-width', '5px')
})

test('root tokens and transition classes retain the upstream unlayered exceptions', async ({ page }) => {
  await open(page, 'full')
  const primary = await page.locator('#reference').evaluate(element => getComputedStyle(element).color)
  await page.addStyleTag({ content: '@layer custom { :root {--trm-primary-base:red} }' })
  await expect(page.locator('#reference')).toHaveCSS('color', primary)
  await expect(page.locator('#fade')).toHaveCSS('opacity', '0')
  await page.addStyleTag({ content: ':root {--trm-primary-base:rgb(1,2,3)}' })
  await expect(page.locator('#reference')).toHaveCSS('color', 'rgb(1, 2, 3)')
})

test('reduced motion removes the animation name even with an important duration', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page, 'important')
  await expect(page.locator('#motion')).toHaveCSS('animation-name', 'none')
  await expect(page.locator('#motion')).toHaveCSS('animation-duration', '10s')
  await page.locator('html').evaluate(element => element.setAttribute('data-trm-theme', 'dark'))
  await expect(page.locator('#hidden')).toHaveCSS('display', 'none')
  await expect(page.locator('#surface')).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
})

test('does not expose the removed global importance configuration switch', () => {
  rejectsPinnedSass("@use 'src/scss/tremplin' with ($enable-important-utilities: false);", /not declared with !default/)
})
