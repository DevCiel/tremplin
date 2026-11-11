import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { createHash } from 'node:crypto'
import { gettingStartedGuides } from '../helpers/getting-started-contract'
import { frameworkVersion, starterHtml } from '../../site/src/data/installation-examples'

test('footer provides complete third-party and documentation credits', async ({ page, request }) => {
  await page.goto('/getting-started/install/')
  const credits = page.getByRole('link', { name: 'Licenses & credits', exact: true })
  await expect(credits).toHaveAttribute('href', '/THIRD_PARTY_NOTICES.txt')
  const response = await request.get('/THIRD_PARTY_NOTICES.txt')
  expect(response.status()).toBe(200)
  const text = await response.text()
  expect(text).toContain('The Bootstrap Authors')
  expect(text).toContain('Documentation acknowledgements')
  expect(text).toContain('https://creativecommons.org/licenses/by/3.0/')
})

for (const [index, guide] of gettingStartedGuides.entries()) {
  test(`Getting started: ${guide.title} has complete navigation and accessible content`, async ({ page, request }) => {
    await page.goto(`/${guide.slug}/`)
    await expect(page.locator('main h1')).toHaveText(guide.title)
    await expect(page.locator('.docs-main > .docs-callout')).toContainText('Development checkout')
    await expect(page.locator('.docs-page-tools').getByRole('link', { name: 'Tremplin source' })).toHaveAttribute('href', guide.reference!.url)
    await expect(page.locator('#docs-toc-nav a')).toHaveCount(guide.sections.length + (guide.slug.endsWith('/download') ? 1 : 0))
    const previous = index ? `/${gettingStartedGuides[index - 1]!.slug}/` : '/getting-started/'
    await expect(page.locator('.docs-pagination [rel="prev"]')).toHaveAttribute('href', previous)
    if (gettingStartedGuides[index + 1]) {
      await expect(page.locator('.docs-pagination [rel="next"]')).toHaveAttribute('href', `/${gettingStartedGuides[index + 1]!.slug}/`)
    }
    const urls = await page.locator('main a[href^="/"]').evaluateAll(links => [...new Set(links.map(link => link.getAttribute('href')!))])
    for (const url of urls) expect((await request.get(url)).status(), url).toBe(200)
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    expect(result.violations).toEqual([])
  })
}

test('copied HTML quickstart loads local assets and toggles its disclosure', async ({ page }) => {
  await page.route('**/guide-demo/index.html', route => route.fulfill({ contentType: 'text/html', body: starterHtml }))
  await page.route('**/guide-demo/dist/**', route => {
    const url = new URL(route.request().url())
    url.pathname = url.pathname.replace('/guide-demo', '')
    return route.continue({ url: url.toString() })
  })
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/guide-demo/index.html')
  const trigger = page.getByRole('button', { name: 'Show details' })
  await page.locator('#welcome').evaluate(element => {
    element.addEventListener('shown.trm.collapse', () => element.setAttribute('data-test-shown', 'true'), { once: true })
  })
  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('#welcome')).toBeVisible()
  await expect(page.locator('#welcome')).toHaveAttribute('data-test-shown', 'true')
  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(errors).toEqual([])
})

test('installation tabs support keyboard selection and pinned commands', async ({ page }) => {
  await page.goto('/getting-started/install/')
  const npm = page.getByRole('tab', { name: 'npm', exact: true })
  await npm.focus()
  await npm.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'pnpm', exact: true })).toBeFocused()
  await expect(page.getByRole('tabpanel')).toContainText(`pnpm add ./vendor/tremplin-${frameworkVersion}.tgz @floating-ui/dom vanilla-calendar-pro`)
  await page.keyboard.press('End')
  await expect(page.getByRole('tab', { name: 'Bun', exact: true })).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('Home')
  await expect(npm).toBeFocused()
  await expect(npm).toHaveAttribute('aria-selected', 'true')
})

test('installation follows the Bootstrap 6 section hierarchy with truthful Tremplin workflows', async ({ page }) => {
  await page.goto('/getting-started/install/')
  await expect(page.locator('main h2')).toHaveText(['Install', 'More packages', 'CDN', 'Download', 'For AI tools & LLMs'])
  await expect(page.locator('main h3')).toHaveText(['Using npm', 'Using Yarn', 'Using RubyGems', 'Using NuGet', 'Using CDNs', 'Alternative CDNs', 'Use local assets', 'Build from source', 'Troubleshooting'])
  await expect(page.locator('#docs-toc-nav a[data-level="H3"]')).toHaveCount(9)
  await expect(page.locator('main')).toContainText('There is no official Tremplin gem')
  await expect(page.locator('main')).toContainText('There is no official Tremplin NuGet package')
  await expect(page.locator('main')).toContainText('yarn config set nodeLinker node-modules')
  await expect(page.locator('main')).toContainText('All browser downloads are ES modules')
  await expect(page.locator('main a[href="/llms.txt"]')).toBeVisible()
  const commands = await page.locator('main pre').allTextContents()
  expect(commands.join('\n')).toContain('type="importmap"')
  expect(commands.join('\n')).not.toMatch(/gem install|composer require|Install-Package/)
})

test('downloaded CSS matches the documented manifest and AI index is available', async ({ request }) => {
  const manifest = await (await request.get('/dist/integrity.json')).json()
  const css = await (await request.get('/dist/css/tremplin.min.css')).body()
  expect(manifest.version).toBe(frameworkVersion)
  expect(`sha384-${createHash('sha384').update(css).digest('base64')}`).toBe(manifest.assets['css/tremplin.min.css'].integrity)
  const llms = await request.get('/llms.txt')
  expect(llms.status()).toBe(200)
  const context = await llms.text()
  expect(context).toContain('/getting-started/ai/')
  expect(context).toContain('type="module"')
  expect(context).toContain('docs/MIGRATION.md')
  expect(context).not.toMatch(/classic IIFE|exposing TremplinFramework|col-md-6/)
})
