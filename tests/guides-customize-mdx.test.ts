import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import workflow from './fixtures/mdx-migration/workflow.before.json' with { type: 'json' }
import customize from './fixtures/mdx-migration/customize.before.json' with { type: 'json' }
import { workflowExamples } from '../site/src/data/workflow-examples'
import { customizeExamples } from '../site/src/data/customize-examples'
import { allMdxGuideMetadata } from '../site/src/libs/mdx-guides'
import { mdxGuideMetadata } from '../site/src/libs/mdx-metadata'
import { documentationNavigation } from '../site/src/libs/navigation'
import { assertGuidesCustomizeMdx } from './tooling/lib/guides-customize-mdx.mjs'

const read = (file: string) => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
describe('authored Guides and Customize MDX', () => {
  it('preserves the frozen historical sources and records exactly eighteen new guides', () => {
    expect(assertGuidesCustomizeMdx().groups).toEqual({ guides: 7, customize: 11 })
    expect(allMdxGuideMetadata().filter(guide => ['Getting started', 'Guides', 'Customize'].includes(guide.group))).toHaveLength(29)
    expect(documentationNavigation().guides).toHaveLength(116)
    expect(documentationNavigation().guideGroups.map(([group, entries]) => [group, entries.length])).toEqual([
      ['Getting started', 11], ['Guides', 7], ['Customize', 11], ['Layout', 8], ['Content', 5], ['Forms', 17], ['Helpers', 9], ['Utilities', 48]
    ])
  })

  it('preserves literal Sass ellipses rather than applying prose typography to syntax', () => {
    expect(read('site/src/content/docs/customize/sass.mdx')).toContain('@use {"..."} with')
  })

  for (const [group, original, samples, module] of [
    ['guides', workflow, workflowExamples, 'workflow'], ['customize', customize, customizeExamples, 'customize']
  ] as const) {
    it(group + ' has one authored body per original route and metadata-only TypeScript', () => {
      expect(readdirSync('site/src/content/docs/' + group).filter(file => file.endsWith('.mdx') && file !== 'index.mdx').sort())
        .toEqual(original.map(guide => guide.slug.split('/')[1] + '.mdx').sort())
      expect(mdxGuideMetadata(group).map(({ slug, title, description, group, lead }) => ({ slug, title, description, group, lead })))
        .toEqual(original.map(({ slug, title, description, group, lead }) => ({ slug, title, description, group, lead })))
      expect(read(`site/src/data/${module}-guides.ts`)).not.toMatch(/paragraphs:|sections:\s*\[|"sections"\s*:/)
      expect(read(`site/src/data/${module}-examples.ts`)).not.toMatch(/paragraphs:|"paragraphs"\s*:|heading:|"heading"\s*:/)
      const expected = Object.fromEntries(original.flatMap(guide => guide.sections.flatMap((section, index) => {
        const entry = section as { code?: unknown[]; example?: string }
        return entry.code || entry.example ? [[guide.slug + '#' + index, { code: entry.code ?? [], ...(entry.example ? { example: entry.example } : {}) }]] : []
      })))
      // Approved repository-install command change, not a fixture rewrite.
      if (group === 'guides') {
        for (const key of ['guides/quickstart#1', 'guides/contribute#1']) {
          const entry = expected[key] as { code: { source: string }[] }
          entry.code = entry.code.map(sample => ({ ...sample, source: sample.source.replace(/^npm ci\n/, 'npm install\n') }))
        }
      }
      expect(samples).toEqual(expected)
    })

    for (const [order, guide] of original.entries()) it(guide.slug + ' preserves its heading IDs, order and real edit target', () => {
      const file = 'site/src/content/docs/' + guide.slug + '.mdx', source = read(file)
      const metadata = JSON.parse(source.match(/^---\n([\s\S]*?)\n---/)![1]!) as { order: number }
      expect(metadata.order).toBe(order)
      const headings = [...source.matchAll(/<(h[23]) id="(section-\d+)">([\s\S]*?)<\/h[23]>/g)]
      expect(headings.map(match => match[2])).toEqual(guide.sections.map((_, index) => 'section-' + index))
      expect(source).not.toContain('<GuideContent')
      expect(mdxGuideMetadata(group)[order]!.reference!.url).toBe('https://github.com/DevCiel/tremplin/blob/main/' + file)
    })
  }
})
