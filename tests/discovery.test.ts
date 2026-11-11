import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import * as core from '../src/js/index'
import { Combobox, Menu } from '../src/js/index'
import { CommandPalette } from '../src/js/extensions/command-palette'
import { cleanupCore } from './helpers/js-fixtures'

beforeEach(() => {
  document.body.innerHTML = ''
  document.documentElement.style.removeProperty('overflow')
})
afterEach(() => {
  for (const element of document.querySelectorAll('.command-palette')) CommandPalette.getInstance(element)?.dispose()
  cleanupCore(core)
  vi.restoreAllMocks()
})

function combobox(config: ConstructorParameters<typeof Combobox>[1] = {}) {
  document.body.innerHTML = '<div class="combobox"><button id="city" type="button" role="combobox" aria-expanded="false" aria-haspopup="listbox"><span class="combobox-value">Choose a city</span></button><div id="choices" class="menu menu-instant" role="listbox"><input class="combobox-search-input" aria-label="Search cities"><button type="button" class="menu-item" data-trm-value="par" role="option">Paris</button><button type="button" class="menu-item" data-trm-value="lon" role="option">London</button><button type="button" class="menu-item disabled" data-trm-value="lis" role="option" aria-disabled="true">Lisbon</button><button type="button" class="menu-item" data-trm-value="cafe" role="option">Café</button><div class="combobox-no-results d-none">No results</div></div></div><button id="outside">Outside</button>'
  // JSDOM does not lay out elements. Only supply item rects, honoring the real
  // filter display state; real focus/visibility behavior is tested in browsers.
  const rects = { length: 1, item: () => null, 0: {} as DOMRect } as unknown as DOMRectList
  for (const item of document.querySelectorAll<HTMLElement>('.menu-item')) {
    vi.spyOn(item, 'getClientRects').mockImplementation(() => item.style.display === 'none' ? ([] as unknown as DOMRectList) : rects)
  }
  const toggle = document.querySelector<HTMLButtonElement>('#city')!
  const log = vi.spyOn(console, 'error')
  let instance: Combobox
  try {
    instance = new Combobox(toggle, { name: 'city', search: true, ...config })
    expect(log).not.toHaveBeenCalled()
    expect(Combobox.getInstance(toggle)).toBe(instance)
    expect(Menu.getInstance(toggle)).not.toBeNull()
  } finally {
    log.mockRestore()
  }
  return {
    instance: instance!,
    toggle,
    menu: document.querySelector<HTMLElement>('#choices')!,
    search: document.querySelector<HTMLInputElement>('.combobox-search-input')!,
    option: (value: string) => document.querySelector<HTMLButtonElement>('[data-trm-value="' + value + '"]')!
  }
}
const frame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
const key = (element: HTMLElement, value: string) => element.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }))

describe('Combobox: pinned Menu-backed selection', () => {
  test('filters, focuses actual options and selects with keyboard change payloads', async () => {
    const { instance, toggle, search, option } = combobox()
    const changes: { value: unknown; item: unknown }[] = []
    toggle.addEventListener('change.trm.combobox', event => {
      const payload = event as Event & { value: unknown; item: unknown }
      changes.push({ value: payload.value, item: payload.item })
    })
    await instance.show()
    await frame()
    search.value = 'lon'
    search.dispatchEvent(new Event('input', { bubbles: true }))
    expect(option('par').style.display).toBe('none')
    expect(option('lon').style.display).toBe('')
    key(search, 'ArrowDown')
    expect(document.activeElement).toBe(option('lon'))
    expect(search.hasAttribute('aria-activedescendant')).toBe(false)
    key(option('lon'), 'Enter')
    expect(toggle.querySelector('.combobox-value')!.textContent).toBe('London')
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(option('lon').getAttribute('aria-selected')).toBe('true')
    expect(document.querySelector<HTMLInputElement>('input[name="city"]')!.value).toBe('lon')
    expect(changes).toEqual([{ value: 'lon', item: option('lon') }])
  })

  test('uses click selection, ignores disabled items and does not invent pointerdown selection', async () => {
    const { instance, toggle, option } = combobox()
    await instance.show()
    await frame()
    option('lis').click()
    expect(document.querySelector<HTMLInputElement>('input[name="city"]')!.value).toBe('')
    option('par').dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(option('par').classList.contains('selected')).toBe(false)
    option('par').click()
    expect(document.querySelector<HTMLInputElement>('input[name="city"]')!.value).toBe('par')
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
  })

  test('shows empty results, closes on outside click and removes its owned hidden input on disposal', async () => {
    const { instance, toggle, menu, search } = combobox()
    await instance.show()
    await frame()
    search.value = 'missing'
    search.dispatchEvent(new Event('input', { bubbles: true }))
    key(search, 'ArrowDown')
    expect(search.hasAttribute('aria-activedescendant')).toBe(false)
    expect(document.querySelector('.combobox-no-results')!.classList.contains('d-none')).toBe(false)
    document.querySelector('#outside')!.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(menu.classList.contains('show')).toBe(true)
    document.querySelector<HTMLButtonElement>('#outside')!.click()
    expect(menu.classList.contains('show')).toBe(false)
    expect(Combobox.getInstance(toggle)).toBe(instance)
    expect(Menu.getInstance(toggle)).not.toBeNull()
    instance.dispose()
    expect(Combobox.getInstance(toggle)).toBeNull()
    expect(Menu.getInstance(toggle)).toBeNull()
    expect(document.querySelector('input[name="city"]')).toBeNull()
  })

  test('normalizes accents only when requested and resets search on reopen', async () => {
    const { instance, search, option } = combobox({ searchNormalize: true })
    await instance.show()
    await frame()
    search.value = 'cafe'
    search.dispatchEvent(new Event('input', { bubbles: true }))
    expect(option('cafe').style.display).toBe('')
    await instance.hide()
    await instance.show()
    await frame()
    expect(search.value).toBe('')
    expect(option('par').style.display).toBe('')
  })

  test('maintains multiple selection, array event values and comma-separated form data', async () => {
    const { instance, toggle, menu, option } = combobox({ multiple: true })
    const values: unknown[] = []
    toggle.addEventListener('change.trm.combobox', event => values.push((event as Event & { value: unknown }).value))
    await instance.show()
    await frame()
    option('par').click()
    option('lon').click()
    expect(menu.classList.contains('show')).toBe(true)
    expect(toggle.querySelector('.combobox-value')!.textContent).toBe('2 selected')
    expect(document.querySelector<HTMLInputElement>('input[name="city"]')!.value).toBe('par,lon')
    expect(values).toEqual([['par'], ['par', 'lon']])
    option('par').click()
    expect(option('par').getAttribute('aria-selected')).toBe('false')
    expect(document.querySelector<HTMLInputElement>('input[name="city"]')!.value).toBe('lon')
  })

  test('honors show/hide cancellation and returns focus after menu Escape', async () => {
    const { instance, toggle, menu, option } = combobox()
    toggle.addEventListener('show.trm.combobox', event => event.preventDefault(), { once: true })
    await instance.show()
    expect(menu.classList.contains('show')).toBe(false)
    await instance.show()
    await frame()
    toggle.addEventListener('hide.trm.combobox', event => event.preventDefault(), { once: true })
    await instance.hide()
    expect(menu.classList.contains('show')).toBe(true)
    option('par').focus()
    key(option('par'), 'Escape')
    expect(menu.classList.contains('show')).toBe(false)
    expect(document.activeElement).toBe(toggle)
  })
})

