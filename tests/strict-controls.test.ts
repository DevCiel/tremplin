import { afterEach, describe, expect, it, vi } from 'vitest'
import { Chips, OtpInput, Range, Strength, NavOverflow } from '../src/js/index.js'

const instances: Array<{ dispose(): void }> = []
const track = <T extends { dispose(): void }>(instance: T): T => { instances.push(instance); return instance }
const key = (element: Element, name: string, options = {}) => element.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...options }))
const paste = (element: Element, value: string) => {
  const event = new Event('paste', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'clipboardData', { value: { getData: () => value } })
  element.dispatchEvent(event)
  return event
}
afterEach(() => {
  for (const instance of instances.splice(0).reverse()) instance.dispose()
  document.body.replaceChildren()
  vi.unstubAllGlobals()
})

function chipHost() {
  document.body.innerHTML = '<div id="chips" class="chip-input"><span class="chip" data-trm-chip-value="Existing">Existing<button class="chip-dismiss" aria-label="Remove">×</button></span><input class="form-ghost" aria-label="Tags"></div>'
  return document.querySelector<HTMLInputElement>('.form-ghost')!
}

describe('Strict Chips', () => {
  it('uses getValues, named dismiss controls and copied value snapshots', () => {
    chipHost()
    const chips = track(new Chips('#chips'))
    const added = chips.add(' Alpha ')!
    expect(chips.getValues()).toEqual(['Existing', 'Alpha'])
    expect(added.dataset.trmChipValue).toBe('Alpha')
    expect(added.querySelector('.chip-dismiss')?.getAttribute('aria-label')).toBe('Remove')
    const values = chips.getValues()
    values.push('Not a chip')
    expect(chips.getValues()).toEqual(['Existing', 'Alpha'])
    expect(chips.remove('Alpha')).toBe(true)
    expect(chips.getValues()).toEqual(['Existing'])
  })

  it('keeps add/remove cancelable and emits change only for accepted mutations', () => {
    chipHost()
    const chips = track(new Chips('#chips'))
    const host = document.querySelector('#chips')!
    const changes = vi.fn()
    host.addEventListener('change.trm.chips', changes)
    host.addEventListener('add.trm.chips', event => event.preventDefault(), { once: true })
    expect(chips.add('Blocked')).toBeNull()
    expect(changes).not.toHaveBeenCalled()
    chips.add('Allowed')
    expect(changes).toHaveBeenCalledOnce()
    expect((changes.mock.calls[0]![0] as Event & { values: string[] }).values).toEqual(['Existing', 'Allowed'])
    host.addEventListener('remove.trm.chips', event => event.preventDefault(), { once: true })
    expect(chips.remove('Allowed')).toBe(false)
    expect(chips.getValues()).toEqual(['Existing', 'Allowed'])
    expect(chips.remove('Allowed')).toBe(true)
    expect(changes).toHaveBeenCalledTimes(2)
  })

  it('enforces limits and removes one duplicate without reordering values', () => {
    chipHost()
    const chips = track(new Chips('#chips', { allowDuplicates: true, maxChips: 4 }))
    chips.add('A'); chips.add('B')
    const later = chips.add('A')!
    expect(chips.add('Overflow')).toBeNull()
    expect(chips.remove(later)).toBe(true)
    expect(chips.getValues()).toEqual(['Existing', 'A', 'B'])
  })

  it('handles native input, paste, Enter, blur and literal chip text', () => {
    const input = chipHost()
    const chips = track(new Chips('#chips'))
    input.value = 'One,Two,remaining'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(chips.getValues()).toEqual(['Existing', 'One', 'Two'])
    expect(input.value).toBe('remaining')
    key(input, 'Enter')
    expect(input.value).toBe('')
    expect(paste(input, 'Three,Four').defaultPrevented).toBe(true)
    input.value = '<b>Literal</b>'
    input.dispatchEvent(new FocusEvent('blur'))
    expect(chips.getValues()).toEqual(['Existing', 'One', 'Two', 'remaining', 'Three', 'Four', '<b>Literal</b>'])
    expect(document.querySelector('.chip b')).toBeNull()
  })

  it('selects with Backspace before deleting, supports range selection and restores input focus', () => {
    const input = chipHost()
    const chips = track(new Chips('#chips'))
    chips.add('A'); const last = chips.add('B')!
    input.focus()
    key(input, 'Backspace')
    expect(chips.getValues()).toEqual(['Existing', 'A', 'B'])
    expect(chips.getSelectedValues()).toEqual(['B'])
    expect(document.activeElement).toBe(last)
    key(last, 'ArrowLeft', { shiftKey: true })
    expect(chips.getSelectedValues().sort()).toEqual(['A', 'B'])
    key(document.activeElement!, 'Delete')
    expect(chips.getValues()).toEqual(['Existing'])
    key(document.activeElement!, 'Escape')
    expect(document.activeElement).toBe(input)
  })

  it('detaches handlers from retained input and chip nodes on disposal', () => {
    const input = chipHost()
    const chips = new Chips('#chips')
    const chip = chips.add('A')!
    const change = vi.fn()
    document.querySelector('#chips')!.addEventListener('change.trm.chips', change)
    chips.dispose()
    input.value = 'No listener'
    key(input, 'Enter')
    chip.querySelector<HTMLButtonElement>('button')!.click()
    expect(change).not.toHaveBeenCalled()
    expect(chip.isConnected).toBe(true)
    expect(Chips.getInstance('#chips')).toBeNull()
  })
})

