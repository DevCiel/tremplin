import { formsGuides } from './helpers/forms-mdx-contract'
import { describe, expect, it } from 'vitest'
import { componentDetails, examples } from '../site/src/data/component-docs'

import { workflowGuides } from './helpers/guides-customize-contract'
import { comboboxExample, cityChoices } from '../site/src/data/interaction-docs'
import { expectedSiteRoutes } from './helpers/site-route-contract'
import routes from './bootstrap6-site-routes-reference.json' with { type: 'json' }
import { checkGuideGroup } from './helpers/guide-sass'

checkGuideGroup('guides', workflowGuides)

describe('documentation contract migration', () => {
  it('requires every pinned product route plus independently classified local additions', () => {
    const expected = expectedSiteRoutes()
    expect(routes.canonical).toHaveLength(140)
    expect(routes.localGroups.flatMap(group => group.routes)).toHaveLength(56)
    expect(expected).toHaveLength(196)
    expect(new Set(expected).size).toBe(expected.length)
    expect(expected.filter(route => route.startsWith('/guides/'))).toEqual(workflowGuides.map(guide => '/' + guide.slug + '/').sort())
    expect(routes.excludedUpstream.map(item => item.path)).toEqual(['site/src/content/docs/docsref.mdx'])
    // An unchanged count cannot conceal a lost canonical route.
    const wrong = expected.map(route => route === '/guides/vite/' ? '/invented/' : route)
    expect(wrong.length).toBe(expected.length)
    expect(wrong).not.toEqual(expectedSiteRoutes())
  })

  it('authors a real searchable Menu-backed Combobox with a separate named listbox', () => {
    const doc = new DOMParser().parseFromString(comboboxExample('test-city', 'City', cityChoices, true), 'text/html')
    const trigger = doc.querySelector('#test-city')!
    expect(trigger.tagName).toBe('BUTTON')
    expect(trigger.getAttribute('data-trm-toggle')).toBe('combobox')
    expect(trigger.getAttribute('data-trm-name')).toBe('test-city')
    expect(trigger.getAttribute('data-trm-multiple')).toBe('true')
    expect(trigger.nextElementSibling?.classList.contains('menu')).toBe(true)
    expect(doc.querySelector('#test-city-options')?.getAttribute('role')).toBe('listbox')
    expect(doc.querySelectorAll('[role="option"][aria-selected="false"][data-trm-value]')).toHaveLength(3)
    expect(doc.querySelector('#test-city-options .combobox-search-input')).toBeNull()
    expect(doc.querySelectorAll('[data-trm-combobox], [aria-activedescendant]')).toHaveLength(0)
  })

  it('escapes authored choice labels and values without adding HTML elements', () => {
    const doc = new DOMParser().parseFromString(comboboxExample('escaped', 'A "quoted" <label>', [{ value: '"><img src=x>', label: '<script>unsafe</script>' }]), 'text/html')
    expect(doc.querySelectorAll('img, script')).toHaveLength(0)
    expect(doc.querySelector('[data-trm-value]')?.getAttribute('data-trm-value')).toBe('"><img src=x>')
    expect(doc.querySelector('[role="option"]')?.textContent).toBe('<script>unsafe</script>')
  })

  it('removes the input shim and nonexistent options from forms/component prose', () => {
    const form = formsGuides.find(guide => guide.slug === 'forms/combobox')!
    expect(form.sections[0]!.example).toContain('data-trm-toggle="combobox"')
    expect(JSON.stringify(form)).not.toContain('openOnFocus')
    expect(examples.combobox).toContain('combobox-value')
    expect(componentDetails.combobox!.variants.every(variant => !variant.markup.includes('data-trm-combobox'))).toBe(true)
    expect(componentDetails.combobox!.guidelines.join(' ')).toContain('real focus')
  })

  it('uses native Drawer rather than an unconfigured Toggler in responsive navigation', () => {
    const variant = componentDetails.navbar!.variants.find(variant => variant.title.includes('Responsive'))!
    const doc = new DOMParser().parseFromString(variant.markup, 'text/html')
    expect(doc.querySelector('[data-trm-toggle="drawer"]')?.getAttribute('aria-haspopup')).toBe('dialog')
    expect(doc.querySelector('dialog#docs-navbar')).not.toBeNull()
    expect(doc.querySelectorAll('[data-trm-toggle="toggler"], [aria-expanded]')).toHaveLength(0)
  })

  it('teaches Toggler target configuration without hidden/disclosure compatibility behavior', () => {
    const markup = [examples.toggler, ...componentDetails.toggler!.variants.map(variant => variant.markup)].join('\n')
    const doc = new DOMParser().parseFromString(markup, 'text/html')
    for (const trigger of doc.querySelectorAll('[data-trm-toggle="toggler"]')) {
      const target = doc.querySelector(trigger.getAttribute('data-trm-target')!)!
      expect(target.hasAttribute('data-trm-value')).toBe(true)
      expect(target.hasAttribute('hidden')).toBe(false)
    }
    expect(doc.querySelectorAll('[data-trm-class-name], [data-trm-auto-close], [data-trm-dismiss="toggler"], [aria-expanded]')).toHaveLength(0)
  })
})
