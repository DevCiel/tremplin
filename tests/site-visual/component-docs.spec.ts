import { expect, test } from '@playwright/test'

for (const topic of ['input-group','floating-labels','form-adorn','layout','validation']) for (const theme of ['light','dark','rtl']) test(`Form composition ${topic} ${theme} source-verified guide`, async ({ page }) => {
  await page.goto(`/forms/${topic}/`)
  if (theme === 'dark') await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
  else if (theme === 'rtl') await page.locator('html').evaluate(el => el.setAttribute('dir','rtl'))
  await expect(page.locator('main')).toHaveScreenshot(`composition-${topic}-${theme}.png`)
})

for (const topic of ['field','form-control','checkbox','radio','switch']) for (const theme of ['light','dark','rtl']) test(`Native Forms ${topic} ${theme} source-verified guide`, async ({ page }) => {
  await page.goto(`/forms/${topic}/`)
  if (theme === 'dark') await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
  else if (theme === 'rtl') await page.locator('html').evaluate(el => el.setAttribute('dir','rtl'))
  await expect(page.locator('main')).toHaveScreenshot(`native-${topic}-${theme}.png`)
})

for (const component of ['button', 'alert', 'badge', 'card', 'forms', 'navbar', 'menu', 'collapse', 'dialog', 'drawer', 'tooltip', 'popover', 'carousel', 'tab', 'toast', 'scrollspy', 'accordion', 'breadcrumb', 'list-group', 'pagination', 'progress', 'spinner', 'skeleton', 'avatar', 'table', 'chip', 'stepper', 'status', 'timeline', 'divider', 'empty-state', 'data-table', 'chips', 'combobox', 'datepicker', 'otp-input', 'range', 'strength', 'toggler', 'nav-overflow', 'bottom-sheet', 'command-palette', 'button-group', 'close-button', 'nav']) {
  test(`${component} guide matches its visual baseline`, async ({ page }) => {
    if (component === 'datepicker') await page.clock.setFixedTime(new Date('2026-11-08T12:00:00Z'))
    await page.goto(`/components/${component}/`)
    await expect(page.locator('main')).toHaveScreenshot(`${component}-guide.png`)
  })
}

for (const component of ['close-button', 'nav', 'list-group', 'collapse', 'toast', 'scrollspy', 'tooltip', 'popover', 'spinner', 'skeleton', 'navbar', 'toggler', 'chip', 'chips', 'datepicker', 'otp-input', 'range', 'strength', 'status', 'timeline', 'divider', 'empty-state']) test(`${component} guide supports the dark documentation theme`, async ({ page }) => {
  if (component === 'datepicker') await page.clock.setFixedTime(new Date('2026-11-08T12:00:00Z'))
  await page.goto(`/components/${component}/`)
  await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-trm-theme', 'dark')
  await expect(page.locator('main')).toHaveScreenshot(`${component}-guide-dark.png`)
})

test('button-group guide renders in an RTL document', async ({ page }) => {
  await page.goto('/components/button-group/')
  await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
  await expect(page.locator('main')).toHaveScreenshot('button-group-guide-rtl.png')
})

test('breadcrumb guide renders in an RTL document', async ({ page }) => {
  await page.goto('/components/breadcrumb/')
  await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
  await expect(page.locator('main')).toHaveScreenshot('breadcrumb-guide-rtl.png')
})

test('button guide supports the dark documentation theme', async ({ page }) => {
  await page.goto('/components/button/')
  await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-trm-theme', 'dark')
  await expect(page.locator('main')).toHaveScreenshot('button-guide-dark.png')
})

test('card guide renders in an RTL document', async ({ page }) => {
  await page.goto('/components/card/')
  await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
  await expect(page.locator('main')).toHaveScreenshot('card-guide-rtl.png')
})

test('menu guide supports the dark documentation theme', async ({ page }) => {
  await page.goto('/components/menu/')
  await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-trm-theme', 'dark')
  await expect(page.locator('main')).toHaveScreenshot('menu-guide-dark.png')
})

test('navbar guide renders in an RTL document', async ({ page }) => {
  await page.goto('/components/navbar/')
  await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
  await expect(page.locator('main')).toHaveScreenshot('navbar-guide-rtl.png')
})

test('table guide renders in an RTL document', async ({ page }) => {
  await page.goto('/components/table/')
  await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
  await expect(page.locator('main')).toHaveScreenshot('table-guide-rtl.png')
})

test('nav-overflow guide renders in an RTL document', async ({ page }) => {
  await page.goto('/components/nav-overflow/')
  await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
  await expect(page.locator('main')).toHaveScreenshot('nav-overflow-guide-rtl.png')
})

test('dialog guide supports the dark documentation theme', async ({ page }) => {
  await page.goto('/components/dialog/')
  await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-trm-theme', 'dark')
  await expect(page.locator('main')).toHaveScreenshot('dialog-guide-dark.png')
})

test('drawer guide renders in an RTL document', async ({ page }) => {
  await page.goto('/components/drawer/')
  await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
  await expect(page.locator('main')).toHaveScreenshot('drawer-guide-rtl.png')
})

test('carousel guide supports the dark documentation theme', async ({ page }) => {
  await page.goto('/components/carousel/')
  await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-trm-theme', 'dark')
  await expect(page.locator('main')).toHaveScreenshot('carousel-guide-dark.png')
})

