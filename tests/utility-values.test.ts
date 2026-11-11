import { beforeAll, describe, expect, it } from 'vitest'
import { ancestors, ast, cssTree, rules, sass, sheet, values } from './helpers/pinned-sass'

let root: ReturnType<typeof ast>
beforeAll(() => { root = ast(sheet('tremplin-utilities')) }, 90_000)
describe('pinned Bootstrap 6 foundational utility values', () => {
  it('matches the entire utilities entry to the independently verified pin', () => {
    expect(cssTree(root.toString())).toBe(cssTree(sheet('tremplin-utilities', true)))
  })
  for (const value of ['inline', 'inline-block', 'block', 'grid', 'inline-grid', 'table', 'table-row', 'table-cell', 'flex', 'inline-flex', 'contents', 'flow-root', 'none']) {
    it('provides canonical default display value ' + value + ' without print or legacy aliases', () => {
      expect(values('.d-' + value, 'display', root)).toEqual([value])
      expect(values('.md\\:d-' + value, 'display', root)).toEqual([value])
      expect(ancestors(rules('.md\\:d-' + value, root)[0]!, 'media')).toEqual(['(width >= 768px)'])
      for (const selector of ['.d-md-' + value, '.print\\:d-' + value, '.d-print-' + value]) expect(rules(selector, root)).toEqual([])
      rules('.d-' + value, root)[0]!.walkDecls(node => { expect(Boolean(node.important)).toBe(false) })
    })
  }
  it('emits native wrapping and word-breaking controls without a parallel white-space generator', () => {
    for (const value of ['wrap', 'nowrap', 'balance', 'pretty']) {
      expect(values('.text-' + value, 'text-wrap', root)).toEqual([value])
      expect(values('.text-' + value, 'white-space', root)).toEqual([])
    }
    expect(values('.text-break', 'word-wrap', root)).toEqual(['break-word'])
    expect(values('.text-break', 'word-break', root)).toEqual(['break-word'])
    expect(values('.user-select-text', 'user-select', root)).toEqual(['text'])
  })
  it('removes complete families and replaces display values with explicitly opted-in print output', () => {
    const source = "@use 'src/scss/tremplin-utilities' with ($utilities: ('word-wrap': null, 'text-wrap': null, 'display': (property: display, class: d, responsive: true, print: true, values: (flow-root: flow-root))));"
    const output = sass(source)
    expect(cssTree(output)).toBe(cssTree(sass(source, true)))
    const custom = ast(output)
    for (const selector of ['.text-break', '.text-balance', '.text-nowrap', '.d-table']) expect(rules(selector, custom)).toEqual([])
    expect(values('.md\\:d-flow-root', 'display', custom)).toEqual(['flow-root'])
    expect(ancestors(rules('.print\\:d-flow-root', custom)[0]!, 'media')).toEqual(['print'])
  })
})
