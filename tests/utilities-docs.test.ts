import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { utilityTopics, utilitiesGuides } from './helpers/utilities-mdx-contract'
import { ast, cssTree, rules, sass, sassPin, sheet, topology } from './helpers/pinned-sass'

const sourceFor = (source: string) => source.replace(/'tremplin\/scss(?:\/([^']+))?'/g, (_, path: string | undefined) => "'src/scss/" + (path ?? 'tremplin') + "'")
const samples = utilitiesGuides.flatMap(guide => guide.sections.flatMap(section => (section.code ?? []).filter(sample => sample.language === 'scss').map(sample => ({ slug: guide.slug, heading: section.heading, source: sourceFor(sample.source) }))))
let root: ReturnType<typeof ast>
beforeAll(() => {
  root = ast(sheet('tremplin'))
  sheet('tremplin-utilities')
  sheet('tremplin-utilities', true)
  for (const sample of samples) { sass(sample.source); sass(sample.source, true) }
}, 120_000)

describe('pinned Bootstrap 6 complete utility documentation', () => {
  it('covers the 48 independently pinned upstream topics exactly once', () => {
    const inventory = JSON.parse(readFileSync('tests/bootstrap6-utilities-reference.json', 'utf8'))
    const manifest = JSON.parse(readFileSync('artifacts/bootstrap6-reference/' + sassPin.commit + '/reference-manifest.json', 'utf8')) as { commit: string; files: { path: string }[] }
    expect(manifest.commit).toBe(sassPin.commit)
    const topics = manifest.files.map(file => file.path).filter(path => path.startsWith('site/src/content/docs/utilities/') && path.endsWith('.mdx')).map(path => 'utilities/' + path.split('/').at(-1)!.replace('.mdx', '')).sort()
    expect(inventory.commit).toBe(sassPin.commit)
    expect(inventory.topics).toEqual(topics)
    expect(utilitiesGuides.map(guide => guide.slug).sort()).toEqual(topics)
    expect(new Set(utilitiesGuides.map(guide => guide.slug)).size).toBe(48)
  })
  it('matches all generated utility declarations to the independent reference', () => {
    expect(cssTree(sheet('tremplin-utilities'))).toBe(cssTree(sheet('tremplin-utilities', true)))
  })
  for (const topic of utilityTopics) {
    it(topic.slug + ': every advertised default class exists', () => {
      expect(topic.classes.length).toBeGreaterThan(0)
      for (const name of topic.classes) {
        // Classes also occur within :where() child selectors and state variants.
        const escaped = ('.' + name.replaceAll(':', '\\:')).replace(/[.*+?^$(){}|[\]\\]/g, '\\$&')
        const token = new RegExp(escaped + '(?![\\w-])')
        let found = false
        root.walkRules(rule => { if (token.test(rule.selector)) found = true })
        expect(found, name).toBe(true)
      }
    })
  }
  for (const sample of samples) {
    it(sample.slug + ': ' + sample.heading + ' compiles against the pin', () => {
      const actual = sass(sample.source), expected = sass(sample.source, true)
      if (!sample.source.includes("'src/scss/tremplin'")) {
        expect(cssTree(actual)).toBe(cssTree(expected))
      } else {
        // Preserved full-entry Grid/gap examples contain the separately approved
        // Datepicker SVG value patch. Check all topology, utility-layer values
        // and root tokens here; check:production-css verifies patched full CSS.
        expect(topology(actual)).toEqual(topology(expected))
        const utilityLayers = (source: string) => {
          const result: string[] = []
          ast(source).walkAtRules('layer', node => { if (node.params === 'utilities') result.push(cssTree(node.toString())) })
          return result
        }
        expect(utilityLayers(actual)).toEqual(utilityLayers(expected))
        expect(rules(':root', actual).map(rule => rule.toString())).toEqual(rules(':root', expected).map(rule => rule.toString()))
      }
    })
  }
  it('removes global legacy naming claims while keeping API/Grid/gap references coherent', () => {
    for (const guide of utilitiesGuides) {
      const content = JSON.stringify(guide)
      expect(content).not.toContain('support both legacy infix')
      expect(content).not.toContain('alongside retained')
    }
  })
})
