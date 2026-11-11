import { beforeAll, describe, expect, it } from 'vitest'
import { rules, values } from './helpers/pinned-sass'
import { registrations } from './helpers/pinned-utilities'
import { checkedFamily, familySource, prepareFamilies } from './helpers/family-sass'

const sources = {
  base: familySource(),
  custom: familySource('', '$theme-colors: (brand: (fg: #075985))', "'underline-offset': null, 'underline-opacity': null, 'underline-thickness': (property: text-decoration-thickness, class: project-line, state: hover focus-visible, values: (heavy: 6px))"),
  removed: familySource('', '', "'underline-color': null")
}
beforeAll(() => prepareFamilies(sources), 90_000)
describe('pinned Bootstrap 6 underline families', () => {
  it('provides offset/thickness scales with hover but no default responsive or focus aliases', () => {
    const root = checkedFamily(sources.base)
    for (const [key,value] of [[1,'0.125em'],[2,'0.25em'],[3,'0.375em']] as const) expect(values('.underline-offset-' + key, 'text-underline-offset', root)).toEqual([value])
    for (let key=1;key<=5;key++) expect(values('.hover\\:underline-thickness-' + key + ':hover', 'text-decoration-thickness', root)).toEqual([key + 'px'])
    for (const selector of ['.md\\:underline-offset-2','.focus\\:underline-offset-2:focus']) expect(rules(selector, root)).toEqual([])
  })
  it('stores raw configured foreground-role expressions in an isolated composition property', () => {
    const root = checkedFamily(sources.base)
    expect(values('.underline-primary', '--trm-underline-color', root)).toEqual(['light-dark(var(--trm-blue-600), var(--trm-blue-400))'])
    expect(values('.underline-primary', 'text-decoration-color', root)).toEqual(['var(--trm-underline-color)'])
    expect(registrations(root).filter(name=>name==='--trm-underline-color')).toHaveLength(1)
    expect(rules('.underline-light', root)).toEqual([])
  })
  it('provides ten-step underline opacity with a currentcolor fallback', () => {
    const root = checkedFamily(sources.base)
    for(let key=10;key<100;key+=10) expect(values('.underline-' + key,'text-decoration-color',root)).toEqual(['color-mix(in oklch, var(--trm-underline-color, currentcolor) ' + key + '%, transparent)'])
    expect(values('.underline-100','text-decoration-color',root)).toEqual(['var(--trm-underline-color, currentcolor)'])
    expect(rules('.hover\\:underline-100:hover',root)).toHaveLength(1)
  })
  it('uses the owning theme map for custom colors and supports complete family replacement', () => {
    const root=checkedFamily(sources.custom)
    expect(values('.underline-brand','--trm-underline-color',root)).toEqual(['#075985'])
    expect(rules('.underline-offset-2',root)).toEqual([])
    expect(rules('.underline-50',root)).toEqual([])
    expect(values('.focus-visible\\:project-line-heavy:focus-visible','text-decoration-thickness',root)).toEqual(['6px'])
  })
  it('removes private registration with the color family while preserving the opacity fallback', () => {
    const root=checkedFamily(sources.removed)
    expect(registrations(root)).not.toContain('--trm-underline-color')
    expect(values('.underline-50','text-decoration-color',root)[0]).toContain('currentcolor')
  })
})
