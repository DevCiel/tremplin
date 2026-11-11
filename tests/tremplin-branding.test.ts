import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { componentReference, componentSource, documentedComponents } from '../site/src/data/component-reference'
import { gettingStartedGuides } from '../site/src/data/getting-started-guides'
import { assertGettingStartedMdx, historicalDocumentationSource } from './tooling/lib/getting-started-mdx.mjs'
import { withinMdxAudit } from './tooling/lib/mdx-audit-context.mjs'

const read = (file: string) => readFileSync(file, 'utf8')
const json = (file: string) => JSON.parse(read(file))
const walk = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(directory + '/' + entry.name) : [directory + '/' + entry.name])
const pin = '9062790fdb2379593a2973416dc5a3bfb203e4e3'

describe('Tremplin branding without attribution or API loss', () => {
  it('moves exactly the approved tool identities and removes the old commands', () => {
    const rename = json('metadata/tremplin-tooling-rename.json'), pkg = json('package.json')
    expect(rename.reference).toBe(pin)
    expect(Object.entries(rename.moves)).toHaveLength(8)
    expect(Object.entries(rename.commandRenames)).toHaveLength(7)
    for (const [before, after] of Object.entries(rename.moves) as [string, string][]) {
      expect(existsSync(before), before).toBe(false)
      expect(existsSync(after), after).toBe(true)
    }
    for (const [before, after] of Object.entries(rename.commandRenames) as [string, string][]) {
      expect(pkg.scripts[before]).toBeUndefined()
      expect(pkg.scripts[after]).toBeTruthy()
    }
    expect(pkg.scripts.build).toContain('npm run check:tremplin')
  })

  it('consolidates duplicate filenames while preserving every original license in full', () => {
    const policy = json('metadata/tremplin-branding.json'), notice = read(policy.rootNotice)
    expect(policy.reference).toBe(pin)
    expect(notice).toBe(read(policy.distributionNotice))
    expect(notice).toContain(read(policy.licenseSource))
    expect(read(policy.licenseSource)).toContain('The Bootstrap Authors')
    expect(notice).toContain(read('LICENSE'))
    for (const name of ['@floating-ui/core', '@floating-ui/dom', '@floating-ui/utils', 'vanilla-calendar-pro']) expect(notice).toContain(read('node_modules/' + name + '/LICENSE'))
    expect(notice).toContain('Documentation acknowledgements')
    expect(notice).toContain('https://creativecommons.org/licenses/by/3.0/')
    for (const file of policy.retiredNoticePaths) expect(existsSync(file), file).toBe(false)
    expect(read('site/public/THIRD_PARTY_NOTICES.txt')).toBe(notice)
    expect(read('site/src/components/footer/Footer.astro')).toContain('href="/THIRD_PARTY_NOTICES.txt"')
  })

  it('keeps the consumer inventory and source pin explicit without changing the release version', () => {
    const policy = json('metadata/tremplin-branding.json'), pkg = json('package.json')
    expect(pkg.files).toEqual(policy.filesAfter)
    expect(pkg.files.filter((file: string) => file.startsWith('metadata'))).toEqual(['metadata/api.json', 'metadata/public-api.json'])
    expect(walk('dist')).toHaveLength(29)
    expect(walk('js/dist')).toHaveLength(140)
    expect(Object.keys(pkg.exports)).toHaveLength(11)
    expect(pkg.version).toBe('0.8.0-beta.0')
    expect(pkg.tremplinMigration.releaseBlocked).toBe(true)
    expect(json('metadata/bootstrap6-reference.json').commit).toBe(pin)
    expect(json('metadata/bootstrap6-security-patches.json').files).toHaveLength(6)
  })

  it('points public references at real Tremplin sources, including optional patterns', () => {
    for (const component of documentedComponents) {
      const file = componentSource(component.name)
      expect(existsSync(file), file).toBe(true)
      expect(componentReference(component.name)).toBe('https://github.com/DevCiel/tremplin/blob/main/' + file)
    }
    for (const guide of gettingStartedGuides) {
      expect(guide.reference!.title).toBe('Tremplin source')
      const file = guide.reference!.url.replace('https://github.com/DevCiel/tremplin/blob/main/', '')
      expect(file).toMatch(/^site\/src\/content\/docs\/getting-started\/[\w-]+\.mdx$/)
      expect(existsSync(file), file).toBe(true)
    }
  })

  it('records exact reviewed documentation bytes without refreshing historical fixtures', () => withinMdxAudit('tremplin-documentation-branding', () => {
    assertGettingStartedMdx()
    const policy = json('metadata/tremplin-documentation-branding.json')
    expect(policy.reference).toBe(pin)
    expect(policy.phase).toBe('tremplin-documentation-branding')
    expect(new Set(policy.changes.map((entry: { file: string }) => entry.file)).size).toBe(policy.changes.length)
    for (const entry of policy.changes) {
      expect(entry.file).toMatch(/^site\/src\/data\/[\w-]+\.ts$/)
      expect(entry.before).toMatch(/^[a-f0-9]{64}$/)
      expect(createHash('sha256').update(historicalDocumentationSource(entry.file)).digest('hex'), entry.file).toBe(entry.after)
    }
    const fixture = read('tests/fixtures/documentation-scope/package.initial.json').replaceAll('\r\n', '\n')
    expect(createHash('sha256').update(fixture).digest('hex')).toBe('a79e25ad5bd9643838472289333f7ae83ea1cf03cac27e521e1bd5f046281b11')
  }))
})
