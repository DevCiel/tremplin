import { beforeAll, describe, expect, it } from 'vitest'
import { utilitiesGuides, utilityTopics } from './helpers/utilities-mdx-contract'
import { ancestors, ast, cssTree, rules, sass, sheet, values } from './helpers/pinned-sass'

let root: ReturnType<typeof ast>
const custom = (options: string) => "@use 'src/scss/config'" + (options ? ' with (' + options + ')' : '') +
  "; @use 'src/scss/tremplin-utilities';"
const parity = (source: string) => {
  const output = sass(source)
  expect(cssTree(output)).toBe(cssTree(sass(source, true)))
  return ast(output)
}
const normal = (selector: string, property: string, value: string, source = root) => {
  expect(values(selector, property, source), selector).toEqual([value])
  for (const rule of rules(selector, source)) rule.walkDecls(property, declaration => {
    expect(Boolean(declaration.important), selector).toBe(false)
  })
}

beforeAll(() => { root = ast(sheet('tremplin-utilities')) }, 90_000)

describe('pinned Bootstrap 6 Grid and gap utility families', () => {
  it('matches the independent upstream utilities entry completely', () => {
    expect(cssTree(root.toString())).toBe(cssTree(sheet('tremplin-utilities', true)))
  })

  it('provides track counts, subgrid, full-track span and auto-flow without global importance', () => {
    normal('.grid-cols-1', 'grid-template-columns', '1fr')
    for (const count of [2, 3, 4, 6]) normal('.grid-cols-' + count, 'grid-template-columns', 'repeat(' + count + ', 1fr)')
    normal('.grid-cols-subgrid', 'grid-template-columns', 'subgrid')
    normal('.grid-cols-fill', 'grid-column', '1 / -1')
    for (const flow of ['row', 'column', 'dense']) normal('.grid-auto-flow-' + flow, 'grid-auto-flow', flow)
    expect(rules('.grid-cols-5', root)).toEqual([])
  })

  for (const family of ['gap', 'row-gap', 'column-gap']) {
    it('generates the complete ' + family + ' spacer scale with canonical viewport prefixes only', () => {
      const spacers = ['0', '0.25rem', '0.375rem', '0.5rem', '0.75rem', '1rem', '1.25rem', '1.5rem', '1.75rem', '2rem', '2.25rem', '2.5rem', '3rem']
      for (const [key, value] of spacers.entries()) {
        normal('.' + family + '-' + key, family, value)
        normal('.md\\:' + family + '-' + key, family, value)
        expect(ancestors(rules('.md\\:' + family + '-' + key, root)[0]!, 'media')).toEqual(['(width >= 768px)'])
        expect(rules('.' + family + '-md-' + key, root)).toEqual([])
      }
      expect(rules('.' + family + '-3', root)).toHaveLength(1)
      for (const prefix of ['print\\:', 'dark\\:', 'hover\\:']) expect(rules('.' + prefix + family + '-3', root)).toEqual([])
    })
  }

  it('makes track and flow utilities viewport-responsive, not container-responsive', () => {
    normal('.md\\:grid-cols-3', 'grid-template-columns', 'repeat(3, 1fr)')
    normal('.md\\:grid-auto-flow-column', 'grid-auto-flow', 'column')
    for (const selector of ['.md\\:grid-cols-3', '.md\\:grid-auto-flow-column']) {
      expect(ancestors(rules(selector, root)[0]!, 'media')).toEqual(['(width >= 768px)'])
      expect(ancestors(rules(selector, root)[0]!, 'container')).toEqual([])
    }
    expect(rules('.grid-cols-md-3', root)).toEqual([])
  })

  it('honors spacer overrides and null removals across all three gap families', () => {
    const output = parity(custom('$spacers: (2: .75rem, 3: null, compact: .125rem)'))
    for (const family of ['gap', 'row-gap', 'column-gap']) {
      normal('.' + family + '-2', family, '0.75rem', output)
      normal('.' + family + '-compact', family, '0.125rem', output)
      normal('.md\\:' + family + '-compact', family, '0.125rem', output)
      expect(rules('.' + family + '-3', output)).toEqual([])
      expect(rules('.md\\:' + family + '-3', output)).toEqual([])
    }
  })

  it('removes mapped families without leaving handwritten or responsive rules', () => {
    const source = "@use 'src/scss/tremplin-utilities' with ($utilities: ('gap': null, 'row-gap': (enabled: false), 'column-gap': null, 'grid-column-counts': null, 'grid-columns': null, 'grid-auto-flow': null));"
    const output = parity(source)
    for (const name of ['gap-2', 'row-gap-2', 'column-gap-2', 'grid-cols-2', 'grid-cols-fill', 'grid-auto-flow-row']) {
      expect(rules('.' + name, output)).toEqual([])
      expect(rules('.md\\:' + name, output)).toEqual([])
    }
    normal('.d-grid', 'display', 'grid', output)
  })

  it('supports renamed classes, shallow replacement, states, print and OS-dark variants', () => {
    const source = "@use 'src/scss/tremplin-utilities' with ($utilities: ('gap': (property: gap, class: project-gap, responsive: true, print: true, dark: true, state: hover, values: (tight: 2px)), 'grid-column-counts': (property: grid-template-columns, class: project-cols, values: (5: repeat(5, 1fr)))));"
    const output = parity(source)
    for (const selector of ['.project-gap-tight', '.md\\:project-gap-tight', '.print\\:project-gap-tight', '.dark\\:project-gap-tight', '.hover\\:project-gap-tight:hover', '.md\\:hover\\:project-gap-tight:hover']) normal(selector, 'gap', '2px', output)
    expect(ancestors(rules('.print\\:project-gap-tight', output)[0]!, 'media')).toEqual(['print'])
    expect(ancestors(rules('.dark\\:project-gap-tight', output)[0]!, 'media')).toEqual(['(prefers-color-scheme: dark)'])
    normal('.project-cols-5', 'grid-template-columns', 'repeat(5, 1fr)', output)
    for (const selector of ['.gap-3', '.grid-cols-2', '.md\\:project-cols-5']) expect(rules(selector, output)).toEqual([])
  })

  it('opts into importance per family rather than accepting the retired global switch', () => {
    const output = parity("@use 'src/scss/tremplin-utilities' with ($utilities: ('gap': (property: gap, class: gap, important: true, values: (tight: 2px))));")
    expect(values('.gap-tight', 'gap', output)).toEqual(['2px'])
    rules('.gap-tight', output)[0]!.walkDecls('gap', declaration => { expect(declaration.important).toBe(true) })
    normal('.row-gap-2', 'row-gap', '0.375rem', output)
    normal('.grid-cols-2', 'grid-template-columns', 'repeat(2, 1fr)', output)
    expect(() => sass("@use 'src/scss/tremplin' with ($enable-important-utilities: false);")).toThrow(/not declared with !default/)
  })

  it('keeps utilities independent of the optional layout grid module', () => {
    const output = parity(custom('$enable-cssgrid: false'))
    for (const selector of ['.grid', '.g-col-6', '.span-6']) expect(rules(selector, output)).toEqual([])
    normal('.d-grid', 'display', 'grid', output)
    normal('.grid-cols-2', 'grid-template-columns', 'repeat(2, 1fr)', output)
    // The full entry also retains these utilities when only layout Grid is off.
    const main = ast(sass("@use 'src/scss/tremplin' with ($enable-cssgrid: false);"))
    expect(rules('.grid', main)).toEqual([])
    normal('.grid-cols-2', 'grid-template-columns', 'repeat(2, 1fr)', main)
  })

  for (const slug of ['gap', 'grid']) {
    it('compiles every documented ' + slug + ' customization against the pin', () => {
      const guide = utilitiesGuides.find(guide => guide.slug === 'utilities/' + slug)!
      const samples = guide.sections.flatMap(section => section.code ?? []).filter(sample => sample.language === 'scss')
      expect(samples.length).toBeGreaterThan(0)
      for (const sample of samples) {
        const source = sample.source.replaceAll("'tremplin/scss'", "'src/scss/tremplin'")
        const output = ast(sass(source))
        const reference = ast(sass(source, true))
        const selectors = slug === 'gap' ? ['.gap-2', '.column-gap-tight', '.column-gap-2'] : ['.grid-cols-5', '.grid-cols-2']
        for (const selector of selectors) expect(rules(selector, output).map(rule => rule.toString())).toEqual(rules(selector, reference).map(rule => rule.toString()))
        if (slug === 'gap') {
          normal('.gap-2', 'gap', '0.75rem', output)
          normal('.column-gap-tight', 'column-gap', '0.25rem', output)
          expect(rules('.column-gap-2', output)).toEqual([])
        } else {
          normal('.grid-cols-5', 'grid-template-columns', 'repeat(5, 1fr)', output)
          expect(rules('.grid-cols-2', output)).toEqual([])
        }
      }
      const topic = utilityTopics.find(topic => topic.slug === slug)!
      for (const selector of ['gap-md-4', 'row-gap-md-4', 'column-gap-md-4', 'grid-cols-md-3', 'span-6']) expect(topic.classes).not.toContain(selector)
    })
  }
})
