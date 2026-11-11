import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('MDX collection overviews retain their URLs, navigation, and indexed bodies', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  for (const [route, heading] of [
    ['/getting-started/', 'Getting started'], ['/customize/', 'Customize Tremplin'],
    ['/utilities/', 'Utilities'], ['/integrations/', 'Framework integrations']
  ]) {
    expect((await page.goto(route!))?.status()).toBe(200)
    await expect(page.locator('main[data-pagefind-body] h1')).toHaveText(heading!)
    await expect(page.getByRole('navigation', { name: 'Primary', exact: true })).toBeVisible()
    await expect(page.locator('#search input')).toBeVisible()
  }
  expect(errors).toEqual([])
})

test('custom 404 is accessible and excluded from the search index', async ({ page }) => {
  await page.goto('/404.html')
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
  await expect(page.locator('main')).toHaveAttribute('data-pagefind-ignore', '')
  await expect(page.locator('[data-pagefind-body]')).toHaveCount(0)
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(result.violations).toEqual([])
})

test('crawler endpoint and authored static assets are served without redirects', async ({ request }) => {
  const robots = await request.get('/robots.txt')
  expect(robots.status()).toBe(200)
  expect(robots.headers()['content-type']).toContain('text/plain')
  expect(await robots.text()).toBe('User-agent: *\nAllow: /\n')
  for (const asset of ['docs-icons.svg', 'content-sample.svg', 'geist-latin.woff2', 'geist-mono-latin.woff2']) {
    const response = await request.get('/' + asset)
    expect(response.status()).toBe(200)
    expect((await response.body()).length).toBeGreaterThan(0)
  }
})