describe('CommandPalette', () => {
  test('opens by shortcut, filters commands, selects, and restores focus', () => {
    document.body.innerHTML = '<button id="open">Open</button><div id="palette" class="command-palette" hidden><div class="command-palette-dialog"><input class="command-palette-input"><div class="command-palette-list"><button class="command-item" data-keywords="create">New project</button><button class="command-item" data-keywords="preferences">Settings</button></div><div class="command-palette-empty" hidden>No results</div></div></div>'
    const opener = document.querySelector<HTMLButtonElement>('#open')!
    opener.focus()
    const palette = new CommandPalette('#palette')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
    expect(document.querySelector<HTMLElement>('#palette')?.hidden).toBe(false)
    expect(document.documentElement.style.overflow).toBe('hidden')
    const input = document.querySelector<HTMLInputElement>('.command-palette-input')!
    input.value = 'settings'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(document.querySelectorAll<HTMLElement>('.command-item')[0]?.hidden).toBe(true)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(document.querySelector<HTMLElement>('#palette')?.hidden).toBe(true)
    expect(document.activeElement).toBe(opener)
    expect(document.documentElement.style.overflow).toBe('')
    palette.dispose()
  })

  test('supports cancelable selection and Escape dismissal', () => {
    document.body.innerHTML = '<div id="palette" class="command-palette" hidden><div class="command-palette-dialog"><input class="command-palette-input"><div class="command-palette-list"><button class="command-item">Protected</button></div></div></div>'
    const root = document.querySelector<HTMLElement>('#palette')!
    root.addEventListener('select.trm.command-palette', event => event.preventDefault())
    const palette = new CommandPalette(root)
    palette.show()
    document.querySelector('.command-palette-input')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(root.hidden).toBe(false)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(root.hidden).toBe(true)
  })

  test('labels groups, skips disabled commands, and exposes an empty result', async () => {
    document.body.innerHTML = '<button id="open">Open</button><div id="palette" class="command-palette" hidden><div class="command-palette-dialog"><input class="command-palette-input"><div class="command-palette-list"><section class="command-group"><h2 class="command-group-label">Projects</h2><button class="command-item" disabled>Archived project</button><button class="command-item" data-keywords="create">New project</button></section><div class="command-palette-empty" hidden>No results</div></div></div></div>'
    const root = document.querySelector<HTMLElement>('#palette')!
    const palette = new CommandPalette(root, { closeOnSelect: false })
    await palette.show()
    const group = document.querySelector<HTMLElement>('.command-group')!
    const disabled = document.querySelector<HTMLButtonElement>('.command-item:disabled')!
    const input = document.querySelector<HTMLInputElement>('.command-palette-input')!
    expect(group.getAttribute('role')).toBe('group')
    expect(group.getAttribute('aria-labelledby')).toBe(document.querySelector('.command-group-label')?.id)
    expect(disabled.getAttribute('aria-disabled')).toBe('true')
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(input.getAttribute('aria-activedescendant')).not.toBe(disabled.id)
    input.value = 'missing'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(document.querySelector<HTMLElement>('.command-palette-empty')?.hidden).toBe(false)
    expect(group.hidden).toBe(true)
    palette.dispose()
    expect(document.documentElement.style.overflow).toBe('')
  })
})
