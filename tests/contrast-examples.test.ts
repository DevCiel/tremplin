import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import postcss from 'postcss'
import { contrastExample, demoContrastCss, contrastComponentNames } from '../site/src/data/contrast-examples'
import { componentDetail, componentExample } from '../site/src/data/component-reference'
import { guides } from '../site/src/data/guide-docs'
import { helpersExamples } from '../site/src/data/helpers-examples'
import { formsExamples } from '../site/src/data/forms-examples'
import { utilitiesExamples } from '../site/src/data/utilities-examples'

describe('Explicit documentation-only contrast customization', () => {
  it('references existing compiled core tokens and keeps overrides opt-in', () => {
    const names = new Set<string>()
    postcss.parse(readFileSync('dist/css/tremplin.css', 'utf8')).walkDecls(declaration => { if (declaration.prop.startsWith('--')) names.add(declaration.prop) })
    for (const match of demoContrastCss.matchAll(/var\((--trm-[\w-]+)/g)) expect(names.has(match[1]!)).toBe(true)
    const selectors: string[] = []
    postcss.parse(demoContrastCss).walkRules(rule => { selectors.push(rule.selector) })
    expect(selectors.every(selector => selector.startsWith('.demo-contrast') || selector.startsWith('.demo-calendar-contrast'))).toBe(true)
  })
  it('shows the same opt-in wrapper and canonical classes in copied markup', () => {
    const markup = contrastExample('<button class="btn btn-primary">Primary</button><span class="badge bg-danger">Rejected</span>')
    expect(markup).toContain('class="demo-contrast"')
    expect(markup).toContain('btn btn-solid theme-primary')
    expect(markup).toContain('badge theme-danger')
    expect(demoContrastCss).toContain('--trm-primary-bg: var(--trm-blue-700)')
  })
  it('configures the real calendar class through supported dependency options', () => {
    expect(contrastExample('<input data-trm-toggle="datepicker">')).toContain('data-trm-vcp-options=\'{"styles":{"calendar":"vc demo-calendar-contrast"}}\'')
    expect(demoContrastCss).toContain('opacity: .8')
    expect(demoContrastCss).not.toMatch(/display:\s*none|visibility:\s*hidden/)
  })
  it('applies explicit customization to every affected component/guide and its copyable HTML', () => {
    for (const name of contrastComponentNames) {
      expect(componentExample(name)).toContain('class="demo-contrast"')
      for (const variant of componentDetail(name)!.variants) expect(variant.markup).toContain('class="demo-contrast"')
    }
    for (const slug of ['helpers/stretched-link', 'utilities/background', 'utilities/theme', 'forms/datepicker']) {
      const guide = guides.find(guide => guide.slug === slug)!
      if (guide.source === 'mdx') {
        const source = readFileSync(`site/src/content/docs/${slug}.mdx`, 'utf8')
        expect(source).toContain('<h2 id="section-0">{"Explicit demo contrast customization"}</h2>')
        const samples = (slug.startsWith('helpers/') ? helpersExamples : slug.startsWith('utilities/') ? utilitiesExamples : formsExamples)[slug]!
        expect(samples[0]!.code![0]!.source).toBe(demoContrastCss)
        for (const section of samples) {
          if (section.example) expect(section.example).toContain('class="demo-contrast"')
          for (const sample of section.code ?? []) if (sample.language === 'html') expect(sample.source).toContain('class="demo-contrast"')
        }
      } else {
        expect(guide.sections[0]!.heading).toBe('Explicit demo contrast customization')
        for (const section of guide.sections) if (section.example) expect(section.example).toContain('class="demo-contrast"')
      }
    }
  })
})
