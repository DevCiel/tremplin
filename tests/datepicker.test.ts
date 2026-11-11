import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Datepicker from '../src/js/datepicker.js'

let picker: Datepicker | undefined
// jsdom does not implement this browser API used by Calendar Pro.
beforeEach(() => vi.stubGlobal('matchMedia', (media: string) => Object.assign(new EventTarget(), {
  media, matches: false, onchange: null, addListener() {}, removeListener() {}
})))
afterEach(() => { picker?.dispose(); picker = undefined; document.body.replaceChildren(); document.documentElement.removeAttribute('dir'); vi.unstubAllGlobals() })

function create(config: ConstructorParameters<typeof Datepicker>[1] = {}) {
  const host = document.createElement('div')
  document.body.append(host)
  picker = new Datepicker(host, { inline: true, datepickerTheme: 'light', selectedDates: ['2026-10-15'], vcpOptions: { animation: false }, ...config })
  return picker
}

describe('Strict Bootstrap 6-derived Datepicker', () => {
  it('renders Calendar Pro grid semantics and copies the selected dates', () => {
    const instance = create()
    expect(document.querySelector('[data-vc="calendar"]')?.getAttribute('role')).toBe('group')
    expect(document.querySelector('[data-vc="content"]')?.getAttribute('role')).toBe('grid')
    expect(document.querySelectorAll('[data-vc-date-btn]')).toHaveLength(35)
    const dates = instance.getSelectedDates()
    dates.push('2026-10-16')
    expect(instance.getSelectedDates()).toEqual(['2026-10-15'])
    instance.setSelectedDates(['2026-10-16'])
    expect(instance.getSelectedDates()).toEqual(['2026-10-16'])
  })

  it('disables dates outside explicit dateMin/dateMax options rather than legacy HTML attributes', () => {
    create({ dateMin: '2026-10-10', dateMax: '2026-10-20' })
    for (const date of ['2026-10-09', '2026-10-21']) {
      const cell = document.querySelector(`[data-vc-date="${date}"]`)
      expect(cell?.hasAttribute('data-vc-date-disabled')).toBe(true)
      expect(cell?.querySelector('button')?.disabled).toBe(true)
    }
    expect(document.querySelector<HTMLButtonElement>('[data-vc-date="2026-10-15"] button')?.disabled).toBe(false)
  })

  it('uses locale and vcpOptions labels with literal ARIA text in RTL documents', () => {
    document.documentElement.dir = 'rtl'
    create({ locale: 'fr', vcpOptions: { animation: false, labels: { application: 'Choisir une date', dates: '<b>Dates</b>' } } })
    expect(document.querySelector('[data-vc="calendar"]')?.getAttribute('aria-label')).toBe('Choisir une date')
    // VCP writes innerText, which jsdom does not mirror into textContent.
    expect(document.querySelector<HTMLElement>('[data-vc="month"]')?.innerText?.toLowerCase()).toBe('octobre')
    const dates = document.querySelector('[data-vc="dates"]')!
    expect(dates.getAttribute('aria-label')).toBe('<b>Dates</b>')
    expect(dates.querySelector('b')).toBeNull()
    const selected = document.querySelector<HTMLButtonElement>('[data-vc-date="2026-10-15"] button')!
    selected.focus()
    selected.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(document.activeElement).toBe(document.querySelector('[data-vc-date="2026-10-16"] button'))
  })
})
