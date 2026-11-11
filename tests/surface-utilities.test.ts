import { beforeAll, describe, expect, it } from 'vitest'
import { rules, values } from './helpers/pinned-sass'
import { registrations } from './helpers/pinned-utilities'
import { checkedFamily, familySource, prepareFamilies } from './helpers/family-sass'

const sources = {
  base: familySource(),
  custom: familySource('$border-width: 2px, $border-style: dashed, $border-widths: (3: 6px), $radii: (9: 3rem), $shadows: (null: 0 0 5px red, sm: null)', '', "'border-color': null, 'border-color-subtle': null"),
  switches: familySource('$enable-shadows: false')
}
beforeAll(() => prepareFamilies(sources), 90_000)
describe('pinned Bootstrap 6 border, radius and shadow composition', () => {
  it('emits logical border axes, width controls and zero removals with normal importance', () => {
    const root = checkedFamily(sources.base)
    expect(values('.border', 'border', root)).toEqual(['var(--trm-border-width) var(--trm-border-style) var(--trm-border-color)'])
    for (const [name, property] of [['top', 'border-block-start'], ['bottom', 'border-block-end'], ['start', 'border-inline-start'], ['end', 'border-inline-end'], ['x', 'border-inline'], ['y', 'border-block']] as const) {
      expect(values('.border-' + name + '-0', property, root)).toEqual(['0'])
    }
    for (let key = 1; key <= 5; key++) expect(values('.border-' + key, 'border-width', root)).toEqual([key + 'px'])
    expect(values('.border-keyline', 'border-width', root)).toEqual(['var(--trm-border-width-keyline)'])
  })
  it('uses semantic background roles for border color and isolated private composition', () => {
    const root = checkedFamily(sources.base)
    expect(values('.border-primary', '--trm-bc', root)).toEqual(['var(--trm-primary-bg)'])
    expect(values('.border-100', 'border-color', root)).toEqual(['var(--trm-bc)'])
    expect(registrations(root).filter(name => name === '--trm-bc')).toHaveLength(1)
    expect(registrations(root)).not.toContain('--trm-border-color')
  })
  it('uses numeric radius values directly, with logical directional controls and no old size aliases', () => {
    const root = checkedFamily(sources.base)
    for (const [key, value] of Object.entries({0:'0',1:'0.125rem',2:'0.1875rem',3:'0.25rem',4:'0.375rem',5:'0.5rem',6:'0.625rem',7:'0.75rem',8:'0.875rem',9:'1rem'})) expect(values('.rounded-' + key, '--trm-rounded-size', root)).toEqual([value])
    expect(values('.rounded', '--trm-rounded-size', root)).toEqual(['0.5rem'])
    expect(values('.rounded-start', 'border-start-start-radius', root)).toEqual(['var(--trm-rounded-size, var(--trm-radius-5))'])
    expect(values('.rounded-start', 'border-end-start-radius', root)).toHaveLength(1)
    for (const name of ['sm','base','lg','xl','xxl']) expect(rules('.rounded-' + name, root)).toEqual([])
    expect(registrations(root).filter(name => name === '--trm-rounded-size')).toHaveLength(1)
  })
  it('uses literal relative-color shadows with isolated color and midpoint opacity controls', () => {
    const root = checkedFamily(sources.base)
    expect(values('.shadow', 'box-shadow', root)[0]).toContain('oklch(from var(--trm-sc, var(--trm-shadow-color))')
    expect(values('.shadow', 'box-shadow', root)[0]).toContain('var(--trm-so, 1)')
    expect(values('.shadow-none', 'box-shadow', root)).toEqual(['none'])
    expect(values('.shadow-primary', '--trm-sc', root)).toEqual(['var(--trm-primary-base)'])
    expect(values('.shadow-opacity-50', '--trm-so', root)).toEqual(['1'])
    expect(values('.shadow-opacity-100', '--trm-so', root)).toEqual(['2'])
    for (const token of ['--trm-sc','--trm-so']) expect(registrations(root).filter(name => name === token)).toHaveLength(1)
    expect(rules('.shadow-base', root)).toEqual([])
  })
  it('keeps current root shadow tokens and theme strength without old runtime aliases', () => {
    const root = checkedFamily(sources.base)
    expect(values(':root', '--trm-box-shadow', root).length).toBeGreaterThan(0)
    expect(values('[data-trm-theme=dark]', '--trm-shadow-strength', root)).toEqual(['2.4'])
    expect(values('[data-trm-theme=light]', '--trm-shadow-strength', root)).toEqual(['1'])
    expect(values(':root', '--trm-shadow', root)).toEqual([])
  })
  it('configures scales through config, replaces shadow maps and removes selected color families', () => {
    const root = checkedFamily(sources.custom)
    expect(values(':root', '--trm-border-width', root)).toContain('2px')
    expect(values('.border-3', 'border-width', root)).toEqual(['6px'])
    expect(values('.rounded-9', '--trm-rounded-size', root)).toEqual(['3rem'])
    expect(values('.shadow', 'box-shadow', root)).toEqual(['0 0 5px red'])
    expect(rules('.shadow-sm', root)).toEqual([])
    expect(rules('.border-primary', root)).toEqual([])
    expect(registrations(root)).not.toContain('--trm-bc')
  })
  it('preserves literal shadow utilities when the component shadow mixin switch is disabled', () => {
    expect(values('.shadow', 'box-shadow', checkedFamily(sources.switches))).toHaveLength(1)
  })
})
