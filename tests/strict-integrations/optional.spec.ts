import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'

const { commit } = JSON.parse(readFileSync('metadata/bootstrap6-reference.json', 'utf8'))
const preview = `/artifacts/bootstrap6-integrations/${commit}/dist`
const production = process.env.TREMPLIN_INTEGRATION_PROFILE === 'production'
const base = production ? '/dist' : preview
const extensionCss = production ? 'tremplin-extensions' : 'extensions'
const open = async (page: Page, extensions = true) => {
  await page.route('**/strict-integration-check/', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="en"><head><title>Strict integration</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="${base}/css/tremplin.css">${extensions ? `<link rel="stylesheet" href="${base}/css/${extensionCss}.css">` : ''}<script type="importmap">{"imports":{"react":"${preview}/vendors/react.js","@floating-ui/dom":"/artifacts/documentation-assets/dist/vendor/floating-ui.js","vanilla-calendar-pro":"/artifacts/documentation-assets/dist/vendor/vanilla-calendar-pro.js"}}</script></head><body>
    <button id="state" data-trm-toggle="button" aria-pressed="false">State</button>
    <button id="opener" data-trm-toggle="command-palette" data-trm-target="#palette">Open commands</button>
    <div id="palette" class="command-palette" hidden aria-label="Commands"><div class="command-palette-dialog"><div class="command-palette-header"><input class="command-palette-input" aria-label="Search commands"><button data-trm-dismiss="command-palette">Close</button></div><div class="command-palette-list"><section class="command-group"><h2 class="command-group-label">Actions</h2><button class="command-item" data-value="new">New project</button><button class="command-item" disabled>Unavailable</button><button class="command-item" data-value="settings">Settings</button></section></div><div class="command-palette-empty" hidden>No results</div></div></div>
    <div id="reference" style="position:absolute;top:300px;left:400px;width:100px;height:30px">Reference</div><div id="floating" style="position:absolute;width:80px;height:20px">Floating</div>
    <div id="mount"></div><div class="empty-state">Nothing here</div><div class="divider">Or</div><span class="status">Ready</span>
    <script type="module">window.strictCore = await import('${base}/js/tremplin.js'); window.strictReady = true;</script>
  </body></html>` }))
  await page.goto('/strict-integration-check/')
  await expect.poll(() => page.evaluate(() => (window as any).strictReady)).toBe(true)
}
const loadPalette = async (page: Page) => {
  await page.evaluate(async url => {
    const { CommandPalette } = await import(url)
    ;(window as any).Palette = CommandPalette
  }, `${base}/js/extensions/command-palette.js`)
}

test('strict main does not register extensions until explicitly imported', async ({ page }) => {
  await open(page, false)
  expect(await page.evaluate(() => 'CommandPalette' in (window as any).strictCore)).toBe(false)
  await page.locator('#opener').click()
  await expect(page.locator('#palette')).toBeHidden()
  await loadPalette(page)
  await page.locator('#opener').click()
  await expect(page.locator('#palette')).toBeVisible()
  expect(await page.evaluate(() => (window as any).Palette.getInstance('#palette') === (window as any).Palette.getOrCreateInstance('#palette'))).toBe(true)
})

test('strict palette supports shortcut, filter, disabled items, selection and focus restoration', async ({ page }) => {
  await open(page)
  await loadPalette(page)
  await page.locator('#opener').focus()
  await page.evaluate(() => {
    ;(window as any).palette = new (window as any).Palette('#palette')
    document.querySelector('#palette')!.addEventListener('selected.trm.command-palette', event => { (window as any).selected = (event as CustomEvent).detail.value })
  })
  await page.keyboard.press('Control+k')
  await expect(page.locator('.command-palette-input')).toBeFocused()
  await page.locator('.command-palette-input').fill('settings')
  await expect(page.getByRole('option', { name: 'New project' })).toBeHidden()
  await page.keyboard.press('Enter')
  await expect(page.locator('#palette')).toBeHidden()
  await expect(page.locator('#opener')).toBeFocused()
  expect(await page.evaluate(() => (window as any).selected)).toBe('settings')
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('')
})

test('cancelable hide cannot prevent disposal or leave shortcuts and scroll locks behind', async ({ page }) => {
  await open(page)
  await loadPalette(page)
  await page.evaluate(async () => {
    const palette = new (window as any).Palette('#palette')
    await palette.show()
    document.querySelector('#palette')!.addEventListener('hide.trm.command-palette', event => event.preventDefault())
    await palette.hide()
    ;(window as any).wasCanceled = !document.querySelector<HTMLElement>('#palette')!.hidden
    palette.dispose()
    palette.dispose()
    ;(window as any).disposedInstance = (window as any).Palette.getInstance('#palette')
  })
  expect(await page.evaluate(() => (window as any).wasCanceled)).toBe(true)
  expect(await page.evaluate(() => (window as any).disposedInstance)).toBeNull()
  await expect(page.locator('#palette')).toBeHidden()
  await expect(page.locator('#palette')).toHaveAttribute('aria-hidden', 'true')
  await page.keyboard.press('Control+k')
  await expect(page.locator('#palette')).toBeHidden()
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('')
})

test('strict configuration merges data attributes and explicit overrides and rejects invalid markup', async ({ page }) => {
  await open(page)
  await loadPalette(page)
  const result = await page.evaluate(async () => {
    const root = document.querySelector<HTMLElement>('#palette')!
    root.setAttribute('data-trm-close-on-select', 'false')
    const palette = new (window as any).Palette(root, { shortcut: false })
    await palette.show()
    root.querySelector<HTMLInputElement>('input')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    const stayedOpen = !root.hidden
    palette.dispose()
    const invalid = document.createElement('div')
    document.body.append(invalid)
    let rejected = false
    try { new (window as any).Palette(invalid) } catch { rejected = true }
    return { stayedOpen, rejected, leaked: (window as any).Palette.getInstance(invalid) !== null }
  })
  expect(result).toEqual({ stayedOpen: true, rejected: true, leaked: false })
})

test('React StrictMode mounts and disposes real strict Dialog instances without duplicating storage', async ({ page }) => {
  await open(page)
  const result = await page.evaluate(async ({ base, preview }) => {
    ;(window as any).IS_REACT_ACT_ENVIRONMENT = true
    const React = await import(`${preview}/vendors/react.js`)
    const { createRoot } = await import(`${preview}/vendors/react-dom.js`)
    const { useTremplin } = await import(`${base}/js/adapters/react.js`)
    const core = (window as any).strictCore
    let mounts = 0, disposes = 0, binding: any
    class TrackedDialog extends core.Dialog {
      constructor(element: HTMLElement, options: object) { super(element, options); mounts++ }
      dispose() { disposes++; super.dispose() }
    }
    function App() {
      binding = useTremplin(TrackedDialog, { keyboard: true })
      return React.createElement('dialog', { className: 'dialog', ref: binding.ref, 'aria-label': 'React dialog' }, React.createElement('div', { className: 'dialog-content' }, 'React'))
    }
    const root = createRoot(document.querySelector('#mount')!)
    await React.act(async () => root.render(React.createElement(React.StrictMode, null, React.createElement(App))))
    const element = binding.ref.current
    const identity = core.Dialog.getInstance(element) === binding.instance.current
    await binding.instance.current.show()
    const opened = element.open
    await binding.instance.current.hide()
    await React.act(async () => root.unmount())
    return { mounts, disposes, identity, opened, released: core.Dialog.getInstance(element) === null, refCleared: binding.instance.current === null }
  }, { base, preview })
  expect(result).toEqual({ mounts: 2, disposes: 2, identity: true, opened: true, released: true, refCleared: true })
})

test('Vue directive mounts and unmounts a real strict Dialog instance', async ({ page }) => {
  await open(page)
  const result = await page.evaluate(async ({ base, preview }) => {
    const { createApp, h, nextTick, withDirectives } = await import(`${preview}/vendors/vue.js`)
    const { createTremplinDirective } = await import(`${base}/js/adapters/vue.js`)
    const core = (window as any).strictCore
    let mounts = 0, disposes = 0
    class TrackedDialog extends core.Dialog {
      constructor(element: HTMLElement, options: object) { super(element, options); mounts++ }
      dispose() { disposes++; super.dispose() }
    }
    const directive = createTremplinDirective(TrackedDialog)
    const app = createApp({ render: () => withDirectives(h('dialog', { class: 'dialog', 'aria-label': 'Vue dialog' }, h('div', { class: 'dialog-content' }, 'Vue')), [[directive, { keyboard: true }]]) })
    app.mount('#mount')
    await nextTick()
    const element = document.querySelector<HTMLDialogElement>('#mount dialog')!
    const instance = core.Dialog.getInstance(element)
    await instance.show()
    const opened = element.open
    await instance.hide()
    app.unmount()
    return { mounts, disposes, opened, released: core.Dialog.getInstance(element) === null }
  }, { base, preview })
  expect(result).toEqual({ mounts: 1, disposes: 1, opened: true, released: true })
})

test('standalone optional Floating UI helper preserves geometry', async ({ page }) => {
  await open(page)
  await page.evaluate(async url => {
    const { updateFloating } = await import(url)
    await updateFloating(document.querySelector('#reference'), document.querySelector('#floating'), { placement: 'bottom', offset: 8 })
  }, `${base}/js/extensions/floating.js`)
  await expect(page.locator('#floating')).toHaveAttribute('data-placement', 'bottom')
  expect(await page.locator('#floating').evaluate(element => Math.round(element.getBoundingClientRect().top))).toBe(338)
})

for (const mode of ['light', 'dark'] as const) {
  test(`optional styles resolve strict semantic tokens in ${mode} and RTL`, async ({ page }) => {
    await open(page)
    await page.evaluate(mode => { document.documentElement.style.colorScheme = mode; document.documentElement.dir = 'rtl' }, mode)
    await loadPalette(page)
    await page.locator('#opener').click()
    const styles = await page.locator('.command-palette-dialog').evaluate(element => {
      const style = getComputedStyle(element)
      return { background: style.backgroundColor, radius: style.borderRadius, shadow: style.boxShadow, color: style.color, direction: style.direction }
    })
    expect(styles.background).not.toBe('rgba(0, 0, 0, 0)')
    expect(styles.radius).not.toBe('0px')
    expect(styles.shadow).not.toBe('none')
    expect(styles.color).not.toBe(styles.background)
    expect(styles.direction).toBe('rtl')
    expect(await page.locator('.empty-state').evaluate(element => getComputedStyle(element).borderRadius)).not.toBe('0px')
  })
}

for (const bundleFirst of [false, true]) {
  test('standard and bundled ES modules reject duplicate runtime registration (' + (bundleFirst ? 'bundle first' : 'ESM first') + ')', async ({ page }) => {
    if (bundleFirst) {
      await page.route('**/bundle-first-check/', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="en"><head><title>Bundle first</title><script type="importmap">{"imports":{"@floating-ui/dom":"/artifacts/documentation-assets/dist/vendor/floating-ui.js","vanilla-calendar-pro":"/artifacts/documentation-assets/dist/vendor/vanilla-calendar-pro.js"}}</script></head><body><button id="state" data-trm-toggle="button" aria-pressed="false">State</button></body></html>' }))
      await page.goto('/bundle-first-check/')
      await page.evaluate(async url => { await import(url) }, '/dist/js/tremplin.bundle.min.js')
      const message = await page.evaluate(async url => { try { await import(url); return '' } catch (error) { return String(error) } }, base + '/js/tremplin.js')
      expect(message).toContain('Tremplin runtime conflict')
    } else {
      await open(page)
      const message = await page.evaluate(async url => { try { await import(url); return '' } catch (error) { return String(error) } }, '/dist/js/tremplin.bundle.min.js')
      expect(message).toContain('Tremplin runtime conflict')
    }
    expect(await page.evaluate(() => Object.hasOwn(window, 'TremplinFramework'))).toBe(false)
    await page.locator('#state').click()
    await expect(page.locator('#state')).toHaveAttribute('aria-pressed', 'true')
    await page.locator('#state').click()
    await expect(page.locator('#state')).toHaveAttribute('aria-pressed', 'false')
  })
}
