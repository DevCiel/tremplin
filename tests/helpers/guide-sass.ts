import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import type { Guide } from '../../site/src/data/guide-docs'
import { ast, cssTree, sass, sassPin, sheet } from './pinned-sass'
import { approvedSass, prepareApprovedSass } from './approved-sass'

export const guideSource = (source: string) => source.replace(/'tremplin\/scss(?:\/([^']+))?'/g, (_, partial: string | undefined) => "'src/scss/" + (partial ?? 'tremplin') + "'")

export function checkGuideGroup(group: string, guides: Guide[], extraRoutes: string[] = []) {
  const samples = guides.flatMap(guide => guide.sections.flatMap(section => (section.code ?? []).filter(sample => sample.language === 'scss').map((sample, index) => ({ slug: guide.slug, heading: section.heading, index, source: guideSource(sample.source) }))))
  let core: string
  beforeAll(async () => {
    await prepareApprovedSass()
    core = sheet('tremplin')
    for (const sample of samples) { sass(sample.source); approvedSass(sample.source) }
  }, 180_000)
  describe('pinned ' + group + ' guide contracts', () => {
    it('covers the independently pinned topics plus declared local cross-reference routes', () => {
      const manifest = JSON.parse(readFileSync('artifacts/bootstrap6-reference/' + sassPin.commit + '/reference-manifest.json', 'utf8')) as { commit: string; files: { path: string }[] }
      expect(manifest.commit).toBe(sassPin.commit)
      const prefix = 'site/src/content/docs/' + group + '/'
      const topics = manifest.files.filter(file => file.path.startsWith(prefix) && file.path.endsWith('.mdx')).map(file => group + '/' + file.path.split('/').at(-1)!.replace('.mdx', ''))
      expect(guides.map(guide => guide.slug).sort()).toEqual([...topics, ...extraRoutes].sort())
      expect(new Set(guides.map(guide => guide.slug)).size).toBe(guides.length)
    })
    for (const sample of samples) it(sample.slug + ': ' + sample.heading + ' sample ' + (sample.index + 1) + ' matches approved pin', () => {
      const actual = sass(sample.source)
      expect(actual.trim()).not.toBe('')
      expect(cssTree(actual)).toBe(cssTree(approvedSass(sample.source)))
    })
    for (const guide of guides) it(guide.slug + ': every live and HTML example uses current core classes', () => {
      const root = ast(core)
      const properties = new Set<string>()
      root.walkDecls(decl => { if (decl.prop.startsWith('--trm-')) properties.add(decl.prop) })
      for (const section of guide.sections) {
        const styledSamples = [section.example ?? '', ...(section.code ?? []).filter(sample => ['css', 'scss', 'html'].includes(sample.language)).map(sample => sample.source)].join('\n')
        for (const token of new Set(styledSamples.match(/--trm-[\w-]+/g) ?? [])) {
          expect(properties.has(token), guide.slug + ' / ' + section.heading + ': ' + token).toBe(true)
        }
        const markup = [section.example ?? '', ...(section.code ?? []).filter(sample => sample.language === 'html').map(sample => sample.source)].join('\n')
        const classes = [...markup.matchAll(/class="([^"]*)"/g)].flatMap(match => match[1]!.split(/\s+/)).filter(Boolean)
        for (const name of new Set(classes)) {
          // Digit-prefixed CSS names and escaped responsive colons are literal
          // HTML class tokens; inspect all selector occurrences, not only a
          // standalone rule (e.g. not-prose and list-inline-item).
          let escaped = name.replaceAll(':', '\\:')
          if (/^\d/.test(escaped)) escaped = '\\3' + escaped[0] + ' ' + escaped.slice(1)
          const needle = ('.' + escaped).replace(/[.*+?^$(){}|[\]\\]/g, '\\$&')
          const pattern = new RegExp(needle + '(?![\\w-])')
          let found = false
          root.walkRules(rule => { if (pattern.test(rule.selector)) found = true })
          expect(found, guide.slug + ' / ' + section.heading + ': ' + name).toBe(true)
        }
      }
    })
  })
}
