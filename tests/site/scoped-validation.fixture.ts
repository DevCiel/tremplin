import type { Page } from '@playwright/test'

export async function openScopedValidation(page: Page): Promise<void> {
  await page.route('**/forms-valid-fixture/', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="en"><head><title>Validation fixture</title><link rel="stylesheet" href="/dist/css/tremplin.min.css"></head><body><main><h1>Validation test</h1><form><div data-trm-validate="valid"><label for="required-field">Required field</label><input class="form-control" id="required-field" required><p class="valid-feedback" id="required-feedback">Looks good.</p></div><div><label for="optional-field">Optional field</label><input class="form-control" id="optional-field"><p class="valid-feedback" id="optional-feedback">Optional feedback</p></div></form></main></body></html>' }))
  await page.goto('/forms-valid-fixture/')
}
