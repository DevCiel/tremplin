import { auditDocumentationPage } from './audit-page.fixture'
import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { guides } from '../../site/src/data/guide-docs'
import { installationManagers } from '../../site/src/data/installation-examples'

const manifest = JSON.parse(readFileSync('metadata/components.json', 'utf8')) as { components: Array<{ name: string }> }
const pages = ['/', '/getting-started/', '/getting-started/install/', '/getting-started/download/', '/getting-started/accessibility/', '/customize/sass/', '/layout/grid/', '/forms/overview/', '/utilities/api/', '/components/', '/components/accordion/', '/components/alert/', '/components/avatar/', '/components/badge/', '/components/bottom-sheet/', '/components/breadcrumb/', '/components/button/', '/components/card/', '/components/carousel/', '/components/chip/', '/components/chips/', '/components/collapse/', '/components/combobox/', '/components/command-palette/', '/components/data-table/', '/components/datepicker/', '/components/dialog/', '/components/divider/', '/components/drawer/', '/components/empty-state/', '/components/forms/', '/components/list-group/', '/components/menu/', '/components/navbar/', '/components/nav-overflow/', '/components/otp-input/', '/components/pagination/', '/components/popover/', '/components/progress/', '/components/range/', '/components/scrollspy/', '/components/skeleton/', '/components/spinner/', '/components/status/', '/components/stepper/', '/components/strength/', '/components/tab/', '/components/table/', '/components/timeline/', '/components/toast/', '/components/toggler/', '/components/tooltip/', '/api/', '/api/drawer/', '/icons/', '/themes/', '/customize/', '/integrations/', '/utilities/', '/playground/', '/examples/']

for (const path of pages) {
  test(`${path} renders and meets WCAG A/AA`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('main[data-pagefind-body]')).toBeVisible()

    const results = await auditDocumentationPage(page)

    expect(results.violations).toEqual([])
  })
}

test('documentation search returns an indexed result', async ({ page }) => {
  await page.goto('/')
  const input = page.locator('#search input')
  await expect(input).toBeVisible()
  await input.fill('container queries')
  await expect(page.locator('.pagefind-ui__result').first()).toBeVisible()
})

test('documentation shell exposes responsive navigation and a generated page outline', async ({ page }) => {
  await page.goto('/components/button/')
  await expect(page.locator('#docs-sidebar')).toBeVisible()
  await expect(page.locator('#docs-toc')).toBeVisible()
  await expect(page.locator('.docs-page-tools')).toContainText('Layer: components')
  await expect(page.locator('.docs-page-tools').getByRole('link', { name: /View & edit/i })).toBeVisible()
  await expect(page.locator('#docs-toc-nav').getByRole('link', { name: 'Example', exact: true })).toHaveAttribute('href', '#example')

  await page.goto('/')
  await expect(page.locator('#docs-sidebar')).toBeHidden()

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/getting-started/install/')
  const menu = page.getByRole('button', { name: 'Toggle documentation navigation' })
  await expect(menu).toBeVisible()
  await expect(page.locator('#docs-sidebar')).toBeHidden()
  await menu.click()
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('#docs-sidebar')).toBeVisible()
  await expect(page.locator('#docs-sidebar a[href="/getting-started/install/"]')).toHaveAttribute('aria-current', 'page')
})

test('installation package-manager tabs switch commands', async ({ page }) => {
  await page.goto('/getting-started/install/')
  const tabs = page.locator('[data-package-tabs]')
  await tabs.getByRole('tab', { name: 'pnpm' }).click()
  await expect(tabs.getByRole('tabpanel')).toContainText(installationManagers[1][1])
  await expect(tabs.getByRole('tab', { name: 'pnpm' })).toHaveAttribute('aria-selected', 'true')
})

test('version selector offers only maintained framework documentation', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#docs-version option')).toHaveCount(1)
  await expect(page.locator('#docs-version')).toHaveValue('/')
  for (const version of ['0.5', '0.6', '0.7']) {
    const response = await page.request.get('/docs/' + version + '/')
    expect(response.status()).toBe(404)
  }
})

