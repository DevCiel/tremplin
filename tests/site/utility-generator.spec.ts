import { compileString } from 'sass'
import AxeBuilder from '@axe-core/playwright'
import { publishedUtilitiesGuides as guides } from '../helpers/utilities-mdx-contract'
import { expect, test } from '@playwright/test'

test('custom utility maps affect actual browser styles across base, responsive, state, and print modes', async ({ page }) => {
  const css = compileString(`@use 'src/scss/tremplin-utilities' with ($utilities: (
    'project-pad': (property: padding-inline-start padding-inline-end, class: project-pad, values: (2: .5rem)),
    'project-space': (property: margin-block-start, class: project-space, child-selector: '> * + *', values: (2: .5rem)),
    'project-tone': (property: ('--project-tone': null, color: var(--project-tone)), class: project-tone, values: (brand: #075985)),
    'project-size': (property: (font-size: 1rem, line-height: 1.5), class: project-size, values: (small: (font-size: .875rem))),
    'project-fade': (property: opacity, class: project-fade, responsive: true, state: hover focus, print: true, important: false, values: (50: .5)),
    'project-forced': (property: cursor, class: project-forced, important: true, values: (wait: wait)),
    'project-normal': (property: cursor, class: project-normal, values: (wait: wait)),
    'project-disabled': (property: display, class: project-disabled, enabled: false, values: (none: none))
  ));`, { loadPaths: [process.cwd()] }).css
  await page.route('**/custom-utilities.css', route => route.fulfill({ contentType: 'text/css', body: css }))
  await page.route('**/custom-utilities/', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Custom utility test</title><link rel="stylesheet" href="/custom-utilities.css"></head><body><main><h1>Custom utilities</h1><div id="padding" class="project-pad-2">Padding</div><div class="project-space-2"><div>First</div><div id="spacing">Second</div></div><p id="tone" class="project-tone-brand">Tone</p><p id="size" class="project-size-small">Size</p><div id="responsive" class="md:project-fade-50">Responsive</div><button id="state" class="hover:project-fade-50" type="button">State</button><p id="print" class="print:project-fade-50">Print</p><div id="disabled" class="project-disabled-none">Still present</div><div id="forced" class="project-forced-wait">Forced</div><div id="normal" class="project-normal-wait">Normal</div></main></body></html>' }))
  await page.setViewportSize({ width: 767, height: 900 })
  await page.goto('/custom-utilities/')
  await expect(page.locator('#padding')).toHaveCSS('padding-inline-start', '8px')
  await expect(page.locator('#padding')).toHaveCSS('padding-inline-end', '8px')
  await expect(page.locator('#spacing')).toHaveCSS('margin-block-start', '8px')
  await expect(page.locator('#tone')).toHaveCSS('color', 'rgb(7, 89, 133)')
  await expect(page.locator('#size')).toHaveCSS('font-size', '14px')
  await expect(page.locator('#size')).toHaveCSS('line-height', '21px')
  await expect(page.locator('#responsive')).toHaveCSS('opacity', '1')
  await page.setViewportSize({ width: 768, height: 900 })
  await expect(page.locator('#responsive')).toHaveCSS('opacity', '0.5')
  await page.locator('#state').hover()
  await expect(page.locator('#state')).toHaveCSS('opacity', '0.5')
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('#print')).toHaveCSS('opacity', '0.5')
  await expect(page.locator('#disabled')).toHaveCSS('display', 'block')
  await page.emulateMedia({ media: 'screen' })
  await page.locator('#spacing').evaluate(element => element.classList.add('project-override'))
  await page.addStyleTag({ content: '@layer utilities { .project-override { margin-block-start:3px } } #forced,#normal { cursor:default }' })
  await expect(page.locator('#spacing')).toHaveCSS('margin-block-start', '3px')
  await expect(page.locator('#forced')).toHaveCSS('cursor', 'wait')
  await expect(page.locator('#normal')).toHaveCSS('cursor', 'default')
})

test('published Utility API guide has current navigation and an accessible responsive example', async ({ page, request }) => {
  const guide = guides.find(guide => guide.slug === 'utilities/api')!
  await page.goto('/utilities/api/')
  await expect(page.locator('main h1')).toHaveText('Utility API')
  await expect(page.locator('main h2')).toHaveCount(guide.sections.length)
  await expect(page.locator('#docs-toc-nav a')).toHaveCount(guide.sections.length)
  await expect(page.locator('#docs-sidebar a[aria-current="page"]')).toHaveAttribute('href', '/utilities/api/')
  const example = page.locator('[data-utility-api-demo="responsive"]')
  for (const [width, direction] of [[767, 'column'], [768, 'row']] as const) {
    await page.setViewportSize({ width, height: 900 })
    await expect(example).toHaveCSS('flex-direction', direction)
  }
  const links = await page.locator('main a[href^="/"]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('href')!))])
  for (const href of links) expect((await request.get(href)).ok(), href).toBe(true)
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport)
    if (viewport.width === 390) await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
    if (viewport.width === 390) {
      const options = page.getByRole('region', { name: 'Options', exact: true }).and(page.locator('.table-responsive'))
      await page.keyboard.press('Tab')
      await options.focus()
      await expect(options).toBeFocused()
      expect(await options.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true)
      await options.press('ArrowRight')
      await expect.poll(() => options.evaluate(element => element.scrollLeft)).toBeGreaterThan(0)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([])
  }
})
