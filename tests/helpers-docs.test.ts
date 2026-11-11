import { beforeAll, describe, expect, it } from 'vitest'
import { helpersGuides } from '../site/src/data/helpers-guides'
import { helpersRawExamples } from '../site/src/data/helpers-examples'
import original from './fixtures/mdx-migration/helpers.before.json' with { type: 'json' }
import { ast, cssTree, rules, sass, sheet, topology, values } from './helpers/pinned-sass'

const helpers = ['focus-ring', 'hover-lift', 'icon-link', 'position', 'stacks', 'theme-colors', 'stretched-link', 'text-truncation', 'visually-hidden', 'vr']
const documented = ['focus-ring', 'hover-lift', 'icon-link', 'position', 'stacks', 'stretched-link', 'text-truncation', 'vertical-rule', 'visually-hidden']
beforeAll(() => { sheet('tremplin') }, 90_000)

describe('pinned Bootstrap 6 helper sources and documentation', () => {
  it('covers all nine upstream documentation topics in order', () => {
    expect(helpersGuides.map(guide => guide.slug)).toEqual(documented.map(name => 'helpers/' + name))
  })
  for (const helper of helpers) {
    it(helper + ' matches the independently verified upstream Sass module', () => {
      expect(cssTree(sheet('helpers/' + helper))).toBe(cssTree(sheet('helpers/' + helper, true)))
    })
  }
  it('matches the helper index including theme color generation without emitting layout or components', () => {
    const output = sheet('helpers')
    expect(cssTree(output)).toBe(cssTree(sheet('helpers', true)))
    expect(rules('.theme-primary', output).length).toBeGreaterThan(0)
    for (const selector of ['.row', '.grid', '.btn', '.stack', '.cluster']) expect(rules(selector, output)).toEqual([])
  })
  for (const guide of original.raw) {
    for (const [sectionIndex, section] of guide.sections.entries()) for (const [index, sample] of (helpersRawExamples[guide.slug]![sectionIndex]!.code ?? []).entries()) {
      if (sample.language !== 'scss') continue
      it(guide.slug + ': ' + section.heading + ' sample ' + (index + 1) + ' compiles against the pin', () => {
        const source = sample.source.replace(/'tremplin\/scss(?:\/([^']+))?'/g, (_, path: string | undefined) => "'src/scss/" + (path ?? 'tremplin') + "'")
        const output = sass(source)
        expect(output.trim()).not.toBe('')
        // Full-entry examples contain the separate approved Datepicker SVG patch.
        expect(topology(output)).toEqual(topology(sass(source, true)))
      })
    }
  }
  it('uses the pinned focusable-hidden selector and physical text truncation declarations', () => {
    const root = ast(sheet('tremplin'))
    expect(rules('.visually-hidden-focusable:not(:focus, :focus-within)', root)).toHaveLength(1)
    expect(rules('.visually-hidden-focusable:not(:focus):not(:focus-within)', root)).toEqual([])
    expect(values('.text-truncate', 'text-overflow', root)).toEqual(['ellipsis'])
    expect(values('.text-truncate', 'white-space', root)).toEqual(['nowrap'])
    expect(values('.text-truncate', 'overflow', root)).toEqual(['hidden'])
  })
  it('preserves accessible hiding geometry, importance and the caption exception', () => {
    const root = ast(sheet('helpers/visually-hidden'))
    expect(values('.visually-hidden', 'width', root)).toEqual(['1px'])
    expect(values('.visually-hidden', 'height', root)).toEqual(['1px'])
    expect(values('.visually-hidden', 'position', root)).toEqual([])
    expect(values('.visually-hidden:not(caption)', 'position', root)).toEqual(['absolute'])
    expect(values('.visually-hidden *', 'overflow', root)).toEqual(['hidden'])
    for (const rule of rules('.visually-hidden', root)) rule.walkDecls(node => { expect(node.important).toBe(true) })
  })
})
