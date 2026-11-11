import { describe, expect, it } from 'vitest'
import { sass, sheet, rules, values, ancestors, cssTree } from './helpers/pinned-sass'

const css = sheet('tremplin-grid')
const compile = (source: string) => {
  const actual = sass(source)
  expect(cssTree(actual)).toBe(cssTree(sass(source, true)))
  return actual
}
const generate = (columns = 12, breakpoints = '(xs: 0, md: 48rem)') => compile("@use 'src/scss/mixins/grid' as grid; @include grid.make-cssgrid(" + columns + ', ' + breakpoints + ');')
const configured = (options: string) => compile("@use 'src/scss/config' with (" + options + "); @use 'src/scss/tremplin-grid';")

describe('Pinned Bootstrap 6 container-responsive CSS Grid', () => {
  it('matches the independent pinned focused-grid stylesheet', () => {
    expect(cssTree(css)).toBe(cssTree(sheet('tremplin-grid', true)))
  })

  it('uses upstream containment, tracks and gap without legacy fallbacks or child overrides', () => {
    expect(values('.grid', 'container-type', css)).toEqual(['inline-size'])
    expect(values('.grid', '--trm-columns', css)).toEqual(['12'])
    expect(values('.grid', '--trm-rows', css)).toEqual(['1'])
    expect(values('.grid', '--trm-gap', css)).toEqual(['1.5rem'])
    expect(values('.grid', 'grid-template-columns', css)).toEqual(['repeat(var(--trm-columns), 1fr)'])
    expect(values('.grid', 'grid-template-rows', css)).toEqual(['repeat(var(--trm-rows), 1fr)'])
    expect(values('.grid', 'gap', css)).toEqual(['var(--trm-gap)'])
    expect(rules('.grid > *', css)).toEqual([])
    expect(css).not.toContain('--trm-grid-gap')
    expect(css).not.toContain('--trm-grid-span')
  })

  it('generates every column span and starts below the normal column count', () => {
    const output = generate()
    for (let i = 1; i <= 12; i++) expect(values('.g-col-' + i, 'grid-column', output)).toEqual(['auto/span ' + i])
    for (let i = 1; i < 12; i++) expect(values('.g-start-' + i, 'grid-column-start', output)).toEqual([String(i)])
    for (const selector of ['.g-col-0', '.g-col-13', '.g-start-0', '.g-start-12']) expect(rules(selector, output)).toEqual([])
  })

  it('uses container ranges and prefix classes, not viewport or old CQ/infix classes', () => {
    const output = generate()
    for (const rule of rules('.md\\:g-col-6', output)) expect(ancestors(rule, 'container')).toEqual(['(width >= 48rem)'])
    expect(values('.md\\:g-col-6', 'grid-column', output)).toEqual(['auto/span 6'])
    expect(output).not.toContain('@media')
    expect(output).not.toContain('.g-col-md-6')
    expect(output).not.toContain('cq-span')
  })

  it('does not inject the removed Grid auto-placement reset selector', () => {
    expect(css).not.toContain('.grid > :where(')
    expect(css).not.toContain('[class*="g-col')
    expect(css).not.toContain('.span-md-6')
  })

  it('supports custom column counts and explicitly quoted digit-prefixed map keys', () => {
    const output = generate(4, "(base: 0, '2xl': 500px)")
    expect(output).toContain('@container (width >= 500px)')
    expect(values('.\\32 xl\\:g-col-4', 'grid-column', output)).toEqual(['auto/span 4'])
    expect(values('.\\32 xl\\:g-start-3', 'grid-column-start', output)).toEqual(['3'])
    expect(rules('.g-col-5', output)).toEqual([])
    expect(rules('.g-start-4', output)).toEqual([])
    expect(output).not.toContain('.md\\:')
  })

  it('preserves and documents the pinned one-column descending-start-loop limitation', () => {
    const output = generate(1)
    expect(values('.g-col-1', 'grid-column', output)).toEqual(['auto/span 1'])
    // The chosen upstream pin loops 1 through 0; do not silently patch the core.
    expect(values('.g-start-1', 'grid-column-start', output)).toEqual(['1'])
    expect(values('.g-start-0', 'grid-column-start', output)).toEqual(['0'])
    expect(generate(0)).not.toMatch(/g-(?:col|start)-/)
    expect(generate(4, '()')).toBe('')
  })

  it.each(['tremplin', 'tremplin-grid'])('emits the same Grid layout in %s', entry => {
    const output = sheet(entry)
    expect(values('.g-col-12', 'grid-column', output)).toContain('auto/span 12')
    expect(values('.md\\:g-start-4', 'grid-column-start', output)).toContain('4')
    expect(values('.grid', '--trm-columns', output)).toEqual(values('.grid', '--trm-columns', sheet(entry, true)))
  })

  it('can disable CSS Grid while preserving Flexbox', () => {
    const output = configured('$enable-cssgrid: false')
    expect(rules('.grid', output)).toEqual([])
    expect(rules('.g-col-1', output)).toEqual([])
    expect(values('.md\\:col-6', 'width', output)).toEqual(['50%'])
  })

  it('can disable Flexbox while preserving CSS Grid', () => {
    const output = configured('$enable-grid-classes: false')
    expect(values('.md\\:g-col-6', 'grid-column', output)).toEqual(['auto/span 6'])
    expect(rules('.md\\:col-6', output)).toEqual([])
  })

  it('shares configured column counts without introducing legacy token or class aliases', () => {
    const output = configured('$grid-columns: 6')
    expect(values('.grid', '--trm-columns', output)).toEqual(['6'])
    expect(values('.col-3', 'width', output)).toEqual(['50%'])
    expect(values('.g-col-6', 'grid-column', output)).toEqual(['auto/span 6'])
    expect(rules('.g-col-7', output)).toEqual([])
    expect(rules('.g-start-6', output)).toEqual([])
    expect(output).not.toContain('--trm-grid-columns')
  })
})
