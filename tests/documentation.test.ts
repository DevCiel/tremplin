import { describe, expect, test } from 'vitest'
import { componentDetails, componentGroups, examples } from '../site/src/data/component-docs'
import { guideGroups, guides } from '../site/src/data/guide-docs'
import { documentedTokenNames } from '../site/src/data/documented-tokens'
import { readFileSync } from 'node:fs'

describe('documentation contracts', () => {
  test('publishes unique, complete foundational guides', () => {
    const slugs = guides.map(guide => guide.slug)

    expect(guides).toHaveLength(116)
    expect(guideGroups.map(([name, entries]) => [name, entries.length])).toEqual([
      ['Getting started', 11], ['Guides', 7], ['Customize', 11], ['Layout', 8], ['Content', 5], ['Forms', 17], ['Helpers', 9], ['Utilities', 48]
    ])
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(guides.every(guide => guide.title && guide.description && guide.lead && (guide.source === 'mdx'
      ? readFileSync(`site/src/content/docs/${guide.slug}.mdx`, 'utf8').includes('<section class="docs-section"')
      : guide.sections.length))).toBe(true)
    expect(guideGroups.flatMap(([, entries]) => entries)).toHaveLength(guides.length)
  })

  test('provides an example for every component in navigation', () => {
    const names = Object.values(componentGroups).flat()
    expect(names.every(name => examples[name])).toBe(true)
  })

  test('publishes audited rich documentation for completed component batches', () => {

    expect(Object.keys(componentDetails)).toEqual(['button', 'alert', 'badge', 'card', 'forms', 'navbar', 'menu', 'collapse', 'dialog', 'drawer', 'tooltip', 'popover', 'carousel', 'tab', 'toast', 'scrollspy', 'accordion', 'breadcrumb', 'list-group', 'pagination', 'progress', 'spinner', 'skeleton', 'avatar', 'table', 'chip', 'stepper', 'status', 'timeline', 'divider', 'empty-state', 'data-table', 'chips', 'combobox', 'datepicker', 'otp-input', 'range', 'strength', 'toggler', 'nav-overflow', 'bottom-sheet', 'command-palette'])
    for (const [name, detail] of Object.entries(componentDetails)) {
      expect(detail.variants.length).toBeGreaterThanOrEqual(3)
      expect(detail.guidelines.length).toBeGreaterThanOrEqual(4)
      expect(detail.variants.some(variant => variant.markup.includes('data-trm-theme="dark"') && variant.markup.includes('dir="rtl"'))).toBe(true)
      // Evaluated Sass maps include dynamic/global tokens that are not literal
      // strings in the partial. The catalog is regenerated/checked from Sass.
      for (const variable of detail.variables) expect(documentedTokenNames(name).has(variable.name), `${name}: ${variable.name}`).toBe(true)
    }
  })
})
