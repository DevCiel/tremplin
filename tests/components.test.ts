import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import * as core from '../src/js/index'
import { cleanupCore } from './helpers/js-fixtures'
import { Alert, Button, Collapse, Dialog, Tab, Toast } from '../src/js/index'

beforeEach(() => {
  document.body.innerHTML = ''
  document.documentElement.style.removeProperty('overflow')
  document.documentElement.classList.remove('dialog-open')
  vi.useRealTimers()
})

afterEach(() => {
  cleanupCore(core)
  if (vi.isFakeTimers()) vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('component instance contract', () => {
  test('returns one instance and disposes it', () => {
    document.body.innerHTML = '<div id="panel"></div>'
    const first = Collapse.getOrCreateInstance('#panel')
    expect(Collapse.getOrCreateInstance('#panel')).toBe(first)
    first.dispose()
    expect(Collapse.getInstance('#panel')).toBeNull()
  })
})

describe('Collapse', () => {
  test('toggles state and aria-expanded', () => {
    document.body.innerHTML = '<a href="#panel" data-trm-toggle="collapse" aria-expanded="false"></a><div id="panel" class="collapse"></div>'
    const collapse = new Collapse('#panel')
    collapse.show()
    expect(document.querySelector('#panel')?.classList.contains('show')).toBe(true)
    expect(document.querySelector('a')?.getAttribute('aria-expanded')).toBe('true')
    collapse.hide()
    expect(document.querySelector('#panel')?.classList.contains('show')).toBe(false)
  })

  test('supports accordion parents', () => {
    document.body.innerHTML = '<div id="accordion"><div id="one" class="collapse show"></div><div id="two" class="collapse" data-trm-parent="#accordion"></div></div>'
    new Collapse('#two').show()
    expect(document.querySelector('#one')?.classList.contains('show')).toBe(false)
    expect(document.querySelector('#two')?.classList.contains('show')).toBe(true)
  })

  test('keeps collapses controlled by one shared trigger open together', async () => {
    document.body.innerHTML = '<div id="accordion"><button data-trm-toggle="collapse" data-trm-target="#one, #two" aria-expanded="false"></button><div id="one" class="collapse" data-trm-parent="#accordion"></div><div id="two" class="collapse" data-trm-parent="#accordion"></div></div>'
    const first = new Collapse('#one')
    const second = new Collapse('#two')
    await first.show()
    await second.show()
    expect(document.querySelector('#one')?.classList.contains('show')).toBe(true)
    expect(document.querySelector('#two')?.classList.contains('show')).toBe(true)
  })

  test('honors cancelable lifecycle events', async () => {
    document.body.innerHTML = '<div id="panel" class="collapse"></div>'
    const panel = document.querySelector<HTMLElement>('#panel')!
    panel.addEventListener('show.trm.collapse', event => event.preventDefault())
    await new Collapse(panel).show()
    expect(panel.classList.contains('show')).toBe(false)
  })
})

describe('Button', () => {
  test('toggles active state and aria-pressed through the data API', () => {
    document.body.innerHTML = '<button id="button" data-trm-toggle="button" aria-pressed="false"></button>'
    const button = document.querySelector<HTMLButtonElement>('#button')!
    button.click()
    expect(button.classList.contains('active')).toBe(true)
    expect(button.getAttribute('aria-pressed')).toBe('true')
    button.click()
    expect(button.classList.contains('active')).toBe(false)
  })

  test('synchronizes aria-pressed with programmatic state changes', () => {
    document.body.innerHTML = '<button id="button" class="active"></button>'
    const button = document.querySelector<HTMLButtonElement>('#button')!
    new Button(button).toggle()
    expect(button.classList.contains('active')).toBe(false)
    expect(button.getAttribute('aria-pressed')).toBe('false')
  })
})

describe('Dialog', () => {
  test('uses the native open state and root scroll lock', async () => {
    document.body.innerHTML = '<dialog id="dialog" class="dialog dialog-instant"><button>Close</button></dialog>'
    const dialog = new Dialog('#dialog')
    await dialog.show()
    expect(document.querySelector('#dialog')?.hasAttribute('open')).toBe(true)
    expect(document.documentElement.classList.contains('dialog-open')).toBe(true)
    await dialog.hide()
    expect(document.querySelector('#dialog')?.hasAttribute('open')).toBe(false)
    expect(document.documentElement.classList.contains('dialog-open')).toBe(false)
  })

  test('supports non-modal mode and cancelable lifecycle events', async () => {
    document.body.innerHTML = '<dialog id="dialog" class="dialog dialog-instant"></dialog>'
    const element = document.querySelector<HTMLDialogElement>('#dialog')!
    const dialog = new Dialog(element, { modal: false })
    await dialog.show()
    expect(element.classList.contains('dialog-nonmodal')).toBe(true)
    expect(document.documentElement.classList.contains('dialog-open')).toBe(false)
    element.addEventListener('hide.trm.dialog', event => event.preventDefault(), { once: true })
    await dialog.hide()
    expect(element.open).toBe(true)
    await dialog.hide()
    expect(element.classList.contains('dialog-nonmodal')).toBe(false)
  })

  test('routes a native cancel event to its owning dialog; native stack routing is tested in browsers', async () => {
    document.body.innerHTML = '<dialog id="outer" class="dialog dialog-instant"><button>Outer</button></dialog><dialog id="inner" class="dialog dialog-instant"><button>Inner</button></dialog>'
    const outer = new Dialog('#outer'), inner = new Dialog('#inner')
    await outer.show()
    await inner.show()
    const cancel = new Event('cancel', { cancelable: true })
    document.querySelector('#inner')!.dispatchEvent(cancel)
    await Promise.resolve()
    expect(cancel.defaultPrevented).toBe(true)
    expect(document.querySelector<HTMLDialogElement>('#inner')!.open).toBe(false)
    expect(document.querySelector<HTMLDialogElement>('#outer')!.open).toBe(true)
    // JSDOM's dialog stub has no :modal state or native focus restoration.
    // Do not manufacture those semantics in this unit fixture.
    await outer.hide()
    inner.dispose()
    outer.dispose()
  })

})

describe('Tab', () => {
  test('switches the selected trigger and panel', async () => {
    document.body.innerHTML = '<div class="nav"><button id="one" class="nav-link active" data-trm-toggle="tab" data-trm-target="#p1">One</button><button id="two" class="nav-link" data-trm-toggle="tab" data-trm-target="#p2">Two</button></div><div class="tab-content"><section id="p1" class="tab-pane active show"></section><section id="p2" class="tab-pane"></section></div>'
    await new Tab('#two').show()
    expect(document.querySelector('#two')?.getAttribute('aria-selected')).toBe('true')
    expect(document.querySelector('#p2')?.classList.contains('active')).toBe(true)
    expect(document.querySelector('#p2')?.classList.contains('show')).toBe(true)
    expect(document.querySelector('#p1')?.classList.contains('active')).toBe(false)
    expect(document.querySelector('#p1')?.classList.contains('show')).toBe(false)
  })

  test('emits related hide and hidden lifecycle events', async () => {
    document.body.innerHTML = '<div class="nav"><button id="one" class="active" data-trm-toggle="tab" data-trm-target="#p1">One</button><button id="two" data-trm-toggle="tab" data-trm-target="#p2">Two</button></div><div class="tab-content"><section id="p1" class="tab-pane active show"></section><section id="p2" class="tab-pane"></section></div>'
    const active = document.querySelector<HTMLElement>('#one')!
    const hidden = vi.fn()
    active.addEventListener('hidden.trm.tab', hidden)
    await new Tab('#two').show()
    expect(hidden).toHaveBeenCalledOnce()
    expect(active.getAttribute('tabindex')).toBe('-1')
    expect(document.querySelector('#two')?.getAttribute('tabindex')).toBeNull()
  })

  test('initializes Bootstrap-style tablist and panel accessibility attributes', () => {
    document.body.innerHTML = '<div class="nav"><button id="one" class="active" data-trm-toggle="tab" data-trm-target="#p1">One</button><button id="two" data-trm-toggle="tab" data-trm-target="#p2">Two</button></div><div class="tab-content"><section id="p1" class="tab-pane active show"></section><section id="p2" class="tab-pane"></section></div>'
    new Tab('#one')
    const tablist = document.querySelector('.nav')!
    const inactive = document.querySelector('#two')!
    const panel = document.querySelector('#p1')!
    expect(tablist.getAttribute('role')).toBe('tablist')
    expect(inactive.getAttribute('role')).toBe('tab')
    expect(inactive.getAttribute('tabindex')).toBe('-1')
    expect(panel.getAttribute('role')).toBe('tabpanel')
    expect(panel.getAttribute('aria-labelledby')).toBe('one')
  })

  test('uses Home, End, and arrow keys while skipping disabled tabs', async () => {
    document.body.innerHTML = '<div class="nav"><button id="one" class="active" data-trm-toggle="tab" data-trm-target="#p1">One</button><button id="two" disabled data-trm-toggle="tab" data-trm-target="#p2">Two</button><button id="three" data-trm-toggle="tab" data-trm-target="#p3">Three</button></div><div class="tab-content"><section id="p1" class="tab-pane active show"></section><section id="p2" class="tab-pane"></section><section id="p3" class="tab-pane"></section></div>'
    new Tab('#one')
    const one = document.querySelector<HTMLElement>('#one')!
    one.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await Promise.resolve()
    const three = document.querySelector<HTMLElement>('#three')!
    expect(document.activeElement).toBe(three)
    expect(three.classList.contains('active')).toBe(true)
    three.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
    await Promise.resolve()
    expect(document.activeElement).toBe(one)
  })

  test('does not intercept modified arrow-key shortcuts', () => {
    document.body.innerHTML = '<div class="nav"><button id="one" class="active" data-trm-toggle="tab">One</button><button id="two" data-trm-toggle="tab">Two</button></div>'
    new Tab('#one')
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true, cancelable: true })
    document.querySelector('#one')?.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(document.querySelector('#two')?.classList.contains('active')).toBe(false)
  })
})

