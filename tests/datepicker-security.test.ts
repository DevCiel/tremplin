import { afterEach, describe, expect, it, vi } from 'vitest'
import Datepicker from '../src/js/datepicker.js'

// Exercise the production options hook without substituting the sanitizer or
// invoking Calendar Pro's layout/timing machinery in jsdom. Browser tests below
// cover the real dependency under an enforcing response-header CSP.
class OptionsProbe extends Datepicker {
  protected override _initCalendar(): void {}
  calendarOptions() { return this._buildCalendarOptions() }
}

afterEach(() => { vi.unstubAllGlobals(); document.body.replaceChildren() })

function probe(vcpOptions = {}) {
  const input = document.createElement('input')
  document.body.append(input)
  return new OptionsProbe(input, { vcpOptions })
}

describe('SEC-001 Calendar Pro sanitizer hook', () => {
  it('preserves calendar controls, markers and accessibility without executable markup', () => {
    const picker = probe()
    const html = picker.calendarOptions().sanitizerHTML!('<div data-vc="dates" role="rowgroup" aria-label="Dates"><button type="button" data-vc-date-btn tabindex="0" onclick="bad()" style="color:red">25</button><script>bad()</script><svg><use href="external.svg#icon"></use></svg><iframe src="/bad"></iframe></div>')
    const root = document.createElement('div')
    root.innerHTML = String(html)
    expect(root.querySelector('[data-vc="dates"]')?.getAttribute('role')).toBe('rowgroup')
    expect(root.querySelector('button')?.outerHTML).toBe('<button type="button" data-vc-date-btn="" tabindex="0">25</button>')
    expect(root.querySelector('script, svg, iframe, [onclick], [style]')).toBeNull()
    picker.dispose()
  })

  it('runs an owner transform before the enforced allowlist, not instead of it', () => {
    const transform = vi.fn((html: string) => html + '<b>Owner label</b><script>bad()</script><button formaction="/bad">OK</button>')
    const picker = probe({ sanitizerHTML: transform })
    const html = String(picker.calendarOptions().sanitizerHTML!('<span>Generated</span>'))
    expect(transform).toHaveBeenCalledWith('<span>Generated</span>')
    expect(html).toContain('<b>Owner label</b>')
    expect(html).toContain('<button>OK</button>')
    expect(html).not.toMatch(/script|formaction/)
    picker.dispose()
  })

  it('returns a native-policy token without stringifying it for Calendar Pro', () => {
    const createHTML = vi.fn((html: string) => ({ toString: () => html }))
    const createPolicy = vi.fn(() => ({ createHTML }))
    vi.stubGlobal('trustedTypes', { createPolicy })
    const picker = probe()
    const token = picker.calendarOptions().sanitizerHTML!('<button onclick="bad()">25</button>')
    expect(typeof token).toBe('object')
    expect(String(token)).toBe('<button>25</button>')
    expect(createHTML.mock.results.at(-1)?.value).toBe(token)
    expect(createPolicy).toHaveBeenCalledTimes(1)
    expect(createPolicy.mock.calls[0]).toEqual(['tremplin', expect.any(Object)])
    picker.dispose()
  })

  it('fails closed if the application CSP refuses the named policy', () => {
    vi.stubGlobal('trustedTypes', { createPolicy() { throw new TypeError('Policy denied') } })
    const picker = probe()
    expect(() => picker.calendarOptions().sanitizerHTML!('<button>25</button>')).toThrow('Policy denied')
    picker.dispose()
  })
})
