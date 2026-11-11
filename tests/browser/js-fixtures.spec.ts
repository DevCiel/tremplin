import { expect, test, type Page } from '@playwright/test'

const pageErrors: string[] = []
test.beforeEach(({ page }) => { pageErrors.length = 0; page.on('pageerror', error => pageErrors.push(error.message)) })
test.afterEach(() => expect(pageErrors).toEqual([]))

async function openFixture(page: Page, body: string) {
  await page.route('**/js-fixture/', route => route.fulfill({
    contentType: 'text/html',
    body: '<!doctype html><html lang="en" data-trm-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Strict JS fixture</title><link rel="stylesheet" href="/dist/css/tremplin.min.css"><script type="module" src="/tests/browser/runtime.mjs"></script></head><body><main style="padding:24px"><h1>Strict JS fixture</h1>' + body + '</main></body></html>'
  }))
  await page.goto('/js-fixture/')
  await page.waitForFunction(() => Boolean((window as any).TremplinFramework?.Dialog))
}

test('native modal stack routes Escape to the top dialog and restores focus/scroll ownership', async ({ page }) => {
  await openFixture(page, '<button id="open">Open</button><dialog id="outer" class="dialog dialog-instant"><div class="dialog-body"><h2>Outer dialog</h2><button id="inner-trigger">Open inner</button></div></dialog><dialog id="inner" class="dialog dialog-instant"><div class="dialog-body"><h2>Inner dialog</h2><button>Inner action</button></div></dialog>')
  await page.evaluate(async () => {
    const f = (window as any).TremplinFramework
    const counts = { outer: 0, inner: 0 }
    ;(window as any).cancelCounts = counts
    for (const id of ['outer', 'inner'] as const) document.querySelector('#' + id)!.addEventListener('cancel', () => counts[id]++)
    document.querySelector<HTMLElement>('#open')!.focus()
    ;(window as any).outer = new f.Dialog('#outer')
    ;(window as any).inner = new f.Dialog('#inner')
    await (window as any).outer.show()
    document.querySelector<HTMLElement>('#inner-trigger')!.focus()
    await (window as any).inner.show()
  })
  await expect(page.locator('dialog:modal')).toHaveCount(2)
  await expect(page.locator('html')).toHaveClass(/dialog-open/)
  await page.keyboard.press('Escape')
  await expect(page.locator('#inner')).not.toHaveAttribute('open')
  await expect(page.locator('#outer')).toHaveAttribute('open')
  await expect(page.locator('#inner-trigger')).toBeFocused()
  await expect(page.locator('html')).toHaveClass(/dialog-open/)
  expect(await page.evaluate(() => (window as any).cancelCounts)).toEqual({ outer: 0, inner: 1 })
  await page.evaluate(() => { (window as any).outer.dispose(); (window as any).inner.dispose() })
  await expect(page.locator('#open')).toBeFocused()
  await expect(page.locator('html')).not.toHaveClass(/dialog-open/)
})

test('dialog data API restores the initiating trigger after dismissal and respects cancellation', async ({ page }) => {
  await openFixture(page, '<button id="open" data-trm-toggle="dialog" data-trm-target="#dialog">Open</button><dialog id="dialog" class="dialog dialog-instant"><div class="dialog-body"><h2>Dialog</h2><button id="close" data-trm-dismiss="dialog">Close</button></div></dialog>')
  await page.evaluate(() => document.querySelector('#dialog')!.addEventListener('show.trm.dialog', event => event.preventDefault(), { once: true }))
  await page.locator('#open').click()
  await expect(page.locator('#dialog')).not.toHaveAttribute('open')
  await page.locator('#open').click()
  await expect(page.locator('#dialog')).toHaveAttribute('open')
  await page.locator('#close').click()
  await expect(page.locator('#dialog')).not.toHaveAttribute('open')
  await expect(page.locator('#open')).toBeFocused()
})

test('nonmodal Dialog stays outside the top layer and handles its own Escape', async ({ page }) => {
  await openFixture(page, '<dialog id="dialog" class="dialog dialog-instant"><div class="dialog-body"><h2>Nonmodal</h2><button id="inside">Inside</button></div></dialog>')
  await page.evaluate(async () => {
    const f = (window as any).TremplinFramework
    await new f.Dialog('#dialog', { modal: false }).show()
    document.querySelector<HTMLElement>('#inside')!.focus()
  })
  await expect(page.locator('#dialog')).toHaveAttribute('open')
  await expect(page.locator('dialog:modal')).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveClass(/dialog-open/)
  await page.keyboard.press('Escape')
  await expect(page.locator('#dialog')).not.toHaveAttribute('open')
})

