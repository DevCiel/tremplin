import { describe, expect, it } from 'vitest'
import reference from './bootstrap6-spacing-reference.json'
import { sass, sheet, ast, rules, values, cssTree, sassPin } from './helpers/pinned-sass'

const entries = ['tremplin', 'tremplin-grid', 'tremplin-utilities']
const styles = Object.fromEntries(entries.map(entry => [entry, ast(sheet(entry))]))
const paired = (source: string) => {
  const actual = sass(source)
  expect(cssTree(actual)).toBe(cssTree(sass(source, true)))
  return actual
}
const grid = (options: string) => paired("@use 'src/scss/config' with (" + options + "); @use 'src/scss/tremplin-grid';")

describe('Pinned Bootstrap 6 spacing and gutter defaults', () => {
  it('binds every positive and independent negative scale entry to the active pin', () => {
    expect(reference.upstreamCommit).toBe(sassPin.commit)
    const output = paired("@use 'src/scss/config' as cfg; .scales { @each $key, $value in cfg.$spacers { --space-#{$key}: #{$value}; } @each $key, $value in cfg.$negative-spacers { --negative#{$key}: #{$value}; } gutter-x: cfg.$grid-gutter-x; gutter-y: cfg.$grid-gutter-y; }")
    for (const [key, value] of Object.entries(reference.spacers)) expect(output).toContain('--space-' + key + ': ' + value + ';')
    for (const [key, value] of Object.entries(reference.negativeSpacers)) expect(output).toContain('--negative' + key + ': ' + value + ';')
    expect(output).toContain('gutter-x: 1.5rem')
    expect(output).toContain('gutter-y: 0')
  })

  for (const entry of entries) {
    it(entry + ' emits the complete positive scale and only canonical responsive prefixes', () => {
      const root = styles[entry]!
      const expected = ast(sheet(entry, true))
      for (const [key, value] of Object.entries(reference.spacers)) {
        for (const [selector, property] of [['.p-' + key, 'padding'], ['.m-' + key, 'margin'], ['.gap-' + key, 'gap'], ['.row-gap-' + key, 'row-gap'], ['.column-gap-' + key, 'column-gap']] as const) {
          expect(values(selector, property, root), selector).toEqual([value])
          expect(values(selector, property, root)).toEqual(values(selector, property, expected))
        }
      }
      for (const selector of ['.md\\:p-3', '.\\32 xl\\:p-3']) expect(values(selector, 'padding', root)).toEqual(['0.5rem'])
      for (const selector of ['.p-md-3', '.xxl\\:p-3', '.p-xxl-3']) expect(rules(selector, root)).toEqual([])
      const child = ':where(.space-x-3 > :not(:last-child))'
      expect(values('.space-x-3 > :not(:last-child)', 'margin-inline-end', root)).toEqual([])
      expect(values(child, 'margin-inline-end', root)).toEqual(entry === 'tremplin-grid' ? [] : ['0.5rem'])
      for (const rule of rules('.p-3', root)) rule.walkDecls('padding', declaration => { expect(Boolean(declaration.important)).toBe(false) })
    })

    it(entry + ' uses the pinned negative start/end values without reviving retired generic negatives', () => {
      const root = styles[entry]!
      for (const [key, value] of Object.entries(reference.negativeSpacers)) {
        for (const [abbr, property] of [['s', 'margin-inline-start'], ['e', 'margin-inline-end']] as const) {
          expect(values('.m' + abbr + '-' + key, property, root)).toEqual([value])
          expect(values('.md\\:m' + abbr + '-' + key, property, root)).toEqual([value])
          expect(values('.\\32 xl\\:m' + abbr + '-' + key, property, root)).toEqual([value])
        }
      }
      for (const selector of ['.m--2', '.mx--2', '.my--2', '.mt--2', '.mb--2', '.m-n2', '.p--2', '.ms-md--2']) expect(rules(selector, root), selector).toEqual([])
    })
  }

  it('shares positive gutters while keeping the Grid default literal and independently configurable', () => {
    for (const entry of ['tremplin', 'tremplin-grid']) {
      const root = styles[entry]!
      expect(values('.row', '--trm-gutter-x', root)).toEqual([reference.gridGutterX])
      expect(values('.row', '--trm-gutter-y', root)).toEqual([reference.gridGutterY])
      expect(values('.grid', '--trm-gap', root)).toEqual([reference.gridGap])
      expect(values('.container', '--trm-gutter-x', root)).toEqual(['1.5rem'])
      for (const [key, value] of Object.entries(reference.spacers)) expect(values('.g-' + key, '--trm-gutter-x', root)).toEqual([value])
    }
  })

  it('emits canonical spacer runtime tokens and keeps negative values independent of positive overrides', () => {
    for (const [key, value] of Object.entries(reference.spacers)) expect(values(':root', '--trm-spacer-' + key, styles.tremplin!)).toContain(value)
    expect(values(':root', '--trm-space-3', styles.tremplin!)).toEqual([])
    const output = grid('$spacers: (2: 2rem, 3: 1rem, 4: 1.5rem)')
    expect(values('.p-3', 'padding', output)).toEqual(['1rem'])
    expect(values('.ms--2', 'margin-inline-start', output)).toEqual(['-0.5rem'])
    expect(values('.g-4', '--trm-gutter-x', output)).toEqual(['1.5rem'])
    expect(values('.row', '--trm-gutter-x', output)).toEqual(['1.5rem'])
    expect(values('.grid', '--trm-gap', output)).toEqual(['1.5rem'])
  })

  it('scales both independent maps with spacer without scaling the base gutter', () => {
    const output = grid('$spacer: 2rem')
    expect(values('.p-3', 'padding', output)).toEqual(['1rem'])
    expect(values('.ms--2', 'margin-inline-start', output)).toEqual(['-1rem'])
    expect(values('.g-7', '--trm-gutter-x', output)).toEqual(['3rem'])
    expect(values('.row', '--trm-gutter-x', output)).toEqual(['1.5rem'])
    expect(values('.grid', '--trm-gap', output)).toEqual(['1.5rem'])
  })

  it('supports null removals, negative overrides and independent gutter/container maps', () => {
    const output = grid("$spacers: (3: null, compact: 7px), $negative-spacers: ('-1': null, '-2': -3px, '-tight': -7px), $gutters: (tight: 11px), $grid-gutter-x: 32px, $container-padding-x: 16px")
    expect(rules('.p-3', output)).toEqual([])
    expect(values('.p-compact', 'padding', output)).toEqual(['7px'])
    expect(rules('.ms--1', output)).toEqual([])
    expect(values('.ms--2', 'margin-inline-start', output)).toEqual(['-3px'])
    expect(values('.me--tight', 'margin-inline-end', output)).toEqual(['-7px'])
    expect(values('.g-tight', '--trm-gutter-x', output)).toEqual(['11px'])
    expect(rules('.g-3', output)).toEqual([])
    expect(values('.container', '--trm-gutter-x', output)).toEqual(['16px'])
    expect(values('.grid', '--trm-gap', output)).toEqual(['32px'])
  })

  it('sets importance per utility family rather than exposing the retired global switch', () => {
    const output = paired("@use 'src/scss/config' as cfg; @use 'src/scss/tremplin-grid' with ($utilities: ('padding': (property: padding, class: p, values: cfg.$spacers, important: true)));")
    expect(values('.p-3', 'padding', output)).toEqual(['0.5rem'])
    for (const rule of rules('.p-3', output)) rule.walkDecls('padding', declaration => { expect(Boolean(declaration.important)).toBe(true) })
    for (const rule of rules('.m-3', output)) rule.walkDecls('margin', declaration => { expect(Boolean(declaration.important)).toBe(false) })
    for (const ref of [false, true]) expect(() => sass("@use 'src/scss/tremplin' with ($enable-important-utilities: false);", ref)).toThrow(/not declared with !default/)
  })
})
