import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import * as core from '../src/js/index'
import { cleanupCore } from './helpers/js-fixtures'
import { Drawer, Popover, Toggler, Tooltip } from '../src/js/index'

beforeEach(() => {
  document.body.innerHTML = ''
  document.documentElement.style.removeProperty('overflow')
  document.documentElement.classList.remove('dialog-open')
  vi.unstubAllGlobals()
})

afterEach(() => {
  cleanupCore(core)
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Drawer', () => {
  test('uses native dialog state and coordinates scroll locking', async () => {
    document.body.innerHTML = '<dialog id="drawer" class="drawer drawer-start drawer-instant"><div class="drawer-body"><button>Close</button></div></dialog>'
    const drawer = new Drawer('#drawer')
    await drawer.show()
    expect(document.querySelector('#drawer')?.hasAttribute('open')).toBe(true)
    expect(document.querySelector('.drawer-backdrop')).toBeNull()
    expect(document.documentElement.classList.contains('dialog-open')).toBe(true)
    await drawer.hide()
    expect(document.querySelector('#drawer')?.hasAttribute('open')).toBe(false)
    expect(document.documentElement.classList.contains('dialog-open')).toBe(false)
  })

  test('dismisses a bottom drawer after a downward swipe', async () => {
    vi.stubGlobal('PointerEvent', MouseEvent)
    const maxTouchPoints = Object.getOwnPropertyDescriptor(navigator, 'maxTouchPoints')
    Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 1 })
    document.body.innerHTML = '<dialog id="sheet" class="drawer drawer-bottom drawer-instant"></dialog>'
    const element = document.querySelector<HTMLElement>('#sheet')!
    const drawer = new Drawer(element, { backdrop: false })
    await drawer.show()
    const start = new MouseEvent('pointerdown', { bubbles: true, clientY: 100 })
    const end = new MouseEvent('pointerup', { bubbles: true, clientY: 150 })
    Object.defineProperty(start, 'pointerType', { value: 'touch' })
    Object.defineProperty(end, 'pointerType', { value: 'touch' })
    element.dispatchEvent(start)
    element.dispatchEvent(end)
    await Promise.resolve()
    expect(element.hasAttribute('open')).toBe(false)
    if (maxTouchPoints) Object.defineProperty(navigator, 'maxTouchPoints', maxTouchPoints)
    else Reflect.deleteProperty(navigator, 'maxTouchPoints')
  })

  test('uses a static native backdrop when dismissal is disabled', async () => {
    document.body.innerHTML = '<dialog id="drawer" class="drawer drawer-start drawer-instant"></dialog>'
    const element = document.querySelector<HTMLDialogElement>('#drawer')!
    const drawer = new Drawer(element, { backdrop: 'static', keyboard: false })
    const prevented = vi.fn()
    element.addEventListener('hidePrevented.trm.drawer', prevented)
    await drawer.show()
    element.dispatchEvent(new Event('cancel', { cancelable: true }))
    expect(element.open).toBe(true)
    expect(prevented).toHaveBeenCalledOnce()
  })
})

describe('Toggler: pinned class/attribute primitive', () => {
  test('acts on configured data-API targets without inventing visibility or ARIA synchronization', () => {
    document.body.innerHTML = '<button id="toggle" data-trm-toggle="toggler" data-trm-target="#nav" aria-expanded="false">Toggle</button><nav id="nav" hidden data-trm-value="show"></nav>'
    document.querySelector<HTMLButtonElement>('#toggle')!.click()
    expect(document.querySelector('#nav')!.classList.contains('show')).toBe(true)
    expect(document.querySelector('#nav')!.hasAttribute('hidden')).toBe(true)
    expect(document.querySelector('#toggle')!.getAttribute('aria-expanded')).toBe('false')
    expect(document.querySelector('#toggle')!.hasAttribute('aria-controls')).toBe(false)
    document.querySelector<HTMLButtonElement>('#toggle')!.click()
    expect(document.querySelector('#nav')!.classList.contains('show')).toBe(false)
  })

  test.each(['compact', 0, true, false, ''])('sets/removes an attribute by string comparison: %s', value => {
    document.body.innerHTML = '<div id="target"></div>'
    const element = document.querySelector('#target')!
    const toggler = new Toggler(element, { attribute: 'data-mode', value })
    toggler.toggle()
    expect(element.getAttribute('data-mode')).toBe(String(value))
    toggler.toggle()
    expect(element.hasAttribute('data-mode')).toBe(false)
  })

  test('emits cancelable toggle followed by toggled only when allowed', () => {
    document.body.innerHTML = '<div id="target"></div>'
    const element = document.querySelector('#target')!
    const toggled = vi.fn(), cancel = (event: Event) => event.preventDefault()
    const toggler = new Toggler(element, { value: 'active' })
    element.addEventListener('toggle.trm.toggler', cancel)
    element.addEventListener('toggled.trm.toggler', toggled)
    toggler.toggle()
    expect(element.classList.contains('active')).toBe(false)
    expect(toggled).not.toHaveBeenCalled()
    element.removeEventListener('toggle.trm.toggler', cancel)
    toggler.toggle()
    expect(element.classList.contains('active')).toBe(true)
    expect(toggled).toHaveBeenCalledOnce()
  })

  test('does not mutate ids and treats the default null value as a no-op', () => {
    document.body.innerHTML = '<div id="target"></div><div id="missing"></div>'
    const target = document.querySelector('#target')!
    const toggled = vi.fn()
    target.addEventListener('toggled.trm.toggler', toggled)
    new Toggler(target, { attribute: 'id', value: 'different' }).toggle()
    expect(target.id).toBe('target')
    expect(toggled).toHaveBeenCalledOnce()
    new Toggler('#missing').toggle()
    expect(document.querySelector('#missing')!.className).toBe('')
    // The runtime DefaultType accepts null even though its source comment
    // describes a required value. Preserve observed pinned runtime behavior.
  })

  test('filters disabled delegated triggers, not programmatic target mutations', () => {
    document.body.innerHTML = '<button id="native" disabled data-trm-toggle="toggler" data-trm-target="#target">Disabled</button><a id="styled" class="disabled" data-trm-toggle="toggler" data-trm-target="#target">Disabled</a><div id="target" class="disabled" data-trm-value="active"></div>'
    for (const id of ['#native', '#styled']) document.querySelector<HTMLElement>(id)!.click()
    const target = document.querySelector('#target')!
    expect(target.classList.contains('active')).toBe(false)
    new Toggler(target, { value: 'active' }).toggle()
    expect(target.classList.contains('active')).toBe(true)
  })

  test('has no show/hide methods or implicit navbar link/Escape policy', () => {
    document.body.innerHTML = '<button id="trigger">Toggle</button><nav id="target"><a id="link" href="#main">Main</a></nav>'
    const element = document.querySelector<HTMLElement>('#target')!
    const toggler = new Toggler(element, { value: 'show' })
    expect('show' in toggler).toBe(false)
    expect('hide' in toggler).toBe(false)
    expect(toggler.toggle()).toBeUndefined()
    document.querySelector<HTMLElement>('#link')!.click()
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(element.classList.contains('show')).toBe(true)
  })
})