function otpHost() {
  document.body.innerHTML = '<div id="otp" class="otp"><input aria-label="Verification code" maxlength="3"></div>'
  return document.querySelector<HTMLInputElement>('#otp input')!
}

describe('Strict single-input OTP', () => {
  it('uses one native autofill input and aria-hidden visual slots', () => {
    const input = otpHost()
    track(new OtpInput('#otp'))
    expect(document.querySelectorAll('#otp input')).toHaveLength(1)
    expect(document.querySelectorAll('.otp-slot')).toHaveLength(3)
    expect(document.querySelector('.otp-slots')?.getAttribute('aria-hidden')).toBe('true')
    expect(input.autocomplete).toBe('one-time-code')
    expect(input.inputMode).toBe('numeric')
  })

  it('uses complete.trm.otpInput and filters/truncates programmatic values', () => {
    otpHost()
    const otp = track(new OtpInput('#otp'))
    const complete = vi.fn()
    document.querySelector('#otp')!.addEventListener('complete.trm.otpInput', complete)
    otp.setValue('1x2 34')
    expect(otp.getValue()).toBe('123')
    expect(complete).toHaveBeenCalledOnce()
    expect((complete.mock.calls[0]![0] as Event & { value: string }).value).toBe('123')
    otp.setValue('4')
    expect(otp.getValue()).toBe('4')
    otp.setValue('456')
    expect(complete).toHaveBeenCalledTimes(2)
  })

  it('pastes into the single input and keeps masking visual rather than changing its type', () => {
    const input = otpHost()
    const otp = track(new OtpInput('#otp', { mask: true, groups: [1, 2], separator: '-' }))
    expect(paste(input, '12 3').defaultPrevented).toBe(true)
    expect(otp.getValue()).toBe('123')
    expect(input.type).toBe('text')
    expect([...document.querySelectorAll('.otp-slot')].map(slot => slot.textContent)).toEqual(['•', '•', '•'])
    expect(document.querySelector('.otp-separator')?.textContent).toBe('-')
    otp.clear()
    expect(otp.getValue()).toBe('')
    expect(document.activeElement).toBe(input)
  })

  it('uses native beforeinput overwrite and respects readonly/disabled editing', () => {
    const input = otpHost()
    const otp = track(new OtpInput('#otp'))
    otp.setValue('123')
    input.setSelectionRange(1, 2)
    input.dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertText', data: '9', bubbles: true, cancelable: true }))
    expect(otp.getValue()).toBe('193')
    input.readOnly = true
    paste(input, '456')
    expect(otp.getValue()).toBe('193')
    input.readOnly = false; input.disabled = true
    paste(input, '456')
    expect(otp.getValue()).toBe('193')
  })

  it('disposes visual slots and listeners without removing the real input', () => {
    const input = otpHost()
    const otp = new OtpInput('#otp')
    otp.dispose()
    expect(document.querySelector('.otp-slots')).toBeNull()
    expect(input.isConnected).toBe(true)
    input.value = 'abc'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(input.value).toBe('abc')
    expect(OtpInput.getInstance('#otp')).toBeNull()
  })
})