describe('Toast', () => {
  test('autohides after the configured delay', async () => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="toast" class="toast toast-instant"></div>'
    const toast = new Toast('#toast', { delay: 100 })
    await toast.show()
    expect(document.querySelector('#toast')?.classList.contains('show')).toBe(true)
    vi.advanceTimersByTime(101)
    expect(document.querySelector('#toast')?.classList.contains('show')).toBe(false)
  })

  test('pauses autohide while the pointer is inside', async () => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="toast" class="toast toast-instant"></div>'
    const element = document.querySelector<HTMLElement>('#toast')!
    const toast = new Toast(element, { delay: 100 })
    await toast.show()
    element.dispatchEvent(new MouseEvent('mouseover'))
    vi.advanceTimersByTime(150)
    expect(element.classList.contains('show')).toBe(true)
    element.dispatchEvent(new MouseEvent('mouseout'))
    vi.advanceTimersByTime(101)
    expect(element.classList.contains('show')).toBe(false)
  })

  test('tracks keyboard interaction and supports cancelable hide events', async () => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="toast" class="toast toast-instant"><button id="inside">Action</button></div><button id="outside">Outside</button>'
    const element = document.querySelector<HTMLElement>('#toast')!
    const toast = new Toast(element, { delay: 100 })
    await toast.show()
    document.querySelector<HTMLElement>('#inside')!.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    vi.advanceTimersByTime(150)
    expect(toast.isShown()).toBe(true)
    element.addEventListener('hide.trm.toast', event => event.preventDefault(), { once: true })
    await toast.hide()
    expect(toast.isShown()).toBe(true)
    document.querySelector<HTMLElement>('#inside')!.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.querySelector('#outside') }))
    vi.advanceTimersByTime(101)
    expect(toast.isShown()).toBe(false)
  })

  test('settles animated show before starting the delay and hidden after the exit transition', async () => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="toast" class="toast" style="transition-duration:.02s;transition-delay:0s"></div>'
    const element = document.querySelector<HTMLElement>('#toast')!
    const shown = vi.fn(), hidden = vi.fn()
    element.addEventListener('shown.trm.toast', shown)
    element.addEventListener('hidden.trm.toast', hidden)
    const toast = new Toast(element, { delay: 100 })
    const opening = toast.show()
    expect(opening).toBeInstanceOf(Promise)
    await vi.advanceTimersByTimeAsync(24)
    expect(shown).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    await opening
    expect(shown).toHaveBeenCalledOnce()
    await vi.advanceTimersByTimeAsync(99)
    expect(toast.isShown()).toBe(true)
    await vi.advanceTimersByTimeAsync(1)
    expect(toast.isShown()).toBe(false)
    expect(hidden).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(25)
    expect(hidden).toHaveBeenCalledOnce()
  })

  test('keeps autohide disabled and clears a scheduled delay on disposal', async () => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="toast" class="toast toast-instant"></div>'
    const toast = new Toast('#toast', { autohide: false, delay: 100 })
    await toast.show()
    await vi.advanceTimersByTimeAsync(1000)
    expect(toast.isShown()).toBe(true)
    toast.dispose()
    expect(Toast.getInstance('#toast')).toBeNull()
    const timed = new Toast('#toast', { delay: 100 })
    await timed.show()
    timed.dispose()
    expect(vi.getTimerCount()).toBe(0)
    expect(document.querySelector('#toast')!.classList.contains('show')).toBe(false)
  })

  test('settles a disposed transition without emitting a late shown event', async () => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="toast" class="toast" style="transition-duration:.02s;transition-delay:0s"></div>'
    const element = document.querySelector('#toast')!
    const shown = vi.fn()
    element.addEventListener('shown.trm.toast', shown)
    const toast = new Toast(element)
    const opening = toast.show()
    toast.dispose()
    await vi.advanceTimersByTimeAsync(25)
    await opening
    expect(shown).not.toHaveBeenCalled()
    expect(Toast.getInstance(element)).toBeNull()
  })

})

describe('Alert', () => {
  test('supports a cancelable close event', async () => {
    document.body.innerHTML = '<div id="alert" class="alert"></div>'
    const element = document.querySelector('#alert')!
    element.addEventListener('close.trm.alert', event => event.preventDefault())
    await new Alert(element).close()
    expect(document.body.contains(element)).toBe(true)
  })

  test('uses the hiding state and emits closed after removal', async () => {
    document.body.innerHTML = '<div id="alert" class="alert alert-instant show"></div>'
    const element = document.querySelector<HTMLElement>('#alert')!
    const closed = vi.fn()
    element.addEventListener('closed.trm.alert', closed)
    await new Alert(element).close()
    expect(element.classList.contains('show')).toBe(false)
    expect(element.classList.contains('hiding')).toBe(true)
    expect(document.body.contains(element)).toBe(false)
    expect(closed).toHaveBeenCalledOnce()
  })
})
