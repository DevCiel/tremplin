import type { Page } from '@playwright/test'

export async function openUtilityFamily(page: Page, body: string, applicationCss = '') {
  await page.route('**/family-check/', route => route.fulfill({
    contentType: 'text/html',
    body: '<!doctype html><html lang="en" data-trm-theme="light"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Utility family contract</title><link rel="stylesheet" href="/dist/css/tremplin.min.css"><style>html{font-size:16px}body{margin:0}' + applicationCss + '</style></head><body><main><h1>Utility family contract</h1>' + body + '</main></body></html>'
  }))
  await page.goto('/family-check/')
}

export const privateToken = (page: Page, id: string, token: string) => page.locator('#' + id).evaluate((element, name) => getComputedStyle(element).getPropertyValue(name).trim(), token)

export const resolvedColor = (page: Page, id: string, expression: string) => page.locator('#' + id).evaluate((element, value) => {
  const probe = document.createElement('span')
  probe.style.color = value
  element.append(probe)
  const result = getComputedStyle(probe).color
  probe.remove()
  return result
}, expression)
