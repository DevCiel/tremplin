import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { collectionExamples, collectionDetails, collectionClasses, collectionAccessibility, type CollectionTopic } from '../site/src/data/collection-disclosure-docs'
import { componentExample, componentDetail, documentedComponents } from '../site/src/data/component-reference'
import { ast, cssTree, sass, sassPin, sheet } from './helpers/pinned-sass'
import { approvedSass, prepareApprovedSass } from './helpers/approved-sass'
import { guideSource } from './helpers/guide-sass'

const topics: CollectionTopic[] = ['breadcrumb', 'list-group', 'pagination', 'collapse']
const reference = 'artifacts/bootstrap6-reference/' + sassPin.commit + '/'
const documentOf = (html: string) => new DOMParser().parseFromString(html, 'text/html')
const samples = (topic: CollectionTopic) => [collectionExamples[topic], ...collectionDetails[topic].variants.map(v => v.markup)]
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
const hasClass = (name: string) => {
  let escaped = name.replaceAll(':', '\\:')
  if (/^\d/.test(escaped)) escaped = '\\3' + escaped[0] + ' ' + escaped.slice(1)
  const needle = ('.' + escaped).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(needle + '(?![\\w-])').test(selectors)
}

describe('canonical collection and Collapse documentation', () => {
  for (const topic of topics) {
    it(topic + ': verifies raw MDX, actual classes/tokens and catalog semantics', () => {
      const manifest = JSON.parse(readFileSync(reference + 'reference-manifest.json', 'utf8')) as { commit: string; files: { path: string; sha: string }[] }
      expect(manifest.commit).toBe(sassPin.commit)
      const entry = manifest.files.find(f => f.path === 'site/src/content/docs/components/' + topic + '.mdx')!
      const bytes = readFileSync(reference + entry.path)
      expect(createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex')).toBe(entry.sha)
      for (const markup of samples(topic)) {
        const doc = documentOf(markup)
        for (const element of doc.querySelectorAll('[class]')) for (const className of element.classList) expect(hasClass(className), className).toBe(true)
        for (const token of markup.matchAll(/--trm-[\w-]+/g)) expect(properties.has(token[0]), token[0]).toBe(true)
        for (const button of doc.querySelectorAll('button')) expect(button.type).toBe('button')
        expect(doc.querySelectorAll('.cluster, .stack, .btn-primary, .btn-outline-primary, .text-muted, .list-group-horizontal-md, .list-group-item-success, .accordion-button, .collapsing')).toHaveLength(0)
      }
      const metadata = documentedComponents.find(c => c.name === topic)!
      expect(metadata.classes).toEqual(collectionClasses[topic])
      expect(metadata.accessibility).toBe(collectionAccessibility[topic])
      for (const className of metadata.classes) expect(hasClass(className), className).toBe(true)
    })

    it(topic + ': reaches the renderer without class/token alias translation', () => {
      const rendered = [componentExample(topic)!, ...componentDetail(topic)!.variants.map(v => v.markup)]
      for (let i = 0; i < rendered.length; i++) {
        const doc = documentOf(rendered[i]!), raw = documentOf(samples(topic)[i]!)
        expect((doc.querySelector('.demo-contrast') ?? doc.body).innerHTML.trim()).toBe(raw.body.innerHTML.trim())
      }
    })

    it(topic + ': compiles actual Sass overrides identically to the approved pin', () => {
      const source = guideSource(collectionDetails[topic].sass!)
      for (const token of source.matchAll(/--trm-[\w-]+/g)) expect(properties.has(token[0]), token[0]).toBe(true)
      const css = sass(source)
      expect(css.trim()).not.toBe('')
      expect(cssTree(css)).toBe(cssTree(approvedSass(source)))
    })
  }

  it('uses explicit hidden breadcrumb separators and exactly one current item', () => {
    for (const markup of samples('breadcrumb')) {
      const doc = documentOf(markup)
      expect(doc.querySelectorAll('ol.breadcrumb')).toHaveLength(1)
      expect(doc.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
      for (const divider of doc.querySelectorAll('.breadcrumb-divider')) expect(divider.getAttribute('aria-hidden')).toBe('true')
      for (const link of doc.querySelectorAll('a')) expect(link.classList.contains('breadcrumb-link')).toBe(true)
    }
    expect(collectionDetails.breadcrumb.sass).not.toMatch(/--trm-breadcrumb-(divider:|gap:)/)
  })

  it('uses container-prefixed list layout and native disabled/input state', () => {
    const doc = documentOf(samples('list-group').join('\n'))
    expect(doc.querySelector('.contains-inline > [class~="sm:list-group-horizontal"]')).not.toBeNull()
    expect(doc.querySelector('input.check[type="checkbox"]')).not.toBeNull()
    expect(doc.querySelectorAll('input.radio[name="list-mode"]')).toHaveLength(2)
    const disabled = doc.querySelector('a[aria-disabled="true"]')!
    expect(disabled.hasAttribute('href')).toBe(false)
    expect(disabled.getAttribute('tabindex')).toBe('-1')
    expect(doc.querySelector('button[disabled]')).not.toBeNull()
  })

  it('keeps pagination URLs/current context explicit and omits invented gap tokens', () => {
    for (const markup of samples('pagination')) {
      const doc = documentOf(markup)
      for (const nav of doc.querySelectorAll('nav')) expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
      for (const link of doc.querySelectorAll('a[href]')) expect(link.getAttribute('href')).toMatch(/^\/components\/pagination\/\?page=\d+$/)
      for (const disabled of doc.querySelectorAll('a[aria-disabled="true"]')) expect(disabled.hasAttribute('href')).toBe(false)
      for (const li of doc.querySelectorAll('ul > li')) expect(li.classList.contains('page-item')).toBe(true)
    }
    expect(collectionDetails.pagination.sass).not.toContain('--trm-pagination-gap')
  })

  it('resolves every Collapse target/control with unique IDs and padding on inner content', () => {
    const doc = documentOf(samples('collapse').join('\n'))
    const ids = [...doc.querySelectorAll('[id]')].map(e => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const trigger of doc.querySelectorAll('[data-trm-toggle="collapse"]')) {
      const selector = trigger.getAttribute('data-trm-target')!
      const targets = [...doc.querySelectorAll(selector)]
      expect(targets.length).toBeGreaterThan(0)
      expect(trigger.getAttribute('aria-controls')!.split(' ').sort()).toEqual(targets.map(t => t.id).sort())
    }
    for (const panel of doc.querySelectorAll('.collapse')) {
      expect(panel.className).not.toMatch(/(?:^|\s)p[xysetb]?-/)
      expect(panel.firstElementChild?.classList.contains('card-body')).toBe(true)
    }
    expect(doc.querySelector('#details')!.classList.contains('show')).toBe(false)
    expect(doc.querySelector('#collapse-open')!.classList.contains('show')).toBe(true)
    expect(collectionDetails.collapse.guidelines.join(' ')).toContain('calls during a transition are ignored rather than queued')
  })
})
