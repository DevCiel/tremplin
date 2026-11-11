import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { compile } from 'sass'
import { describe, expect, it } from 'vitest'
import { assertDocumentationStylesheet } from './tooling/lib/site-architecture.mjs'
import { guides } from '../site/src/data/guide-docs'
import { documentationPaths } from '../site/src/libs/content'

const read = (file: string) => readFileSync(file, 'utf8')

describe('documentation site architecture', () => {
  it('owns configuration in site/ and retains root CLI startup', () => {
    expect(read('astro.config.mjs')).toContain("export { default } from './site/astro.config.ts'")
    const config = read('site/astro.config.ts')
    for (const directory of ['./src/', './public/', '../site-dist/']) expect(config).toContain(directory)
    expect(config).toContain('documentationAssets()')
    expect(JSON.parse(read('site/tsconfig.json')).extends).toBe('astro/tsconfigs/strict')
    expect(JSON.parse(read('package.json')).scripts['site:dev']).toBe('npm run site:prepare && astro dev --host 127.0.0.1 --port 4321')
  })

  it('composes the shell without duplicating page-specific behavior', () => {
    const layout = read('site/src/layouts/DocsLayout.astro')
    for (const name of ['PageMeta', 'Header', 'DocsSidebar', 'TableOfContents', 'Footer', 'Scripts']) {
      expect(layout).toContain('<' + name)
    }
    expect(layout).not.toContain('DOMContentLoaded')
    expect(read('site/src/components/Scripts.astro')).toContain('DOMContentLoaded')
    expect(read('site/src/components/footer/Footer.astro')).toContain('href="/THIRD_PARTY_NOTICES.txt"')
  })

  it.each(['getting-started', 'customize', 'utilities', 'integrations'])('loads %s overview as authored MDX, not duplicate page content', group => {
    const file = `site/src/content/docs/${group}/index.mdx`
    expect(read(file)).toMatch(/^---\ntitle:/)
    expect(read(file)).not.toMatch(/^layout:/m)
    expect(existsSync(`site/src/pages/${group}/index.mdx`)).toBe(false)
  })

  it('does not drop or invent authored guide routes during collection loading', () => {
    const entries = guides.map(guide => ({ id: guide.slug, data: guide }))
    const paths = documentationPaths(entries)
    expect(paths.map(entry => entry.params.guide)).toEqual(guides.map(guide => guide.slug))
    expect(new Set(paths.map(entry => entry.params.guide)).size).toBe(guides.length)
    expect(() => documentationPaths([entries[0]!, entries[0]!])).toThrow('Duplicate documentation route')
    expect(() => documentationPaths([{ ...entries[0]!, id: '../outside' }])).toThrow('Invalid documentation route')
  })

  it('compiles modular Sass with the exact established cascade semantics', () => {
    const original = readFileSync('tests/fixtures/documentation-scope/docs.initial.css')
    const originalHash = createHash('sha256').update(original).digest('hex')
    expect(originalHash).toBe('ba36831052f1e80af37b1117824b0d974ca36c264859ab6dc69536d39cdc7763')
    const css = compile('site/src/scss/docs.scss', { style: 'expanded', charset: false }).css
    expect(css).toBe(read('site/public/docs.css'))
    expect(() => assertDocumentationStylesheet(Buffer.from(css), originalHash)).not.toThrow()
    expect(() => assertDocumentationStylesheet(Buffer.from(css + '\nbody { display: none; }'), originalHash)).toThrow()
  })

  it.each(['geist-latin.woff2', 'geist-mono-latin.woff2', 'docs-icons.svg', 'content-sample.svg'])('copies authored %s without modifying its bytes', asset => {
    expect(readFileSync('site/static/' + asset).equals(readFileSync('site/public/' + asset))).toBe(true)
  })

  it('excludes the custom 404 from indexing without creating an old-version route', () => {
    expect(read('site/src/pages/404.astro')).toContain('searchable={false}')
    expect(read('site/src/components/PageMeta.astro')).toContain('content="noindex"')
    expect(read('site/src/pages/robots.txt.ts')).toContain('User-agent: *')
    expect(JSON.parse(read('package.json')).tremplinMigration.releaseBlocked).toBe(true)
  })
})
