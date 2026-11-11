import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { navigationExamples, navigationDetails, navigationClasses, navigationAccessibility, type NavigationTopic } from '../site/src/data/navigation-disclosure-docs'
import { componentExample, componentDetail, documentedComponents } from '../site/src/data/component-reference'
import { ast, cssTree, sass, sassPin, sheet } from './helpers/pinned-sass'
import { approvedSass, prepareApprovedSass } from './helpers/approved-sass'
import { guideSource } from './helpers/guide-sass'

const names: NavigationTopic[] = ['button-group', 'close-button', 'nav', 'accordion']
const reference = 'artifacts/bootstrap6-reference/' + sassPin.commit + '/'
const documentOf = (html: string) => new DOMParser().parseFromString(html, 'text/html')
const samples = (name: NavigationTopic) => [navigationExamples[name], ...navigationDetails[name].variants.map(v => v.markup)]
let selectors: string
let properties: Set<string>
beforeAll(async () => {
  await prepareApprovedSass()
  const root = ast(sheet('tremplin')), rules: string[] = []
  properties = new Set()
  root.walkRules(rule => { rules.push(rule.selector) })
  root.walkDecls(decl => { properties.add(decl.prop) })
  selectors = rules.join('\n')
}, 90_000)
const hasClass = (name: string) => new RegExp('\\.' + name.replaceAll(':', '\\\\:') + '(?![\\w-])').test(selectors)

describe('pinned navigation and native disclosure documentation', () => {
  for (const name of names) {
    it(name + ': verifies independent raw MDX and actual classes, tokens and catalog', () => {
      const manifest = JSON.parse(readFileSync(reference + 'reference-manifest.json', 'utf8')) as { commit: string; files: { path: string; sha: string }[] }
      expect(manifest.commit).toBe(sassPin.commit)
      const entry = manifest.files.find(f => f.path === 'site/src/content/docs/components/' + name + '.mdx')!
      const bytes = readFileSync(reference + entry.path)
      expect(createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex')).toBe(entry.sha)
      for (const markup of samples(name)) {
        const doc = documentOf(markup)
        for (const element of doc.querySelectorAll('[class]')) for (const className of element.classList) expect(hasClass(className), className).toBe(true)
        for (const token of markup.matchAll(/--trm-[\w-]+/g)) expect(properties.has(token[0]), token[0]).toBe(true)
        for (const button of doc.querySelectorAll('button')) expect(button.type).toBe('button')
        expect(doc.querySelectorAll('.cluster, .stack, .btn-primary, .btn-outline-primary, .accordion-button, .accordion-collapse, .alert-primary')).toHaveLength(0)
      }
      const metadata = documentedComponents.find(c => c.name === name)!
      expect(metadata.classes).toEqual(navigationClasses[name])
      expect(metadata.accessibility).toBe(navigationAccessibility[name])
      for (const className of metadata.classes) expect(hasClass(className), className).toBe(true)
    })

    it(name + ': renders exactly its canonical authored markup without alias translation', () => {
      expect(componentExample(name)).toBe(navigationExamples[name])
      expect(componentDetail(name)).toBe(navigationDetails[name])
      expect(componentDetail(name)!.variants.map(v => v.markup)).toEqual(navigationDetails[name].variants.map(v => v.markup))
    })

    it(name + ': compiles real Sass overrides identically to the approved pin', () => {
      const source = guideSource(navigationDetails[name].sass!)
      for (const token of source.matchAll(/--trm-[\w-]+/g)) expect(properties.has(token[0]), token[0]).toBe(true)
      const css = sass(source)
      expect(css.trim()).not.toBe('')
      expect(cssTree(css)).toBe(cssTree(approvedSass(source)))
    })
  }

  it('uses native summaries, unique names per example and independent nested groups', () => {
    const usedNames = new Set<string>()
    const all = documentOf(samples('accordion').join('\n'))
    for (const markup of samples('accordion')) {
      const doc = documentOf(markup), localNames = new Set<string>()
      expect(doc.querySelectorAll('details.accordion-item').length).toBeGreaterThan(0)
      for (const item of doc.querySelectorAll('details')) {
        expect(item.firstElementChild?.tagName).toBe('SUMMARY')
        expect(item.querySelector('summary')?.hasAttribute('aria-expanded')).toBe(false)
        expect(item.querySelector('summary')?.hasAttribute('role')).toBe(false)
        if (item.hasAttribute('name')) localNames.add(item.getAttribute('name')!)
      }
      for (const name of localNames) { expect(usedNames.has(name), name).toBe(false); usedNames.add(name) }
      expect(doc.querySelectorAll('[data-trm-toggle], .collapse')).toHaveLength(0)
      for (const icon of doc.querySelectorAll('svg.accordion-icon')) expect(icon.getAttribute('aria-hidden')).toBe('true')
    }
    const ids = [...all.querySelectorAll('[id]')].map(e => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    const independent = navigationDetails.accordion.variants.find(v => v.title === 'Independent panels')!
    expect(documentOf(independent.markup).querySelectorAll('details[name]')).toHaveLength(0)
    expect(navigationDetails.accordion.guidelines.join(' ')).toContain('native toggle event')
  })

  it('documents group size tokens, native input state and no invented group token map', () => {
    const doc = documentOf(samples('button-group').join('\n'))
    for (const size of ['xs', 'sm', 'lg']) expect(doc.querySelector('.btn-group-' + size)).not.toBeNull()
    expect(doc.querySelectorAll('label.btn-check > input[type="checkbox"]')).toHaveLength(3)
    expect(doc.querySelectorAll('label.btn-check > input[type="radio"][name="group-alignment"]')).toHaveLength(3)
    expect(navigationDetails['button-group'].sass).toContain('$button-tokens')
    expect(navigationDetails['button-group'].sass).not.toContain('$button-group-tokens')
  })

  it('keeps ordinary navigation distinct from tabs and guards disabled destinations', () => {
    const doc = documentOf(samples('nav').join('\n'))
    expect(doc.querySelectorAll('[role="tab"], [role="tablist"], [role="tabpanel"]')).toHaveLength(0)
    const disabled = doc.querySelector('a[aria-disabled="true"]')!
    expect(disabled.hasAttribute('href')).toBe(false)
    expect(disabled.getAttribute('tabindex')).toBe('-1')
    expect(doc.querySelector('.nav-pills-vertical')).not.toBeNull()
    expect(doc.querySelector('[data-trm-toggle="menu"][type="button"]')).not.toBeNull()
  })

  it('keeps close masks empty, named and connected only to explicit actions', () => {
    const doc = documentOf(samples('close-button').join('\n'))
    for (const close of doc.querySelectorAll('button.btn-close')) { expect(close.textContent).toBe(''); expect(close.getAttribute('aria-label')).toBeTruthy() }
    expect(doc.querySelector('#reference-close-alert [data-trm-dismiss="alert"]')).not.toBeNull()
    expect(navigationDetails['close-button'].guidelines.join(' ')).toContain('focus restoration is not a close-button CSS feature')
  })
})