describe('Strict wrapper-based Range and segmented Strength', () => {
  it('updates the wrapper fill ratio, generated bubble and changed event', () => {
    document.body.innerHTML = '<div id="range" class="form-range"><input class="form-range-input" type="range" min="20" max="80" value="50" aria-label="Volume"></div>'
    const range = track(new Range('#range', { bubble: true, formatter: value => `${value}%` }))
    const host = document.querySelector<HTMLElement>('#range')!
    const input = host.querySelector('input')!
    expect(host.style.getPropertyValue('--trm-range-fill')).toBe('0.5')
    expect(host.querySelector('.form-range-bubble .tooltip-inner')?.textContent).toBe('50%')
    expect(host.querySelector('.form-range-bubble')?.getAttribute('aria-hidden')).toBe('true')
    const changed = vi.fn()
    input.addEventListener('changed.trm.range', changed)
    input.value = '80'; input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(host.style.getPropertyValue('--trm-range-fill')).toBe('1')
    expect(host.querySelector('.tooltip-inner')?.textContent).toBe('80%')
    expect((changed.mock.calls[0]![0] as Event & { value: number }).value).toBe(80)
    input.value = '20'; range.update()
    expect(host.style.getPropertyValue('--trm-range-fill')).toBe('0')
  })

  it('creates datalist ticks and removes only generated nodes/listeners on disposal', () => {
    document.body.innerHTML = '<div id="range" class="form-range"><input class="form-range-input" type="range" value="40" list="marks"></div><datalist id="marks"><option value="0" label="Low"></option><option value="50" label="Middle"></option><option value="100" label="High"></option></datalist>'
    const range = new Range('#range', { bubble: true })
    expect(document.querySelectorAll('.form-range-tick')).toHaveLength(3)
    expect(document.querySelector('.form-range-ticks')?.getAttribute('aria-hidden')).toBe('true')
    const host = document.querySelector<HTMLElement>('#range')!
    const input = host.querySelector('input')!
    const before = host.style.getPropertyValue('--trm-range-fill')
    range.dispose()
    input.value = '90'; input.dispatchEvent(new Event('input'))
    expect(host.style.getPropertyValue('--trm-range-fill')).toBe(before)
    expect(document.querySelector('.form-range-bubble, .form-range-ticks')).toBeNull()
    expect(document.querySelector('#marks')).not.toBeNull()
  })

  it('uses segmented strength, a text message and redacted strengthChange events', () => {
    document.body.innerHTML = '<input id="password" type="password" value="LongExample123!!"><div id="strength" class="strength"><span class="strength-segment"></span><span class="strength-segment"></span><span class="strength-segment"></span><span class="strength-segment"></span></div><span class="strength-text"></span>'
    const strength = track(new Strength('#strength', { input: '#password' }))
    expect(strength.getStrength()).toBe('strong')
    expect(document.querySelectorAll('.strength-segment.active')).toHaveLength(4)
    expect(document.querySelector('.strength-text')?.textContent).toBe('Strong')
    const changed = vi.fn()
    document.querySelector('#strength')!.addEventListener('strengthChange.trm.strength', changed)
    const input = document.querySelector<HTMLInputElement>('#password')!
    input.value = 'a'; input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(strength.getStrength()).toBe('weak')
    expect((changed.mock.calls[0]![0] as Event & { password: string }).password).toBe('***')
    input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(strength.getStrength()).toBeNull()
    expect(document.querySelectorAll('.strength-segment.active')).toHaveLength(0)
  })
})

describe('Strict nested-nav overflow', () => {
  function create() {
    document.body.innerHTML = '<nav id="nav" class="nav-overflow"><ul class="nav"><li class="nav-item nav-overflow-keep"><a id="home" class="nav-link" href="#home">Home</a></li><li class="nav-item"><a id="one" class="nav-link" href="#one">One</a></li><li class="nav-item"><a id="two" class="nav-link" href="#two">Two</a></li></ul></nav>'
    return document.querySelector<HTMLElement>('#nav')!
  }

  it('creates a Menu toggle, keeps pinned items and strips cloned link root ids', () => {
    const host = create()
    track(new NavOverflow(host, { collapseBelow: 2000 }))
    const toggle = host.querySelector('.nav-overflow-toggle')!
    expect(toggle.getAttribute('data-trm-toggle')).toBe('menu')
    expect(toggle.getAttribute('data-trm-placement')).toBe('bottom-end')
    expect(host.querySelector('.nav-overflow-menu')?.classList.contains('menu')).toBe(true)
    expect(host.querySelectorAll('.nav-overflow-menu .menu-item')).toHaveLength(2)
    expect(host.querySelectorAll('.nav-overflow-menu .menu-item[id]')).toHaveLength(0)
    expect(host.querySelector('#home')?.parentElement?.classList.contains('d-none')).toBe(false)
  })

  it('emits upstream update/overflow names and restores originals on disposal', () => {
    const host = create()
    const overflow = vi.fn(), updated = vi.fn()
    host.addEventListener('overflow.trm.navoverflow', overflow)
    host.addEventListener('update.trm.navoverflow', updated)
    const nav = new NavOverflow(host, { collapseBelow: 2000 })
    nav.update()
    expect(updated).toHaveBeenCalledOnce()
    expect((overflow.mock.calls.at(-1)![0] as Event & { overflowCount: number }).overflowCount).toBe(2)
    const originalLinks = [...host.querySelectorAll('.nav > .nav-item > a')]
    nav.dispose()
    expect(host.querySelector('.nav-overflow-toggle, .nav-overflow-menu')).toBeNull()
    expect(host.querySelectorAll('.nav > .nav-item')).toHaveLength(3)
    expect(host.querySelectorAll('[data-trm-nav-overflow], .d-none')).toHaveLength(0)
    expect([...host.querySelectorAll('.nav > .nav-item > a')]).toEqual(originalLinks)
  })
})
