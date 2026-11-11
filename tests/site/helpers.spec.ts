import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import original from '../fixtures/mdx-migration/helpers.before.json' with { type: 'json' }

// Rendered guides include explicitly disclosed application contrast notices.
for (const guide of original.published) {
  test(`Helpers: ${guide.title} has accessible examples and working navigation`, async ({ page, request }) => {
    await page.goto(`/${guide.slug}/`)
    await expect(page.locator('main h1')).toHaveText(guide.title)
    await expect(page.locator('main h2')).toHaveCount(guide.sections.length)
    await expect(page.locator('#docs-toc-nav a')).toHaveCount(guide.sections.length)
    await expect(page.locator('#docs-sidebar a[aria-current="page"]')).toHaveAttribute('href', `/${guide.slug}/`)
    const source = `https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/${guide.slug}.mdx`
    await expect(page.locator('.docs-page-tools a').first()).toHaveAttribute('href', source)
    await expect(page.locator('.docs-page-tools a').last()).toHaveAttribute('href', source)
    const links = await page.locator('main a[href^="/"]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('href')!))])
    for (const href of links) expect((await request.get(href)).status(), href).toBe(200)
    for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport)
      if (viewport.width === 390) await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([])
    }
  })
}

test('focusable hidden content reveals on keyboard focus and activates its target', async ({ page }) => {
  await page.goto('/helpers/visually-hidden/')
  const link = page.locator('#helper-skip-example')
  expect(await link.evaluate(element => getComputedStyle(element).clip)).not.toBe('auto')
  await page.keyboard.press('Tab')
  await link.focus()
  await expect(link).toBeFocused()
  await expect(link).toHaveCSS('clip', 'auto')
  expect((await link.boundingBox())!.width).toBeGreaterThan(1)
  await link.press('Enter')
  await expect(page.locator('#helper-skip-target')).toBeFocused()
})

test('focus ring and lift support keyboard focus and reduced motion', async ({ page }) => {
  await page.goto('/helpers/focus-ring/')
  await page.keyboard.press('Tab')
  await page.locator('#helper-focus-link').focus()
  await expect(page.locator('#helper-focus-link')).toHaveCSS('outline-style', 'solid')
  await expect(page.locator('#helper-focus-link')).toHaveCSS('outline-color', 'rgb(7, 89, 133)')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/helpers/hover-lift/')
  await page.keyboard.press('Tab')
  const lift = page.locator('#helper-lift-link')
  await lift.focus()
  await expect.poll(() => lift.evaluate(element => getComputedStyle(element).transform)).not.toBe('none')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(lift).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -4)')
  const durations = await lift.evaluate(element => getComputedStyle(element).transitionDuration.split(',').map(value => parseFloat(value)))
  expect(durations.every(value => value <= .00001)).toBe(true)
})

test('text truncation preserves text and stretched links stay within their card', async ({ page }) => {
  await page.goto('/helpers/text-truncation/')
  const text = page.locator('#helper-truncated')
  await expect(text).toHaveCSS('text-overflow', 'ellipsis')
  expect(await text.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true)
  await expect(text).toContainText('inside a constrained text container')
  await page.goto('/helpers/stretched-link/')
  const card = page.locator('#helper-stretched-card')
  await card.scrollIntoViewIfNeeded()
  const box = (await card.boundingBox())!
  await page.mouse.click(box.x + box.width - 12, box.y + 12)
  await expect(page).toHaveURL(/\/layout\/grid\/$/)
})

test('sticky helpers honor the shared layer token and retain their scroll position', async ({ page }) => {
  await page.route('**/helper-sticky-fixture/', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="en"><head><title>Sticky fixture</title><link rel="stylesheet" href="/dist/css/tremplin.min.css"></head><body><main><h1>Sticky example</h1><div id="frame" style="block-size:120px;overflow:auto;--trm-z-sticky:77"><div class="sticky-top" id="sticky" style="background:white">Sticky heading</div><div style="block-size:400px">Scrollable content</div></div></main></body></html>' }))
  await page.goto('/helper-sticky-fixture/')
  const sticky = page.locator('#sticky')
  await expect(sticky).toHaveCSS('z-index', '77')
  const before = (await sticky.boundingBox())!.y
  await page.locator('#frame').evaluate(element => { element.scrollTop = 100 })
  expect((await sticky.boundingBox())!.y).toBeCloseTo(before, 0)
})

test('documented icon hook moves direct bi children and stacks respond to their container', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/helpers/icon-link/')
  const link = page.locator('#helper-icon-motion')
  await link.hover()
  await expect(link.locator(':scope > .bi')).toHaveCSS('width', '16px')
  await expect(link.locator(':scope > .bi')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 4, 0)')
  await page.goto('/helpers/stacks/')
  const stack = page.locator('#helper-responsive-stack')
  const container = stack.locator('..')
  for (const [width, direction] of [[500, 'column'], [600, 'row']] as const) {
    await container.evaluate((element, value) => { element.style.width = value + 'px' }, width)
    await expect(stack).toHaveCSS('flex-direction', direction)
  }
})