describe('Tooltip', () => {
  test('uses sanitized content and maintains aria-describedby', async () => {
    document.body.innerHTML = '<button id="help">Help</button>'
    const tooltip = new Tooltip('#help', { title: '<img src=x onerror=alert(1)><strong>Safe</strong>', html: true })
    await tooltip.show()
    expect(document.querySelector('.tooltip strong')?.textContent).toBe('Safe')
    expect(document.querySelector('.tooltip img')?.getAttribute('src')).toBe('x')
    expect(document.querySelector('.tooltip img')?.hasAttribute('onerror')).toBe(false)
    expect(document.querySelector('#help')?.hasAttribute('aria-describedby')).toBe(true)
    await tooltip.hide()
    expect(document.querySelector('.tooltip')).toBeNull()
  })

  test('supports the Bootstrap lifecycle, enable state, and dynamic content', async () => {
    document.body.innerHTML = '<button id="help" title="Original title">Help</button>'
    const trigger = document.querySelector<HTMLElement>('#help')!
    const tooltip = new Tooltip(trigger, { trigger: 'manual' })
    const preventShow = (event: Event) => event.preventDefault()

    trigger.addEventListener('show.trm.tooltip', preventShow)
    await tooltip.show()
    expect(document.querySelector('.tooltip')).toBeNull()
    trigger.removeEventListener('show.trm.tooltip', preventShow)

    tooltip.disable()
    await tooltip.show()
    expect(document.querySelector('.tooltip')).toBeNull()

    tooltip.enable()
    tooltip.setContent({ '.tooltip-inner': 'Updated title' })
    await tooltip.show()
    expect(document.querySelector('.tooltip-inner')?.textContent).toBe('Updated title')
    await tooltip.hide()
    tooltip.dispose()
    expect(trigger.getAttribute('title')).toBe('Original title')
  })

  test('dismisses all visible peer tooltips on one Escape and removes listeners on disposal', async () => {
    document.body.innerHTML = '<button id="first">First</button><button id="second">Second</button>'
    const first = new Tooltip('#first', { title: 'First tip', trigger: 'manual', animation: false })
    const second = new Tooltip('#second', { title: 'Second tip', trigger: 'manual', animation: false })
    await first.show()
    await second.show()
    expect(document.querySelectorAll('.tooltip')).toHaveLength(2)
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    document.dispatchEvent(event)
    await vi.waitFor(() => expect(document.querySelectorAll('.tooltip')).toHaveLength(0))
    expect(event.defaultPrevented).toBe(true)
    // stopPropagation does not stop other handlers on the same document.
    // The pin has no topmost-only floating overlay manager.
    first.dispose()
    second.dispose()
    const afterDispose = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    document.dispatchEvent(afterDispose)
    expect(afterDispose.defaultPrevented).toBe(false)
  })

})

describe('Popover', () => {
  test('removes unsafe URLs and closes on Escape', async () => {
    document.body.innerHTML = '<button id="info">Info</button>'
    const popover = new Popover('#info', { content: '<a href="javascript:alert(1)">Details</a>', html: true })
    await popover.show()
    expect(document.querySelector('.popover a')?.hasAttribute('href')).toBe(false)
    expect(document.querySelector('#info')?.hasAttribute('aria-describedby')).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await vi.waitFor(() => expect(document.querySelector('.popover')).toBeNull())
    expect(document.querySelector('#info')?.hasAttribute('aria-describedby')).toBe(false)
  })
})
