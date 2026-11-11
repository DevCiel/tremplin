import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import original from '../fixtures/mdx-migration/component-advanced.before.json' with { type: 'json' }

test.use({ reducedMotion: 'reduce' })

for (const name of ['datepicker', 'otp-input', 'range', 'strength']) test(name + ': advanced script boundaries', async ({ page }) => {
  const blocked: string[] = []
  await page.route('**/*', route => {
    if (route.request().resourceType() === 'script') { blocked.push(route.request().url()); return route.abort() }
    return route.continue()
  })
  await page.goto('/components/' + name + '/')
  expect(blocked.length).toBeGreaterThan(0)
  if (name === 'datepicker') {
    const input = page.locator('#deadline')
    await input.fill('Preview date')
    await input.click()
    await expect(input).toHaveValue('Preview date')
    await expect(page.locator('[data-vc="calendar"]')).toHaveCount(0)
    await expect(page.locator('#inline-calendar-value')).toHaveValue('2026-10-15')
  } else if (name === 'otp-input') {
    const input = page.locator('#otp-example-code')
    await input.fill('12ab')
    await expect(input).toHaveValue('12ab')
    await expect(input).toHaveAttribute('name', 'code')
    await expect(page.locator('#otp-example .otp-slots')).toHaveCount(0)
  } else if (name === 'range') {
    const input = page.locator('#volume')
    await input.focus()
    await input.press('ArrowRight')
    await expect(input).toHaveValue('45')
    await expect(page.locator('#volume-range .form-range-bubble')).toHaveCount(0)
    await page.getByRole('button', { name: 'Set demo value to 75', exact: true }).click()
    await expect(page.locator('#submitted-range')).toHaveValue('40')
  } else {
    await page.locator('#password').fill('Synthetic123!')
    await expect(page.locator('#password-strength .active')).toHaveCount(0)
    await expect(page.locator('#password-feedback')).toBeEmpty()
    await expect(page.locator('#password')).toHaveAttribute('type', 'password')
  }
})

for (const item of original) test(item.name + ': authored advanced content, API and source links', async ({ page, request }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/components/' + item.name + '/')
  await expect(page.locator('main h1')).toHaveText(item.title)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', item.description)
  await expect(page.locator('.docs-variant > h3')).toHaveText(item.detail.variants.map(variant => variant.title))
  await expect(page.locator('.docs-page-tools a').first()).toHaveAttribute('href', `https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/components/${item.name}.mdx`)
  await expect(page.locator('.docs-page-tools a').last()).toHaveAttribute('href', item.reference)
  await expect(page.locator('#docs-sidebar a[aria-current="page"]')).toHaveAttribute('href', `/components/${item.name}/`)
  const options = page.getByRole('region', { name: 'Source-verified option defaults', exact: true })
  await expect(options.locator('tbody tr td:first-child code')).toHaveText(item.sourceOptions.map(option => option.name))
  await expect(options.locator('tbody tr td:nth-child(2)')).toHaveText(item.sourceOptions.map(option => option.type))
  await expect(options.locator('tbody tr td:nth-child(3) code')).toHaveText(item.sourceOptions.map(option => option.defaultValue))
  await expect(options.locator('tbody tr td:nth-child(4)')).toHaveText(item.sourceOptions.map(option => option.description))
  await expect(page.locator('#javascript + p + .docs-code pre code')).toHaveText(item.javascript)
  await expect(page.locator('#methods + ul code')).toHaveText([...item.commonMethods, ...item.definition.methods])
  await expect(page.locator('#events + .table-responsive tbody tr td:first-child code')).toHaveText(Object.keys(item.events))
  await expect(page.locator('#events + .table-responsive tbody tr td:last-child')).toHaveText(Object.values(item.events))
  await expect(page.locator('#data-attributes + .docs-class-list code')).toHaveText(item.definition.dataAttributes)
  if (item.name === 'datepicker') {
    await expect(page.getByRole('button', { name: 'Copy calendar demo layout CSS', exact: true })).toBeVisible()
    await expect(page.locator('main')).toContainText('Catalog click/focusin/pointerdown entries are internal listeners')
  }
  if (item.name === 'otp-input') await expect(page.locator('main')).toContainText('OTP runtime keys use .trm.otpInput')
  else await expect(page.getByRole('button', { name: 'Copy advanced input demo setup', exact: true })).toBeVisible()
  const copy = page.locator('.docs-example + .docs-code .docs-copy').first()
  await expect(copy).toBeVisible()
  const exampleCode = await page.locator('.docs-example + .docs-code pre code').first().textContent()
  const links = await page.locator('main a[href^="/"]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('href')!))])
  for (const href of links) expect((await request.get(href)).status(), href).toBe(200)
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async (text: string) => { (window as unknown as { copiedOverlayExample: string }).copiedOverlayExample = text }
    } })
  })
  await copy.click()
  expect(await page.evaluate(() => (window as unknown as { copiedOverlayExample: string }).copiedOverlayExample)).toBe(exampleCode)
  expect(errors).toEqual([])
})

for (const item of original) for (const theme of ['light', 'dark']) for (const directions of item.name === 'datepicker' ? [['ltr'], ['rtl']] : [['ltr', 'rtl']]) test(item.name + ': authored advanced accessibility ' + theme + (item.name === 'datepicker' ? ' ' + directions[0] : ''), async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/components/' + item.name + '/')
  for (const dir of directions) {
    await page.locator('html').evaluate((element, state) => { element.setAttribute('data-trm-theme', state.theme); element.setAttribute('dir', state.dir) }, { theme, dir })
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 })
      await page.evaluate(() => window.scrollTo(0, 0))
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
    }
  }
  expect(errors).toEqual([])
})
