import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import postcss from 'postcss'

describe('Documentation styling stays separate from strict core compatibility', () => {
  it('uses real core tokens instead of reviving removed global aliases', () => {
    const css = readFileSync('site/public/docs.css', 'utf8')
    // Generated theme roles are authoritative in compiled CSS, not only the
    // source-oriented API inventory (which cannot infer every dynamic token).
    const actual = new Set<string>()
    postcss.parse(readFileSync('dist/css/tremplin.css', 'utf8')).walkDecls(declaration => {
      if (declaration.prop.startsWith('--')) actual.add(declaration.prop)
    })
    const refs = [...css.matchAll(/var\((--trm-[\w-]+)/g)].map(match => match[1]!)
    expect([...new Set(refs)].filter(name => !actual.has(name))).toEqual([])
    expect(css).not.toMatch(/--trm-(?:primary|body-bg|body-color|surface-raised|muted)\s*:/)
    expect(css).toContain('--docs-accent:')
  })

  it('does not apply the flex prose component to the entire documentation tree', () => {
    const layout = readFileSync('site/src/layouts/DocsLayout.astro', 'utf8')
    expect(layout).toContain('<main class="docs-main"')
    expect(layout).not.toContain('class="docs-main prose"')
    expect(readFileSync('site/public/docs.css', 'utf8')).toContain('.docs-section > :where(h2, h3)')
  })

  it('uses a single page-specific graph for the optional palette', () => {
    const layout = readFileSync('site/src/components/Scripts.astro', 'utf8')
    const page = readFileSync('site/src/pages/components/[slug].astro', 'utf8')
    expect(layout).toContain("hasPalette ? '/js/tremplin-command-palette.min.js' : '/js/tremplin-docs.min.js'")
    expect(page).not.toContain('src="/dist/js/extensions/command-palette.js"')
    const entry = readFileSync('site/src/palette-runtime.ts', 'utf8')
    expect(entry).toContain("export * from '../../src/js/index.js'")
    expect(entry).toContain("export { CommandPalette }")
  })
})