test('Drawer participates in native modal locking without a synthetic backdrop element', async ({ page }) => {
  await openFixture(page, '<dialog id="drawer" class="drawer drawer-start drawer-instant"><div class="drawer-body"><h2>Drawer</h2><button id="action">Action</button></div></dialog>')
  await page.evaluate(async () => { const f = (window as any).TremplinFramework; (window as any).drawer = new f.Drawer('#drawer'); await (window as any).drawer.show() })
  await expect(page.locator('#drawer:modal')).toHaveCount(1)
  await expect(page.locator('.drawer-backdrop')).toHaveCount(0)
  await expect(page.locator('html')).toHaveClass(/dialog-open/)
  await page.keyboard.press('Escape')
  await expect(page.locator('#drawer')).not.toHaveAttribute('open')
  await expect(page.locator('html')).not.toHaveClass(/dialog-open/)
})

test('tooltip consumes the first native Escape before its parent dialog closes', async ({ page }) => {
  await openFixture(page, '<dialog id="dialog" class="dialog dialog-instant"><div class="dialog-body"><h2>Help</h2><button id="tip">Help trigger</button></div></dialog>')
  await page.evaluate(async () => {
    const f = (window as any).TremplinFramework
    await new f.Dialog('#dialog').show()
    document.querySelector<HTMLElement>('#tip')!.focus()
    await new f.Tooltip('#tip', { title: 'Helpful text', trigger: 'manual', animation: false }).show()
  })
  await expect(page.locator('.tooltip')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(page.locator('.tooltip')).toHaveCount(0)
  await expect(page.locator('#dialog')).toHaveAttribute('open')
  await page.keyboard.press('Escape')
  await expect(page.locator('#dialog')).not.toHaveAttribute('open')
})

test('one Escape dismisses all peer tooltips; disposing removes their capture listeners', async ({ page }) => {
  await openFixture(page, '<button id="first">First</button><button id="second">Second</button>')
  await page.evaluate(async () => {
    const f = (window as any).TremplinFramework
    const tips = [new f.Tooltip('#first', { title: 'First', trigger: 'manual', animation: false }), new f.Tooltip('#second', { title: 'Second', trigger: 'manual', animation: false })]
    ;(window as any).tips = tips
    for (const tip of tips) await tip.show()
  })
  await expect(page.locator('.tooltip')).toHaveCount(2)
  await page.keyboard.press('Escape')
  await expect(page.locator('.tooltip')).toHaveCount(0)
  expect(await page.evaluate(() => {
    for (const tip of (window as any).tips) tip.dispose()
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    document.dispatchEvent(event)
    return event.defaultPrevented
  })).toBe(false)
})

test('Toast promises and lifecycle surround actual CSS transitions and the autohide delay', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await openFixture(page, '<div id="toast" class="toast" style="--trm-toast-transition-duration:.08s"><div class="toast-body">Update complete</div></div>')
  const result = await page.evaluate(async () => {
    const f = (window as any).TremplinFramework, element = document.querySelector('#toast')!
    const events: string[] = [], times: Record<string, number> = {}
    for (const name of ['show', 'shown', 'hide', 'hidden']) element.addEventListener(name + '.trm.toast', () => { events.push(name); times[name] = performance.now() })
    const hidden = new Promise<void>(resolve => element.addEventListener('hidden.trm.toast', () => resolve(), { once: true }))
    const toast = new f.Toast(element, { delay: 160 })
    const opening = toast.show()
    const promise = opening instanceof Promise
    await opening
    events.push('show-promise')
    await hidden
    toast.dispose()
    return { promise, events, delay: times.hide! - times.shown! }
  })
  expect(result.promise).toBe(true)
  expect(result.events).toEqual(['show', 'shown', 'show-promise', 'hide', 'hidden'])
  expect(result.delay).toBeGreaterThanOrEqual(150)
})

test('Toast pointer and keyboard interaction pause autohide until both have left', async ({ page }) => {
  await openFixture(page, '<div id="toast" class="toast toast-instant"><div class="toast-body"><button id="inside">Action</button></div></div><button id="outside">Outside</button>')
  // Give a native pointer action time to reach the newly displayed toast.
  // The waits still exceed the configured delay, so a broken pause fails.
  await page.evaluate(async () => { const f = (window as any).TremplinFramework; await new f.Toast('#toast', { delay: 1000 }).show() })
  await page.locator('#inside').hover()
  await page.waitForTimeout(1100)
  await expect(page.locator('#toast')).toHaveClass(/show/)
  await page.locator('#inside').focus()
  await page.mouse.move(0, 0)
  await page.waitForTimeout(1100)
  await expect(page.locator('#toast')).toHaveClass(/show/)
  await page.locator('#outside').focus()
  await expect(page.locator('#toast')).not.toHaveClass(/show/)
})

const comboMarkup = '<div class="combobox"><button id="city" type="button" class="btn-outline theme-inverse" role="combobox" aria-expanded="false" aria-controls="choices" aria-haspopup="listbox"><span class="combobox-value">Choose a city</span></button><div id="choices" class="menu menu-instant" role="listbox"><input class="combobox-search-input" aria-label="Search cities"><button type="button" class="menu-item" data-trm-value="par" role="option">Paris</button><button type="button" class="menu-item" data-trm-value="lon" role="option">London</button><button type="button" class="menu-item disabled" data-trm-value="lis" role="option" aria-disabled="true">Lisbon</button><button type="button" class="menu-item" data-trm-value="cafe" role="option">Café</button><div class="combobox-no-results d-none">No results</div></div></div><button id="outside" style="position:fixed;inset-block-start:24px;inset-inline-end:24px">Outside</button>'