test('tab guide renders in an RTL document', async ({ page }) => {
  await page.goto('/components/tab/')
  await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
  await expect(page.locator('main')).toHaveScreenshot('tab-guide-rtl.png')
})

test('accordion guide supports the dark documentation theme', async ({ page }) => {
  await page.goto('/components/accordion/')
  await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-trm-theme', 'dark')
  await expect(page.locator('main')).toHaveScreenshot('accordion-guide-dark.png')
})

test('pagination guide renders in an RTL document', async ({ page }) => {
  await page.goto('/components/pagination/')
  await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
  await expect(page.locator('main')).toHaveScreenshot('pagination-guide-rtl.png')
})

test('progress guide supports the dark documentation theme', async ({ page }) => {
  await page.goto('/components/progress/')
  await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-trm-theme', 'dark')
  await expect(page.locator('main')).toHaveScreenshot('progress-guide-dark.png')
})

test('avatar guide renders in an RTL document', async ({ page }) => {
  await page.goto('/components/avatar/')
  await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
  await expect(page.locator('main')).toHaveScreenshot('avatar-guide-rtl.png')
})

test('table guide supports the dark documentation theme', async ({ page }) => {
  await page.goto('/components/table/')
  await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-trm-theme', 'dark')
  await expect(page.locator('main')).toHaveScreenshot('table-guide-dark.png')
})

test('stepper guide renders in an RTL document', async ({ page }) => {
  await page.goto('/components/stepper/')
  await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
  await expect(page.locator('main')).toHaveScreenshot('stepper-guide-rtl.png')
})

test('timeline guide renders in an RTL document', async ({ page }) => {
  await page.goto('/components/timeline/')
  await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
  await expect(page.locator('main')).toHaveScreenshot('timeline-guide-rtl.png')
})

test('data-table guide supports the dark documentation theme', async ({ page }) => {
  await page.goto('/components/data-table/')
  await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-trm-theme', 'dark')
  await expect(page.locator('main')).toHaveScreenshot('data-table-guide-dark.png')
})

test('combobox guide supports the dark documentation theme', async ({ page }) => {
  await page.goto('/components/combobox/')
  await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-trm-theme', 'dark')
  await expect(page.locator('main')).toHaveScreenshot('combobox-guide-dark.png')
})

test('datepicker guide renders in an RTL document', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-08T12:00:00Z'))
  await page.goto('/components/datepicker/')
  await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
  await expect(page.locator('main')).toHaveScreenshot('datepicker-guide-rtl.png')
})

test('combobox guide renders in an RTL document', async ({ page }) => {
  await page.goto('/components/combobox/')
  await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
  await expect(page.locator('main')).toHaveScreenshot('combobox-guide-rtl.png')
})

for (const component of ['otp-input', 'strength']) test(`${component} guide renders in an RTL document`, async ({ page }) => {
  await page.goto(`/components/${component}/`)
  await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
  await expect(page.locator('main')).toHaveScreenshot(`${component}-guide-rtl.png`)
})

test('range guide renders in an RTL document', async ({ page }) => {
  await page.goto('/components/range/')
  await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
  await expect(page.locator('main')).toHaveScreenshot('range-guide-rtl.png')
})

test('nav overflow guide supports the dark documentation theme', async ({ page }) => {
  await page.goto('/components/nav-overflow/')
  await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-trm-theme', 'dark')
  await expect(page.locator('main')).toHaveScreenshot('nav-overflow-guide-dark.png')
})

test('bottom sheet guide renders in an RTL document', async ({ page }) => {
  await page.goto('/components/bottom-sheet/')
  await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
  await expect(page.locator('main')).toHaveScreenshot('bottom-sheet-guide-rtl.png')
})

test('command palette guide supports the dark documentation theme', async ({ page }) => {
  await page.goto('/components/command-palette/')
  await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-trm-theme', 'dark')
  await expect(page.locator('main')).toHaveScreenshot('command-palette-guide-dark.png')
})

test('bottom sheet guide supports the dark documentation theme', async ({ page }) => {
  await page.goto('/components/bottom-sheet/')
  await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-trm-theme', 'dark')
  await expect(page.locator('main')).toHaveScreenshot('bottom-sheet-guide-dark.png')
})

test('command palette guide renders in an RTL document', async ({ page }) => {
  await page.goto('/components/command-palette/')
  await page.locator('html').evaluate(element => element.setAttribute('dir', 'rtl'))
  await expect(page.locator('main')).toHaveScreenshot('command-palette-guide-rtl.png')
})

for (const theme of ['dark','rtl']) test(`forms guide ${theme} source-verified presentation`, async ({ page }) => {
  await page.goto('/components/forms/')
  if (theme === 'dark') await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
  else await page.locator('html').evaluate(el => el.setAttribute('dir','rtl'))
  await expect(page.locator('main')).toHaveScreenshot(`forms-guide-${theme}.png`)
})

for (const theme of ['light','dark','rtl']) test(`Forms overview ${theme} source-verified presentation`, async ({ page }) => {
  await page.goto('/forms/overview/')
  if (theme === 'dark') await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
  else if (theme === 'rtl') await page.locator('html').evaluate(el => el.setAttribute('dir','rtl'))
  await expect(page.locator('main')).toHaveScreenshot(`forms-overview-${theme}.png`)
})
