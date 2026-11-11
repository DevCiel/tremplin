import { readdirSync } from 'node:fs'
import path from 'node:path'
import { auditDocumentationPage } from './audit-page.fixture'
import { expect, test } from '@playwright/test'
import { expectedSiteRoutes } from '../helpers/site-route-contract'

function routes(directory: string, prefix = ''): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    // Frozen/earlier static examples are a separately tracked archive scope,
    // not generated documentation routes. Do not traverse copied dependencies.
    if (entry.isDirectory()) return ['legacy', 'dist', 'pagefind', '_astro'].includes(entry.name) ? [] : routes(path.join(directory, entry.name), `${prefix}/${entry.name}`)
    return entry.name === 'index.html' ? [`${prefix}/`] : []
  }).sort()
}

const generatedRoutes = routes('site-dist')
test('generated route inventory includes the full documentation and current demo', () => {
  expect(generatedRoutes).toEqual(expectedSiteRoutes())
})

for (const route of generatedRoutes) test(`generated page WCAG audit: ${route}`, async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  const response = await page.goto(route)
  const results = await auditDocumentationPage(page)
  const evidence = { route, status: response?.status(), errors, violations: results.violations, previewAudit: results.previewAudit }
  await testInfo.attach('page-audit', { body: JSON.stringify(evidence, null, 2), contentType: 'application/json' })
  expect.soft(response?.status()).toBe(200)
  await expect.soft(page.locator('main[data-pagefind-body]')).toBeVisible()
  expect.soft(errors).toEqual([])
  expect(results.violations, results.violations.map(v => `${v.id}: ${v.nodes.length} nodes`).join('\n')).toEqual([])
})
