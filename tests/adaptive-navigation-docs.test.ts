import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { adaptiveExamples, adaptiveDetails, adaptiveClasses, adaptiveAccessibility, adaptiveRuntimeEvent, adaptiveEventDescriptions, navbarFocusJavascript, togglerOptionRows, type AdaptiveTopic } from '../site/src/data/adaptive-navigation-docs'
import { componentExample, componentDetail, documentedComponents } from '../site/src/data/component-reference'
import { ast, cssTree, sass, sassPin, sheet } from './helpers/pinned-sass'
import { approvedSass, prepareApprovedSass } from './helpers/approved-sass'
import { guideSource } from './helpers/guide-sass'

const topics: AdaptiveTopic[] = ['navbar', 'nav-overflow', 'toggler']
const documentOf = (html: string) => new DOMParser().parseFromString(html, 'text/html')
const samples = (topic: AdaptiveTopic) => [adaptiveExamples[topic], ...adaptiveDetails[topic].variants.map(v => v.markup)]
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
  return new RegExp(needle + '(?![\\w-])').test(selectors) || (['nav-overflow-keep','nav-overflow-toggle','nav-overflow-menu'].includes(name) && readFileSync('src/js/nav-overflow.ts','utf8').includes(name))
}
describe('canonical adaptive and identity documentation', () => {
  for (const topic of topics) {
    it(topic + ': verifies immutable MDX, actual classes/tokens and catalog semantics', () => {
      const reference = 'artifacts/bootstrap6-reference/' + sassPin.commit + '/'
      const manifest = JSON.parse(readFileSync(reference + 'reference-manifest.json', 'utf8')) as { commit: string; files: { path: string; sha: string }[] }
      expect(manifest.commit).toBe(sassPin.commit)
      const entry = manifest.files.find(f => f.path === 'site/src/content/docs/components/' + topic + '.mdx')!
      const bytes = readFileSync(reference + entry.path)
      expect(createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex')).toBe(entry.sha)
      for (const markup of samples(topic)) {
        const doc = documentOf(markup)
        for (const el of doc.querySelectorAll('[class]')) for (const name of el.classList) expect(hasClass(name), name).toBe(true)
        for (const token of markup.matchAll(/--trm-[\w-]+/g)) expect(properties.has(token[0]), token[0]).toBe(true)
        for (const button of doc.querySelectorAll('button')) { expect(['button','submit']).toContain(button.type); if (button.type === 'submit') expect(button.closest('form')).not.toBeNull() }
        expect(doc.querySelectorAll('.stack, .cluster, .btn-primary, .rounded, .col-md-4, .col-md-8, .skeleton, .avatar-group, .avatar-square, .avatar-link, .avatar-wrapper, .spinner-border-sm, .spinner-grow-sm')).toHaveLength(0)
      }
      const metadata = documentedComponents.find(c => c.name === topic)!
      expect(metadata.classes).toEqual(adaptiveClasses[topic])
      expect(metadata.accessibility).toBe(adaptiveAccessibility[topic])
      for (const name of metadata.classes) expect(hasClass(name), name).toBe(true)
    })
    it(topic + ': renders raw authored markup without aliases', () => {
      const rendered = [componentExample(topic)!, ...componentDetail(topic)!.variants.map(v => v.markup)]
      for (let i = 0; i < rendered.length; i++) {
        const doc = documentOf(rendered[i]!), raw = documentOf(samples(topic)[i]!)
        expect((doc.querySelector('.demo-contrast') ?? doc.body).innerHTML.trim()).toBe(raw.body.innerHTML.trim())
      }
    })
    it(topic + ': uses real Sass customization or an explicitly JS-only contract', () => {
      if (topic === 'toggler') { expect(adaptiveDetails.toggler.sass).toBeUndefined(); expect(adaptiveDetails.toggler.variables).toEqual([]); expect(adaptiveClasses.toggler).toEqual([]); return }
      const source = guideSource(adaptiveDetails[topic].sass!)
      expect(cssTree(sass(source))).toBe(cssTree(approvedSass(source)))
    })
  }


  it('Navbar authors native named dialogs, explicit focus and container prefixes', () => {
    const doc=documentOf(samples('navbar').join('\n'))
    const ids=[...doc.querySelectorAll('[id]')].map(e=>e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for(const trigger of doc.querySelectorAll('[data-trm-toggle="drawer"]')) {
      const panel=doc.querySelector(trigger.getAttribute('data-trm-target')!)!
      expect(panel.tagName).toBe('DIALOG')
      expect(doc.getElementById(panel.getAttribute('aria-labelledby')!)).not.toBeNull()
      expect(panel.querySelector('button[autofocus][data-trm-dismiss="drawer"]')).not.toBeNull()
      expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
      expect(trigger.hasAttribute('aria-expanded')).toBe(false)
    }
    expect([...doc.querySelectorAll('nav')].some(e=>e.classList.contains('sm:navbar-expand'))).toBe(true)
    expect(doc.querySelectorAll('nav[aria-label]')).toHaveLength(doc.querySelectorAll('nav').length)
    expect(adaptiveDetails.navbar.sass).toContain('$navbar-dark-tokens')
    expect(() => new Function(navbarFocusJavascript)).not.toThrow()
    expect(navbarFocusJavascript).toContain('shown.trm.drawer')
    expect(navbarFocusJavascript).toContain(':modal')
    expect(navbarFocusJavascript).toContain('focus({ preventScroll: true })')
  })
  it('NavOverflow uses actual wrappers and retains original menu/input identities', () => {
    const doc=documentOf(samples('nav-overflow').join('\n'))
    const ids=[...doc.querySelectorAll('[id]')].map(e=>e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for(const root of doc.querySelectorAll('[data-trm-toggle="nav-overflow"]')) {
      expect(root.querySelector(':scope > .nav > .nav-item > .nav-link')).not.toBeNull()
      expect(root.getAttribute('aria-label')).toBeTruthy()
    }
    expect(doc.querySelector('#submenu-navigation #overflow-tools #overflow-note')).not.toBeNull()
    expect(doc.querySelector('#authored-navigation .nav-overflow-toggle')!.getAttribute('aria-label')).toBe('More project links')
    expect(adaptiveDetails['nav-overflow'].variables).toEqual([])
    expect(adaptiveDetails['nav-overflow'].guidelines.join(' ')).toContain('A11Y-001')
    expect(adaptiveDetails['nav-overflow'].guidelines.join(' ')).toContain('does not dispatch update')
  })
  it('Toggler targets carry configuration without invented disclosure behavior', () => {
    const doc=documentOf(samples('toggler').join('\n'))
    const ids=[...doc.querySelectorAll('[id]')].map(e=>e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for(const trigger of doc.querySelectorAll('[data-trm-toggle="toggler"]')) {
      expect(trigger.tagName).toBe('BUTTON')
      const targets=doc.querySelectorAll(trigger.getAttribute('data-trm-target')!)
      expect(targets.length).toBeGreaterThan(0)
      for(const target of targets) expect(target.hasAttribute('data-trm-value')).toBe(true)
    }
    expect(doc.querySelectorAll('[aria-expanded], [data-trm-dismiss="toggler"], [data-trm-class-name]')).toHaveLength(0)
    expect(doc.querySelector('#toggler-fieldset')!.getAttribute('data-trm-attribute')).toBe('disabled')
    expect(doc.querySelector('#null-toggler')!.getAttribute('data-trm-value')).toBe('null')
    expect(togglerOptionRows.map(row=>row.name)).toEqual(['attribute','value'])
    expect(togglerOptionRows.map(row=>row.defaultValue)).toEqual(['class','null (unset)'])
  })
  it('Event presentation corrects scanner suffixes without changing frozen metadata', () => {
    expect(adaptiveRuntimeEvent('update.trm.nav-overflow')).toBe('update.trm.navoverflow')
    expect(adaptiveEventDescriptions['update.trm.navoverflow']).toContain('ResizeObserver does not dispatch')
    expect(adaptiveEventDescriptions['resize.trm.navoverflow']).toContain('Internal')
    expect(adaptiveEventDescriptions['toggled.trm.toggler']).toContain('no-ops')
    const api=JSON.parse(readFileSync('metadata/api.json','utf8')) as {components:{name:string;events:string[]}[]}
    expect(api.components.find(c=>c.name==='nav-overflow')!.events).toContain('update.trm.nav-overflow')
  })
})
