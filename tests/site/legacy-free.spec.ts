import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('current documentation homepage replaces the retired standalone landing page', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('h1')).toBeVisible()
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
})

test('only current documentation and examples are advertised', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/examples/')
  await expect(page.getByRole('heading', { name: 'Examples', exact: true })).toBeVisible()
  await expect(page.locator('#docs-version option')).toHaveCount(1)
  await expect(page.locator('#docs-version')).toHaveValue('/')
  const links = await page.locator('#main-content a[href]').evaluateAll(elements => elements.map(element => element.getAttribute('href')!))
  expect(links.some(href => href.startsWith('/legacy/') || /^\/docs\/0\.[567]\//.test(href))).toBe(false)
  for (const href of links.filter(href => href.startsWith('/'))) expect((await page.request.get(href)).ok(), href).toBe(true)
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([])
  expect(errors).toEqual([])
})

test('retired archive and runtime URLs cannot be served', async ({ request }) => {
  for (const route of ['/docs/0.5/', '/docs/0.6/', '/docs/0.7/', '/legacy/examples/kitchen-sink.html', '/legacy/dist/js/tremplin.js', '/dist/compat/legacy/js/tremplin.js', '/js/tremplin.js', '/docs/index.html', '/dist/js/chunk-54D77KWY.js']) {
    expect((await request.get(route)).status(), route).toBe(404)
  }
  for (const route of ['/getting-started/install/', '/examples/controls/', '/dist/js/tremplin.js', '/dist/css/tremplin.min.css']) expect((await request.get(route)).ok(), route).toBe(true)
})

test('active presets use current token roles and remain accessible', async ({ page }) => {
  await page.goto('/themes/')
  await expect(page.getByRole('heading', { name: 'Theme presets', exact: true })).toBeVisible()
  for (const [preset, background, foreground] of [['ocean', 'rgb(7, 24, 39)', 'rgb(230, 246, 255)'], ['forest', 'rgb(251, 253, 249)', 'rgb(23, 37, 29)']]) {
    const preview = page.locator('.theme-demo[data-trm-theme="' + preset + '"]')
    await expect(preview).toBeVisible()
    const colors = await preview.evaluate(element => ({ background: getComputedStyle(element).backgroundColor, color: getComputedStyle(element).color }))
    expect(colors).toEqual({ background, color: foreground })
    await expect(preview.getByRole('button', { name: 'Primary action' })).toHaveClass('btn-solid theme-primary')
    await preview.getByRole('textbox', { name: 'Project name' }).focus()
    await expect(preview.getByRole('textbox', { name: 'Project name' })).toBeFocused()
  }
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([])
})
