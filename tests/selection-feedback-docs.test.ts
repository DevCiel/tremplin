import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { selectionExamples, selectionDetails, selectionClasses, selectionAccessibility, toastDemoJavascript, type SelectionTopic } from '../site/src/data/selection-feedback-docs'
import { componentExample, componentDetail, documentedComponents } from '../site/src/data/component-reference'
import { ast, cssTree, sass, sassPin, sheet } from './helpers/pinned-sass'
import { approvedSass, prepareApprovedSass } from './helpers/approved-sass'
import { guideSource } from './helpers/guide-sass'

const topics: SelectionTopic[] = ['menu', 'tab', 'toast', 'scrollspy']
const documentOf = (html: string) => new DOMParser().parseFromString(html, 'text/html')
const samples = (topic: SelectionTopic) => [selectionExamples[topic], ...selectionDetails[topic].variants.map(v => v.markup)]
let selectors: string, properties: Set<string>
beforeAll(async () => {
  await prepareApprovedSass()
  const root = ast(sheet('tremplin')), rules: string[] = []
  properties = new Set()
  root.walkRules(rule => { rules.push(rule.selector) })
  root.walkDecls(decl => { properties.add(decl.prop) })
  selectors = rules.join('\n')
}, 90_000)
const hasClass = (name: string) => {
  let escaped = name.replaceAll(':', '\\:')
  if (/^\d/.test(escaped)) escaped = '\\3' + escaped[0] + ' ' + escaped.slice(1)
  const needle = ('.' + escaped).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(needle + '(?![\\w-])').test(selectors)
}
describe('canonical selection and feedback documentation', () => {
  for (const topic of topics) {
    it(topic + ': verifies immutable MDX, actual classes/tokens and catalog semantics', () => {
      const reference = 'artifacts/bootstrap6-reference/' + sassPin.commit + '/'
      const manifest = JSON.parse(readFileSync(reference + 'reference-manifest.json', 'utf8')) as { commit: string; files: { path: string; sha: string }[] }
      expect(manifest.commit).toBe(sassPin.commit)
      const entry = manifest.files.find(f => f.path === 'site/src/content/docs/components/' + (topic === 'toast' ? 'toasts' : topic) + '.mdx')!
      const bytes = readFileSync(reference + entry.path)
      expect(createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex')).toBe(entry.sha)
      for (const markup of samples(topic)) {
        const doc = documentOf(markup)
        for (const el of doc.querySelectorAll('[class]')) for (const name of el.classList) expect(hasClass(name), name).toBe(true)
        for (const token of markup.matchAll(/--trm-[\w-]+/g)) expect(properties.has(token[0]), token[0]).toBe(true)
        for (const button of doc.querySelectorAll('button')) expect(button.type).toBe('button')
        expect(doc.querySelectorAll('.stack, .cluster, .btn-primary, .rounded, .col-md-4, .col-md-8, .toast-region, .fade, .showing')).toHaveLength(0)
      }
      const metadata = documentedComponents.find(c => c.name === topic)!
      expect(metadata.classes).toEqual(selectionClasses[topic])
      expect(metadata.accessibility).toBe(selectionAccessibility[topic])
      for (const name of metadata.classes) expect(hasClass(name), name).toBe(true)
    })
    it(topic + ': renders raw authored markup without aliases', () => {
      const rendered = [componentExample(topic)!, ...componentDetail(topic)!.variants.map(v => v.markup)]
      expect(rendered).toEqual(samples(topic))
    })
    it(topic + ': compiles real Sass customization identically to the approved pin', () => {
      const source = guideSource(selectionDetails[topic].sass!)
      expect(cssTree(sass(source))).toBe(cssTree(approvedSass(source)))
    })
  }
  it('Menu uses real toggles for live examples and guards unavailable anchors', () => {
    const doc = documentOf(samples('menu').join('\n'))
    for (const toggle of doc.querySelectorAll('[data-trm-toggle="menu"]')) expect(doc.getElementById(toggle.getAttribute('aria-controls')!)).not.toBeNull()
    for (const a of doc.querySelectorAll('a[aria-disabled="true"]')) { expect(a.hasAttribute('href')).toBe(false); expect(a.getAttribute('tabindex')).toBe('-1') }
    expect(selectionAccessibility.menu).toContain('no typeahead')
    expect(selectionDetails.menu.guidelines.join(' ')).toContain('cancelable on the trigger')
    expect(doc.querySelector('#project-menu > .submenu > .menu-item')).not.toBeNull()
  })
  it('Tab explicitly pairs unique triggers/panels and preserves real RTL/disabled semantics', () => {
    const doc = documentOf(samples('tab').join('\n')), ids = [...doc.querySelectorAll('[id]')].map(e => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const tab of doc.querySelectorAll('[role="tab"]')) {
      const panel = doc.getElementById(tab.getAttribute('aria-controls')!)!
      expect(panel).not.toBeNull(); expect(panel.getAttribute('aria-labelledby')).toBe(tab.id)
      expect(panel.getAttribute('tabindex')).toBe('0')
      expect(tab.getAttribute('aria-selected')).toBe(String(tab.classList.contains('active')))
    }
    expect(doc.querySelector('[aria-orientation="vertical"]')).not.toBeNull()
    expect(doc.querySelector('[role="tab"][disabled]')).not.toBeNull()
    expect(selectionAccessibility.tab).toContain('not reversed for RTL')
  })
  it('Toast makes opt-in application showing, persistent regions and native dismissal explicit', () => {
    const doc = documentOf(samples('toast').join('\n'))
    expect(doc.querySelector('#demo-live-toast')!.classList.contains('show')).toBe(false)
    expect(doc.querySelector('#demo-live-toast')!.parentElement!.getAttribute('aria-live')).toBe('polite')
    expect(doc.querySelectorAll('[data-trm-toggle="toast"]')).toHaveLength(0)
    for (const button of doc.querySelectorAll('.btn-close')) { expect(button.textContent).toBe(''); expect(button.getAttribute('aria-label')).toBeTruthy(); expect(button.getAttribute('data-trm-dismiss')).toBe('toast') }
    expect(toastDemoJavascript).toContain('notification.show()')
    expect(selectionDetails.toast.guidelines.join(' ')).toContain('opt-in')
    expect(selectionClasses.toast).not.toContain('toast-region')
  })
  it('Scrollspy has real visible sections and fragments without invented aria-current or Sass', () => {
    const doc = documentOf(samples('scrollspy').join('\n')), ids = [...doc.querySelectorAll('[id]')].map(e => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(doc.querySelectorAll('[aria-current], .visually-hidden')).toHaveLength(0)
    for (const region of doc.querySelectorAll('[data-trm-spy="scroll"]')) {
      expect(region.getAttribute('tabindex')).toBe('0'); expect(region.getAttribute('role')).toBe('region'); expect(region.getAttribute('aria-label')).toBeTruthy()
      const nav = doc.querySelector(region.getAttribute('data-trm-target')!)!
      for (const link of nav.querySelectorAll('a[href]')) expect(region.contains(doc.getElementById(link.getAttribute('href')!.slice(1)))).toBe(true)
    }
    expect(selectionDetails.scrollspy.variables.length).toBeGreaterThan(0)
    expect(selectionDetails.scrollspy.variables.every(variable => !variable.name.startsWith('--trm-scrollspy-'))).toBe(true)
    expect(selectionDetails.scrollspy.sass).toContain("scss/nav'")
  })
})