async function mountCombo(page: Page, multiple = false, animated = false) {
  const messages: string[] = []
  page.on('console', message => { if (message.type() === 'error') messages.push(message.text()) })
  await openFixture(page, animated ? comboMarkup.replace('menu menu-instant', 'menu').replace('id="choices"', 'id="choices" style="transition-duration:.4s;transition-delay:0s"') : comboMarkup)
  await page.evaluate(multi => {
    const f = (window as any).TremplinFramework
    ;(window as any).combo = new f.Combobox('#city', { name: 'city', search: true, searchNormalize: true, multiple: multi })
    document.querySelector('#city')!.setAttribute('data-trm-toggle', 'combobox')
  }, multiple)
  expect(messages).toEqual([])
  expect(await page.evaluate(() => {
    const api = (window as any).TremplinFramework
    return Boolean(api.Combobox.getInstance('#city') && api.Menu.getInstance('#city'))
  })).toBe(true)
}

test('Combobox uses real search visibility, option focus, disabled skipping and submitted values', async ({ page }) => {
  await mountCombo(page)
  await page.locator('#city').click()
  const search = page.getByLabel('Search cities')
  await expect(search).toBeFocused()
  await search.fill('lon')
  await expect(page.locator('[data-trm-value="par"]')).toBeHidden()
  await search.press('ArrowDown')
  await expect(page.locator('[data-trm-value="lon"]')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('.combobox-value')).toHaveText('London')
  await expect(page.locator('input[name="city"]')).toHaveValue('lon')
  await expect(page.locator('#city')).toHaveAttribute('aria-expanded', 'false')
  await page.locator('#city').click()
  await expect(search).toHaveValue('')
  // Reopening clears the value synchronously but hands focus to search in rAF.
  // Wait for that handoff so it cannot steal focus after the End assertion.
  await expect(search).toBeFocused()
  await search.press('End')
  await expect(page.locator('[data-trm-value="cafe"]')).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await expect(page.locator('[data-trm-value="lon"]')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.locator('#city')).toBeFocused()
  await expect(page.locator('#choices')).not.toHaveClass(/show/)
})

test('Combobox multiple choices remain open and empty search/outside-click/disposal clean up', async ({ page }) => {
  await mountCombo(page, true)
  await page.locator('#city').click()
  await page.locator('[data-trm-value="par"]').click()
  await page.locator('[data-trm-value="lon"]').click()
  await expect(page.locator('#choices')).toHaveClass(/show/)
  await expect(page.locator('.combobox-value')).toHaveText('2 selected')
  await expect(page.locator('input[name="city"]')).toHaveValue('par,lon')
  await page.getByLabel('Search cities').fill('missing')
  await expect(page.locator('.combobox-no-results')).not.toHaveClass(/d-none/)
  await page.locator('#outside').click()
  await expect(page.locator('#choices')).not.toHaveClass(/show/)
  await page.evaluate(() => (window as any).combo.dispose())
  await expect(page.locator('input[name="city"]')).toHaveCount(0)
})

test('Combobox completion precedes internal Menu completion in the pin', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await mountCombo(page, false, true)
  const result = await page.evaluate(async () => {
    const toggle = document.querySelector('#city')!, events: string[] = []
    toggle.addEventListener('shown.trm.combobox', () => events.push('combobox-shown'))
    const settledMenu = new Promise<void>(resolve => toggle.addEventListener('shown.trm.menu', () => { events.push('menu-shown'); resolve() }, { once: true }))
    await (window as any).combo.show()
    events.push('combobox-promise')
    const early = [...events]
    await settledMenu
    await (window as any).combo.hide()
    ;(window as any).combo.dispose()
    return { early, events }
  })
  expect(result.early).toEqual(['combobox-shown', 'combobox-promise'])
  expect(result.events).toEqual(['combobox-shown', 'combobox-promise', 'menu-shown'])
})

test('Toggler data API mutates configured targets but does not implement hidden/ARIA disclosure policy', async ({ page }) => {
  await openFixture(page, '<button id="toggle" data-trm-toggle="toggler" data-trm-target="#panel" aria-expanded="false">Toggle</button><div id="panel" hidden data-trm-value="active">Hidden application content</div><button id="disabled" disabled data-trm-toggle="toggler" data-trm-target="#panel">Disabled</button>')
  await page.locator('#toggle').click()
  await expect(page.locator('#panel')).toHaveClass(/active/)
  await expect(page.locator('#panel')).toHaveAttribute('hidden')
  await expect(page.locator('#toggle')).toHaveAttribute('aria-expanded', 'false')
  await page.locator('#toggle').click()
  await expect(page.locator('#panel')).not.toHaveClass(/active/)
  await page.evaluate(() => document.querySelector<HTMLButtonElement>('#disabled')!.click())
  await expect(page.locator('#panel')).not.toHaveClass(/active/)
})
