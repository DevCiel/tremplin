import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const pageErrors = new WeakMap<Page, string[]>()

test.beforeEach(async ({ page }) => {
  const errors: string[] = []
  pageErrors.set(page, errors)
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/nav-identity/', route => route.fulfill({
    contentType: 'text/html',
    headers: { 'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'; object-src 'none'; require-trusted-types-for 'script'; trusted-types tremplin" },
    body: `<!doctype html><html lang="en"><head><title>Navigation identity</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/dist/css/tremplin.css"><script type="module" src="/tests/browser/runtime.mjs"></script></head><body><main class="container"><h1>Navigation identity</h1>
    ${['first', 'second'].map(prefix => `<nav id="${prefix}-nav" class="nav-overflow" aria-label="${prefix} navigation" data-trm-toggle="nav-overflow" data-trm-collapse-below="3000"><ul class="nav"><li class="nav-item"><a id="${prefix}-link" class="nav-link" href="#${prefix}-target" aria-labelledby="${prefix}-label" aria-describedby="${prefix}-description"><span id="${prefix}-label">Project settings</span><span id="${prefix}-description" class="visually-hidden">Manage your project</span><svg aria-hidden="true" width="16" height="16"><defs><linearGradient id="${prefix}-paint"><stop offset="0"/></linearGradient></defs><path fill="url(#${prefix}-paint)" d="M0 0h16v16H0z"/></svg></a></li></ul></nav><section id="${prefix}-target"><h2>${prefix} project</h2></section>`).join('')}
    </main></body></html>`
  }))
  await page.goto('/nav-identity/')
  await expect(page.locator('.nav-overflow-initialized')).toHaveCount(2)
})

test.afterEach(async ({ page }) => expect(pageErrors.get(page)).toEqual([]))

async function auditNavigation(page: Page) {
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(axe.violations).toEqual([])
}

test('cloned links keep accessible names, local SVG/ARIA references and unique IDs under CSP', async ({ page, browserName }) => {
  for (const prefix of ['first', 'second']) {
    const nav = page.locator(`#${prefix}-nav`)
    await nav.getByRole('button', { name: 'More' }).click()
    const menu = nav.locator('.nav-overflow-menu')
    await expect(menu).toBeVisible()
    await expect(menu).toHaveCSS('opacity', '1')
    const copy = nav.locator('.nav-overflow-menu .menu-item')
    await expect(copy).toBeVisible()
    await expect(copy).toHaveAccessibleName('Project settings')
    await expect(copy).toHaveAccessibleDescription('Manage your project')
    await expect(copy).toHaveAttribute('href', `#${prefix}-target`)
    expect(await copy.evaluate(element => {
      const label = element.querySelector('span')!, paint = element.querySelector('linearGradient')!
      return element.getAttribute('aria-labelledby') === label.id && element.querySelector('path')!.getAttribute('fill') === `url(#${paint.id})`
    })).toBe(true)
    await copy.focus()
    await expect(copy).toBeFocused()
    // Keep contrast coverage for the open menu, not just its closed trigger.
    await auditNavigation(page)
    await copy.press('Escape')
    await expect(nav.getByRole('button', { name: 'More' })).toBeFocused()
    // Focus returns before Menu's allow-discrete fade-out removes its layout.
    await expect(menu).toBeHidden()
  }
  expect(await page.locator('[id]').evaluateAll(nodes => new Set(nodes.map(node => node.id)).size === nodes.length)).toBe(true)
  expect(await page.locator('#first-label').count()).toBe(1)
  if (browserName === 'chromium') expect(await page.evaluate(() => Boolean((window as any).trustedTypes))).toBe(true)
  await auditNavigation(page)
})

test('updates and disposal leave original IDs and reference attributes untouched', async ({ page }) => {
  const before = await page.locator('#first-link').evaluate(element => element.outerHTML)
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => (window as any).TremplinFramework.NavOverflow.getInstance('#first-nav').update())
    expect(await page.locator('[id]').evaluateAll(nodes => new Set(nodes.map(node => node.id)).size === nodes.length)).toBe(true)
  }
  await page.evaluate(() => (window as any).TremplinFramework.NavOverflow.getInstance('#first-nav').dispose())
  expect(await page.locator('#first-link').evaluate(element => element.outerHTML)).toBe(before)
  await expect(page.locator('#first-nav .nav-overflow-menu')).toHaveCount(0)
  await expect(page.locator('#first-link')).toBeVisible()
})
