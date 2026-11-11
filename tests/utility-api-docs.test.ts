import { beforeAll, describe, expect, it } from 'vitest'
import { utilitiesGuides } from './helpers/utilities-mdx-contract'
import { ast, cssTree, rules, sass, sheet, values } from './helpers/pinned-sass'

const guide = utilitiesGuides.find(guide => guide.slug === 'utilities/api')!
const sourceFor = (source: string) => source.replace(/'tremplin\/scss(?:\/([^']+))?'/g, (_, path: string | undefined) => "'src/scss/" + (path ?? 'tremplin') + "'")
const samples = guide.sections.flatMap(section => (section.code ?? []).filter(sample => sample.language === 'scss').map(sample => ({ heading: section.heading, source: sourceFor(sample.source) })))

beforeAll(() => {
  // Compile CPU-heavy distribution examples once; keep assertion timeouts intact.
  for (const sample of samples) { sass(sample.source); sass(sample.source, true) }
  sheet('tremplin-utilities')
}, 90_000)

describe('pinned Bootstrap 6 Utility API documentation', () => {
  for (const sample of samples) {
    it(sample.heading + ' compiles against the independent pin', () => {
      expect(cssTree(sass(sample.source))).toBe(cssTree(sass(sample.source, true)))
    })
  }
  it('links to maintained Tremplin source and documents all supported option names', () => {
    expect(guide.reference!.url).toBe('https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/utilities/api.mdx')
    expect(guide.lead).not.toContain('smaller')
    expect(samples).toHaveLength(8)
    const options = guide.sections.find(section => section.heading === 'Options')!.table!
    expect(options.rows.map(row => row[0])).toEqual(['property', 'values', 'class', 'selector', 'child-selector', 'variables', 'responsive', 'state', 'print', 'dark', 'important', 'enabled'])
  })
  it('uses only built-in classes in the live viewport example', () => {
    const root = ast(sheet('tremplin-utilities'))
    for (const selector of ['.d-flex', '.flex-column', '.md\\:flex-row', '.gap-2', '.md\\:gap-3']) expect(rules(selector, root)).toHaveLength(1)
  })
  it('demonstrates correct explicit properties, opt-in variants and family replacement', () => {
    const rootFor = (heading: string) => ast(sass(samples.find(sample => sample.heading === heading)!.source))
    const composition = rootFor('Composition properties')
    expect(values('.project-tone-brand', '--project-tone', composition)).toEqual(['#075985'])
    expect(composition.toString()).toContain('@property --project-tone')
    const additions = rootFor('Add utilities')
    expect(values('.md\\:project-cursor-pointer', 'cursor', additions)).toEqual(['pointer'])
    expect(values('.hover\\:project-fade-50:hover', 'opacity', additions)).toEqual(['0.5'])
    const replacement = rootFor('Override and remove utilities')
    expect(rules('.float-start', replacement)).toEqual([])
    expect(rules('.opacity-25', replacement)).toEqual([])
    expect(values('.hover\\:opacity-50:hover', 'opacity', replacement)).toEqual(['0.5'])
    const important = rootFor('Importance')
    rules('.project-display-flex', important)[0]!.walkDecls(node => { expect(node.important).toBe(true) })
  })
  it('discloses registration, attribute/state and motion limitations with an explicit preference example', () => {
    const variables = guide.sections.find(section => section.heading === 'Variables helper limitation')!
    expect(variables.table!.rows[1]).toEqual(['variables: project-tone', '--trm-project-tone', '--project-tone'])
    const motion = guide.sections.find(section => section.heading === 'Motion and preferences')!
    expect(motion.code!.find(sample => sample.language === 'css')!.source).toContain('.project-motion-demo { animation: none !important; }')
    expect(JSON.stringify(guide)).toContain('without automatic double-quote escaping')
  })
})
