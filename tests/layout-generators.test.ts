import { beforeAll, describe, expect, it } from 'vitest'
import { sass, rules, values, cssTree } from './helpers/pinned-sass'

const compile = (source: string) => {
  const actual = sass(source)
  expect(cssTree(actual)).toBe(cssTree(sass(source, true)))
  return actual
}
const generate = (columns = 4, gutter = '99rem') => compile("@use 'src/scss/config' with ($grid-row-columns: 2, $gutters: (tight: 8px)); @use 'src/scss/mixins/grid' as grid; @include grid.make-grid-columns(" + columns + ', ' + gutter + ', (base: 0, wide: 40em));')
const containerEntries = ['src/scss/tremplin', 'src/scss/layout/containers']
const containerExamples = new Map<string, { actual: string; reference: string }>()

// Compile the full framework and independent reference once during setup.
// Keep assertion timeouts unchanged; Sass is synchronous and CPU-bound.
beforeAll(() => {
  for (const entry of containerEntries) {
    const source = "@use '" + entry + "' as framework; .project { @include framework.make-container(2rem); }"
    containerExamples.set(entry, { actual: sass(source), reference: sass(source, true) })
  }
}, 30_000)

describe('Pinned Bootstrap 6 container and Flexbox generator APIs', () => {
  it('imports the dedicated grid factories without emitting CSS', () => {
    expect(compile("@use 'src/scss/mixins/grid';")).toBe('')
  })

  it.each(containerEntries)('exposes make-container from %s', entry => {
    const output = containerExamples.get(entry)!
    for (const [property, value] of Object.entries({ '--trm-gutter-x': '2rem', '--trm-gutter-y': '0', width: '100%', 'padding-inline': 'calc(var(--trm-gutter-x) * 0.5)', 'margin-inline': 'auto' })) {
      expect(values('.project', property, output.actual)).toEqual([value])
      expect(values('.project', property, output.actual)).toEqual(values('.project', property, output.reference))
    }
  })

  it('does not invent a make-container export on mixins/index', () => {
    for (const reference of [false, true]) expect(() => sass("@use 'src/scss/mixins' as framework; .project { @include framework.make-container(); }", reference)).toThrow(/Undefined mixin/)
  })

  it('allows independent container padding while retaining the default row-gutter linkage', () => {
    const output = compile("@use 'src/scss/config' with ($grid-gutter-x: 4rem, $container-padding-x: 2rem); @use 'src/scss/tremplin-grid';")
    expect(values('.container', '--trm-gutter-x', output)).toEqual(['2rem'])
    expect(values('.row', '--trm-gutter-x', output)).toEqual(['4rem'])
    const linked = compile("@use 'src/scss/config' with ($grid-gutter-x: 3rem); @use 'src/scss/layout/containers' as containers; .project { @include containers.make-container(); }")
    expect(values('.project', '--trm-gutter-x', linked)).toEqual(['3rem'])
  })

  it('generates viewport prefixes, bounded offsets, direct row children and gutter groups', () => {
    const output = generate()
    expect(output).toContain('@media (width >= 40em)')
    expect(values('.wide\\:col-2', 'width', output)).toEqual(['50%'])
    expect(rules('.wide\\:offset-0', output).length).toBeGreaterThan(0)
    expect(rules('.wide\\:offset-3', output).length).toBeGreaterThan(0)
    expect(rules('.wide\\:offset-4', output)).toEqual([])
    expect(rules('.offset-0', output)).toEqual([])
    expect(values('.wide\\:row-cols-2 > *', 'width', output)).toEqual(['50%'])
    expect(rules('.wide\\:row-cols-3 > *', output)).toEqual([])
    expect(values('.wide\\:gx-tight', '--trm-gutter-x', output)).toEqual(['8px'])
    expect(output).not.toContain('.col-wide-')
    expect(output).not.toContain('@container')
    expect(rules('.row', output)).toEqual([])
  })

  it('preserves the upstream unused gutter argument rather than inventing an effect', () => {
    expect(generate(4, '1px')).toBe(generate(4, '20rem'))
    expect(generate()).not.toContain('99rem')
  })

  it('bounds zero/one-column loops and can disable numbered row counts', () => {
    expect(generate(0)).not.toMatch(/\.wide\\:(?:col|offset)-\d/)
    expect(rules('.wide\\:offset-1', generate(1))).toEqual([])
    expect(values('.wide\\:offset-0', 'margin-inline-start', generate(1))).toEqual(['0'])
    const output = compile("@use 'src/scss/config' with ($grid-row-columns: 0); @use 'src/scss/mixins/grid' as grid; @include grid.make-grid-columns(1, $breakpoints: (base: 0));")
    expect(values('.row-cols-auto > *', 'width', output)).toEqual(['auto'])
    expect(rules('.row-cols-1 > *', output)).toEqual([])
  })

  it('allows manual factories with automatic classes disabled and custom digit keys', () => {
    const output = compile("@use 'src/scss/config' with ($enable-grid-classes: false); @use 'src/scss/mixins/grid' as grid; @include grid.make-grid-columns(3, $breakpoints: (base: 0, '2xl': 500px));")
    expect(values('.\\32 xl\\:col-3', 'width', output)).toEqual(['100%'])
    expect(output).toContain('@media (width >= 500px)')
    expect(rules('.\\32 xl\\:col-4', output)).toEqual([])
  })

  it('configures row-count and gutter output through config without infix aliases', () => {
    const output = compile("@use 'src/scss/config' with ($grid-row-columns: 2, $gutters: (tight: 8px)); @use 'src/scss/tremplin-grid';")
    expect(values('.md\\:row-cols-2 > *', 'width', output)).toEqual(['50%'])
    expect(rules('.md\\:row-cols-3 > *', output)).toEqual([])
    expect(values('.md\\:gx-tight', '--trm-gutter-x', output)).toEqual(['8px'])
    expect(rules('.gx-md-tight', output)).toEqual([])
    expect(rules('.md\\:g-3', output)).toEqual([])
    expect(values('.p-3', 'padding', output)).toEqual(['0.5rem'])
  })

  it('uses separate row/column/offset factories with upstream width and logical gutter properties', () => {
    const output = compile("@use 'src/scss/mixins/grid' as grid; .project-row { @include grid.make-row(24px, 8px); } .project-column { @include grid.make-col-ready(); @include grid.make-col(2, 4); @include grid.make-col-offset(1, 4); }")
    expect(values('.project-row', 'display', output)).toEqual(['flex'])
    expect(values('.project-row', 'margin-inline', output)).toEqual(['calc(-0.5 * var(--trm-gutter-x))'])
    expect(values('.project-column', 'width', output)).toEqual(['100%', '50%'])
    expect(values('.project-column', 'padding-inline', output)).toEqual(['calc(var(--trm-gutter-x) * 0.5)'])
    expect(values('.project-column', 'margin-inline-start', output)).toEqual(['25%'])
  })

  it('keeps the Tremplin namespace fixed rather than exposing the retired prefix option', () => {
    for (const reference of [false, true]) expect(() => sass("@use 'src/scss/tremplin' with ($prefix: 'app-');", reference)).toThrow(/not declared with !default/)
  })
})