test('generated API and icon catalogs expose searchable contracts', async ({ page }) => {
  await page.goto('/api/drawer/')
  await expect(page.getByRole('heading', { name: 'Options' })).toBeVisible()
  await expect(page.getByText('keyboard', { exact: true })).toBeVisible()
  await expect(page.getByText('show.trm.drawer', { exact: true })).toBeVisible()

  await page.goto('/icons/')
  const filter = page.locator('#icon-filter')
  await filter.fill('heart')
  await expect(page.locator('[data-icon="heart"]')).toBeVisible()
  await expect(page.locator('[data-icon="calendar"]')).toBeHidden()
})

test('component catalog links every documented component', async ({ page, request }) => {
  await page.goto('/components/')
  for (const component of manifest.components) {
    const href = `/components/${component.name}/`
    await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible()
    expect((await request.get(href)).status()).toBe(200)
  }
})

test('guide navigation links every foundational reference page', async ({ page, request }) => {
  await page.goto('/getting-started/install/')
  for (const guide of guides) {
    const href = `/${guide.slug}/`
    await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible()
    expect((await request.get(href)).status()).toBe(200)
  }
})

test('download guide publishes verifiable release assets', async ({ page, request }) => {
  await page.goto('/getting-started/download/')
  await expect(page.getByRole('heading', { name: 'Release assets' })).toBeVisible()
  await expect(page.getByText('sha384-', { exact: false }).first()).toBeVisible()
  expect((await request.get('/dist/css/tremplin.min.css')).status()).toBe(200)
  expect((await request.get('/dist/integrity.json')).status()).toBe(200)
})

