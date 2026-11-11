import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import layout from './fixtures/mdx-migration/layout.before.json' with { type: 'json' }
import content from './fixtures/mdx-migration/content.before.json' with { type: 'json' }
import { layoutExamples } from '../site/src/data/layout-examples'
import { contentExamples } from '../site/src/data/content-examples'
import { allMdxGuideMetadata } from '../site/src/libs/mdx-guides'
import { mdxGuideMetadata } from '../site/src/libs/mdx-metadata'
import * as metadataReader from '../site/src/libs/mdx-metadata'
import { documentationNavigation } from '../site/src/libs/navigation'
import { assertLayoutContentMdx } from './tooling/lib/layout-content-mdx.mjs'

const read = (file: string) => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
describe('authored Layout and Content MDX', () => {
  it('preserves the frozen historical sources and records exactly thirteen new guides', () => {
    expect(assertLayoutContentMdx().groups).toEqual({ layout: 8, content: 5 })
    expect(allMdxGuideMetadata().filter(guide => !['Forms', 'Helpers', 'Utilities'].includes(guide.group))).toHaveLength(42)
    expect(documentationNavigation().guides).toHaveLength(116)
    expect(documentationNavigation().guideGroups.map(([group, entries]) => [group, entries.length])).toEqual([
      ['Getting started', 11], ['Guides', 7], ['Customize', 11], ['Layout', 8], ['Content', 5], ['Forms', 17], ['Helpers', 9], ['Utilities', 48]
    ])
  })

  it.each(['layout', 'content'])('%s navigation reads current MDX metadata without stale module titles', group => {
    const originalReader = metadataReader.mdxGuideMetadata
    const original = originalReader(group)
    expect(original.every(guide => guide.source === 'mdx' && guide.sections.length === 0)).toBe(true)
    const updated = original.map((guide, index) => index === 0 ? { ...guide, title: 'Updated guide title' } : guide)
    const reader = vi.spyOn(metadataReader, 'mdxGuideMetadata').mockImplementation(value => value === group ? updated : originalReader(value))
    try {
      const navigation = documentationNavigation()
      expect(reader).toHaveBeenCalledWith(group)
      expect(navigation.guides).toHaveLength(116)
      expect(navigation.guideGroups.find(([title]) => title === original[0]!.group)![1][0]!.title).toBe('Updated guide title')
      expect(navigation.searchPages.find(page => page.href === `/${original[0]!.slug}/`)!.title).toBe('Updated guide title')
    } finally { reader.mockRestore() }
  })

  for (const [group, original, samples, module] of [
    ['layout', layout, layoutExamples, 'layout'], ['content', content, contentExamples, 'content']
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
