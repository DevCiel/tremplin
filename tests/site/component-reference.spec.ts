import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { coreComponentTopics, componentSource, componentTitle } from '../../site/src/data/component-reference'
import { isAuthoredComponent } from '../../site/src/libs/component-mdx'

for (const topic of coreComponentTopics) {
  test(`Tremplin component topic: ${topic} has working source links and accessible content`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`/components/${topic}/`)
    await expect(page.locator('main h1')).toHaveText(componentTitle(topic))
    const editSource = isAuthoredComponent(topic) ? `site/src/content/docs/components/${topic}.mdx` : componentSource(topic)
    await expect(page.locator('.docs-page-tools').getByRole('link', { name: /View & edit/i })).toHaveAttribute('href', `https://github.com/DevCiel/tremplin/blob/main/${editSource}`)
    await expect(page.locator('.docs-page-tools').getByRole('link', { name: /Tremplin source/ })).toHaveAttribute('href', `https://github.com/DevCiel/tremplin/blob/main/${componentSource(topic)}`)
    await expect(page.locator('#docs-sidebar a[aria-current="page"]')).toHaveAttribute('href', `/components/${topic}/`)
    await expect(page.locator('main .docs-example').first()).toBeVisible()
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([])
    expect(errors).toEqual([])
  })
}

for (const topic of ['button-group', 'close-button', 'nav', 'placeholder', 'toasts']) {
  test(`New component route: ${topic} reflows in dark mobile mode`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`/components/${topic}/`)
    await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([])
  })
}

test('masked close controls render a loadable icon and dismiss the example alert', async ({ page }) => {
  await page.goto('/components/close-button/')
  const close = page.getByRole('button', { name: 'Close example', exact: true }).first()
  // The pinned close control masks the button itself; it has no pseudo-text.
  const icon = await close.evaluate(async element => {
    const style = getComputedStyle(element)
    const source = /^url\(["']?(.*?)["']?\)$/.exec(style.maskImage)?.[1]
    if (!source) throw new Error('Close control has no CSS mask source')
    const image = new Image()
    image.src = source
    await image.decode() // Check that the image can really load, not just a CSS string.
    const box = element.getBoundingClientRect()
    return { mask: style.maskImage, width: box.width, height: box.height, opacity: Number(style.opacity), background: style.backgroundColor, loaded: image.naturalWidth > 0 && image.naturalHeight > 0 }
  })
  expect(icon.mask).toMatch(/^url\(["']?data:image\/svg\+xml,/)
  expect(icon.loaded).toBe(true)
  expect(icon.width).toBeGreaterThanOrEqual(20)
  expect(icon.height).toBeGreaterThanOrEqual(20)
  expect(icon.opacity).toBeGreaterThan(0)
  expect(icon.background).not.toBe('rgba(0, 0, 0, 0)')
  await close.focus()
  await expect(close).toBeFocused()
  await page.getByRole('button', { name: 'Dismiss example message' }).click()
  await expect(page.locator('#reference-close-alert')).toHaveCount(0)
})

test('alias routes use existing APIs and all reference topics appear in the catalog', async ({ page, request }) => {
  await page.goto('/components/')
  for (const topic of coreComponentTopics) {
    await expect(page.locator(`main a[href="/components/${topic}/"]`)).toBeVisible()
    expect((await request.get(`/components/${topic}/`)).status()).toBe(200)
  }
  await page.goto('/components/toasts/')
  await expect(page.locator('main a[href="/api/toast/"]')).toBeVisible()
  expect((await request.get('/api/toasts/')).status()).toBe(404)
  await page.goto('/components/placeholder/')
  await expect(page.locator('main a[href="/components/skeleton/"]')).toBeVisible()
})