test('component pages expose live examples and source-generated API details', async ({ page }) => {
  await page.goto('/components/collapse/')
  await expect(page.getByRole('heading', { name: 'Collapse', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Show details' }).click()
  await expect(page.locator('#details')).toHaveClass(/show/)
  await expect(page.getByRole('heading', { name: 'Options' })).toBeVisible()
  await expect(page.getByText('shown.trm.collapse', { exact: true })).toBeVisible()
})

test('rich component guides expose variants, variables, keyboard behavior, and working states', async ({ page }) => {
  await page.goto('/components/button/')
  await expect(page.getByRole('heading', { name: 'Variants and states' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'CSS variables' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Keyboard interactions' })).toBeVisible()
  await expect(page.getByText('--trm-btn-bg', { exact: true })).toBeVisible()

  const toggle = page.getByRole('button', { name: 'Toggle notifications' })
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await expect(toggle).toHaveClass(/active/)

  await page.goto('/components/navbar/')
  await page.setViewportSize({ width: 390, height: 844 })
  const navbarToggle = page.getByRole('button', { name: 'Open navigation', exact: true })
  await page.locator('#docs-navbar').evaluate(element => element.addEventListener('shown.trm.drawer', () => element.setAttribute('data-test-shown', 'true'), { once: true }))
  await navbarToggle.click()
  await expect(page.locator('#docs-navbar')).toHaveAttribute('data-test-shown', 'true')
  await expect(navbarToggle).toHaveAttribute('aria-haspopup', 'dialog')
  await expect(page.locator('#docs-navbar:modal')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(page.locator('#docs-navbar')).not.toHaveAttribute('open')
  await expect(navbarToggle).toBeFocused()
  await page.setViewportSize({ width: 1280, height: 900 })

  await page.goto('/components/collapse/')
  const disclosure = page.getByRole('button', { name: 'Project details' })
  await disclosure.click()
  await expect(disclosure).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('#collapse-project')).toHaveClass(/show/)
})

test('overlay guides demonstrate working open, close, positioning, and dismissal behavior', async ({ page }) => {
  await page.goto('/components/dialog/')
  await page.locator('#confirm').evaluate(element => element.addEventListener('shown.trm.dialog', () => element.setAttribute('data-test-shown', 'true'), { once: true }))
  await page.getByRole('button', { name: 'Open dialog' }).click()
  await expect(page.locator('#confirm')).toHaveAttribute('open', '')
  await expect(page.locator('#confirm')).toHaveAttribute('data-test-shown', 'true')
  await page.locator('#confirm').getByRole('button', { name: 'Confirm' }).click()
  await expect(page.locator('#confirm')).not.toHaveAttribute('open', '')

  await page.goto('/components/drawer/')
  await page.locator('#navigation').evaluate(element => element.addEventListener('shown.trm.drawer', () => element.setAttribute('data-test-shown', 'true'), { once: true }))
  await page.getByRole('button', { name: 'Open drawer' }).click()
  await expect(page.locator('#navigation')).toHaveAttribute('open', '')
  await expect(page.locator('#navigation')).toHaveAttribute('data-test-shown', 'true')
  await page.keyboard.press('Escape')
  await expect(page.locator('#navigation')).not.toHaveAttribute('open', '')

  await page.goto('/components/tooltip/')
  const tooltipTrigger = page.getByRole('button', { name: 'Hover or focus' })
  await tooltipTrigger.focus()
  await expect(tooltipTrigger).toHaveAttribute('aria-describedby', /.+/)
  const tooltipId = await tooltipTrigger.getAttribute('aria-describedby')
  const liveTooltip = page.locator(`#${tooltipId}`)
  await expect(liveTooltip).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(liveTooltip).toHaveCount(0)

  await page.goto('/components/popover/')
  const popoverTrigger = page.getByRole('button', { name: 'Show popover' })
  await popoverTrigger.click()
  await expect(popoverTrigger).toHaveAttribute('aria-describedby', /.+/)
  const popoverId = await popoverTrigger.getAttribute('aria-describedby')
  const livePopover = page.locator(`#${popoverId}`)
  await expect(livePopover).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(livePopover).toHaveCount(0)
})

test('carousel, tab, toast, and scrollspy guides demonstrate their interaction contracts', async ({ page }) => {
  await page.goto('/components/carousel/')
  const fadeCarousel = page.locator('#carousel-fade')
  await fadeCarousel.getByRole('button', { name: 'Next' }).click()
  await expect(fadeCarousel.locator('.carousel-item').nth(1)).toHaveClass(/active/)

  await page.goto('/components/tab/')
  const securityTab = page.getByRole('tab', { name: 'Security' })
  await securityTab.click()
  await expect(securityTab).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('#security-panel')).toHaveClass(/active/)

  await page.goto('/components/toast/')
  const primaryToast = page.locator('.docs-example').first().locator('.toast')
  await primaryToast.getByRole('button', { name: 'Dismiss' }).click()
  await expect(primaryToast).not.toHaveClass(/show/)

  await page.goto('/components/scrollspy/')
  await page.locator('#smooth-spy-nav').getByRole('link', { name: 'API' }).click()
  await expect(page).toHaveURL(/#smooth-api$/)
  await expect(page.locator('#smooth-api')).toBeFocused()
})

test('accordion, breadcrumb, list group, and pagination guides demonstrate their state contracts', async ({ page }) => {
  await page.goto('/components/accordion/')
  const accessControl = page.locator('#project-access > summary')
  await accessControl.click()
  await expect(page.locator('#project-access')).toHaveAttribute('open', '')
  await expect(page.locator('#project-overview')).not.toHaveAttribute('open')
  await expect(accessControl).not.toHaveAttribute('data-trm-toggle')

  await page.goto('/components/breadcrumb/')
  await expect(page.locator('.docs-example').first().locator('[aria-current="page"]')).toHaveText('Docs')

  await page.goto('/components/list-group/')
  await expect(page.locator('.docs-example').first().locator('.list-group-item.active')).toHaveAttribute('aria-current', 'true')

  await page.goto('/components/pagination/')
  const resultPages = page.getByRole('navigation', { name: 'Search results pages' })
  const currentPage = resultPages.locator('[aria-current="page"]')
  await expect(currentPage).toHaveText('1')
  await expect(resultPages.locator('[aria-disabled="true"]')).toHaveAttribute('tabindex', '-1')
})

test('progress, spinner, skeleton, and avatar guides expose accessible state contracts', async ({ page }) => {
  await page.goto('/components/progress/')
  const progress = page.locator('.docs-example').first().getByRole('progressbar')
  await expect(progress).toHaveAttribute('aria-valuenow', '65')
  await expect(progress).toHaveAttribute('aria-valuemax', '100')

  await page.goto('/components/spinner/')
  await expect(page.locator('.docs-example').first().getByRole('status')).toContainText('Loading')

  await page.goto('/components/skeleton/')
  const busyRegion = page.locator('#feed-placeholder')
  await expect(busyRegion).toHaveAttribute('aria-label', 'Activity feed')
  await expect(busyRegion).toHaveAttribute('aria-busy', 'true')
  await expect(page.locator('#feed-loading-status')).toHaveText('Loading activity feed...')
  await expect(busyRegion.locator('#feed-loading-status')).toHaveCount(0)
  await expect(busyRegion.locator('[aria-hidden="true"]')).toBeVisible()

  await page.goto('/components/avatar/')
  const avatarLink = page.getByRole('link', { name: 'Alex Brooks: browse components', exact: true })
  await avatarLink.focus()
  await expect(avatarLink).toBeFocused()
})

test('table, chip, stepper, and status guides expose their semantic state contracts', async ({ page }) => {
  await page.goto('/components/table/')
  const table = page.locator('.docs-example').nth(1).getByRole('table', { name: 'Recent invoices' })
  await expect(table.getByRole('columnheader')).toHaveCount(3)
  await expect(table.getByRole('rowheader')).toHaveCount(2)

  await page.goto('/components/chip/')
  const staticChips = page.locator('.docs-example').nth(1)
  await expect(staticChips.locator('.chip')).toHaveText(['Design', 'Engineering'])
  await expect(staticChips.getByRole('button')).toHaveCount(0)
  await expect(staticChips.locator('[tabindex]')).toHaveCount(0)
  // Removal belongs to the actual Chips collection, not CSS-only Chip.
  await page.goto('/components/chips/')
  await page.locator('#skills-input').fill('Accessibility')
  await page.locator('#skills-input').press('Enter')
  const editableChip = page.locator('#skills .chip').filter({ hasText: 'Accessibility' })
  const remove = editableChip.getByRole('button', { name: 'Remove', exact: true })
  await remove.focus()
  await expect(remove).toBeFocused()
  await remove.press('Enter')
  await expect(editableChip).toHaveCount(0)
  await expect(page.locator('#skills-input')).toBeFocused()

  await page.goto('/components/stepper/')
  await expect(page.locator('.docs-example').first().locator('[aria-current="step"]')).toContainText('Profile')
  await expect(page.locator('.docs-example').first().locator('.stepper-item.active').first()).toContainText('Account — complete')

  await page.goto('/components/status/')
  await expect(page.locator('main').getByRole('status')).toContainText('All systems operational')
  await expect(page.locator('.status-pulse')).toContainText('Processing import')
})

test('timeline, divider, empty-state, and data-table guides expose semantic extension contracts', async ({ page }) => {
  await page.goto('/components/timeline/')
  await expect(page.locator('.docs-example').nth(1).locator('ol.timeline')).toHaveAttribute('aria-label', 'Project history')
  await expect(page.locator('.docs-example').nth(1).locator('time').first()).toHaveAttribute('datetime', '2026-10-24T09:30:00+05:30')

  await page.goto('/components/divider/')
  await expect(page.locator('.docs-example').nth(1).locator('.divider')).toHaveAttribute('aria-hidden', 'true')
  await expect(page.getByRole('separator', { name: 'Open and closed totals' })).toHaveAttribute('aria-orientation', 'vertical')

  await page.goto('/components/empty-state/')
  await expect(page.getByRole('heading', { name: 'No projects yet' }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Create project' }).first()).toBeVisible()

  await page.goto('/components/data-table/')
  const sortableHeader = page.locator('.docs-example').nth(1).getByRole('columnheader', { name: 'Name' })
  await expect(sortableHeader).toHaveAttribute('aria-sort', 'ascending')
  await expect(sortableHeader.getByRole('button', { name: 'Name' })).toBeVisible()
})

test('chips, combobox, datepicker, and OTP guides expose advanced input contracts', async ({ page }) => {
  await page.goto('/components/chips/')
  const skills = page.locator('#skills-input')
  await skills.fill('Accessibility')
  await skills.press('Enter')
  await expect(page.locator('#skills .chip').filter({ hasText: 'Accessibility' }).getByRole('button', { name: 'Remove', exact: true })).toBeVisible()

  await page.goto('/components/combobox/')
  const city = page.locator('#guide-city')
  await city.click()
  const citySearch = page.getByRole('searchbox', { name: 'Search City', exact: true })
  await citySearch.fill('lon')
  await citySearch.press('ArrowDown')
  await expect(page.locator('#guide-city-menu [data-trm-value="lon"]')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(city.locator('.combobox-value')).toHaveText('London')
  await expect(page.locator('input[name="guide-city"]')).toHaveValue('lon')
  await expect(city).toBeFocused()

  await page.goto('/components/datepicker/')
  const date = page.locator('#guide-deadline')
  await date.click()
  await expect(page.locator('[data-vc="calendar"][data-vc-input]')).toBeVisible()
  await expect(page.getByRole('grid').last()).toBeVisible()
  await page.locator('h1').click()
  await expect(page.locator('[data-vc="calendar"][data-vc-input]')).toHaveAttribute('aria-hidden', 'true')

  await page.goto('/components/otp-input/')
  const code = page.locator('.docs-example').nth(1).locator('.otp-input')
  await expect(code).toHaveCount(1)
  await code.fill('1234')
  await expect(page.locator('.docs-example').nth(1).locator('.otp-slot-filled')).toHaveCount(4)
  await expect(code).toHaveAttribute('autocomplete', 'one-time-code')
})

test('range, strength, toggler, and nav overflow guides expose adaptive control contracts', async ({ page }) => {
  await page.goto('/components/range/')
  const range = page.locator('#range-volume')
  await expect(range.locator('..')).toHaveAttribute('style', /--trm-range-fill/)
  await expect(range.locator('xpath=following-sibling::output[1]').locator('.tooltip-inner')).toHaveText('40')

  await page.goto('/components/strength/')
  const strength = page.locator('.docs-example').nth(1)
  await expect(strength.locator('.strength-text')).toHaveText('Strong')
  await expect(strength.locator('.strength-segment.active')).toHaveCount(4)

  await page.goto('/components/toggler/')
  const trigger = page.locator('[data-trm-target="#toggler-panel"]')
  const panel = page.locator('#toggler-panel')
  await trigger.click()
  await expect(panel).toHaveClass(/bg-2/)
  await expect(trigger).not.toHaveAttribute('aria-expanded')
  await expect(panel).not.toHaveAttribute('hidden', '')
  await trigger.press('Escape')
  await expect(panel).toHaveClass(/bg-2/)
  await expect(trigger).toBeFocused()
  await trigger.press('Enter')
  await expect(panel).not.toHaveClass(/bg-2/)

  await page.goto('/components/nav-overflow/')
  const overflowToggle = page.locator('.docs-example').nth(1).locator('.nav-overflow-toggle')
  await expect(overflowToggle).toHaveAttribute('data-trm-toggle', 'menu')
  await expect(overflowToggle).toHaveAttribute('aria-expanded', 'false')
})

test('core sheet and optional command palette guides expose working interaction contracts', async ({ page }) => {
  await page.goto('/components/bottom-sheet/')
  const sheetTrigger = page.locator('[data-trm-target="#actions"]')
  const sheet = page.locator('#actions')
  await sheet.evaluate(element => element.addEventListener('shown.trm.drawer', () => element.setAttribute('data-test-shown', 'true'), { once: true }))
  await sheetTrigger.click()
  await expect(sheet).toBeVisible()
  await expect(sheet).toHaveAttribute('open', '')
  await expect(sheet).toHaveAttribute('data-test-shown', 'true')
  await page.keyboard.press('Escape')
  await expect(sheetTrigger).toBeFocused()

  await page.goto('/components/command-palette/')
  const paletteTrigger = page.locator('[data-trm-target="#commands"]')
  await paletteTrigger.click()
  const palette = page.locator('#commands')
  const search = palette.locator('.command-palette-input')
  await expect(palette).toBeVisible()
  await search.fill('settings')
  await expect(palette.getByRole('option', { name: /Preview settings/ })).toBeVisible()
  await search.press('Enter')
  await expect(palette).toBeHidden()
  await expect(paletteTrigger).toBeFocused()
})

test('playground renders edited Tremplin markup', async ({ page }) => {
  await page.goto('/playground/')
  const editor = page.locator('#markup')
  await editor.fill('<button class="btn btn-success">Updated preview</button>')
  const button = page.frameLocator('#preview').locator('button')
  await expect(button).toHaveText('Updated preview')
  await expect(button).toHaveCSS('display', 'inline-flex')
})
