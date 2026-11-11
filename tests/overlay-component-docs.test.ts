import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { overlayExamples, overlayDetails, overlayClasses, overlayAccessibility, type OverlayTopic } from '../site/src/data/overlay-component-docs'
import { componentExample, componentDetail, documentedComponents } from '../site/src/data/component-reference'
import { ast, cssTree, sass, sassPin, sheet } from './helpers/pinned-sass'
import { approvedSass, prepareApprovedSass } from './helpers/approved-sass'
import { guideSource } from './helpers/guide-sass'

const topics: OverlayTopic[] = ['dialog', 'drawer', 'tooltip', 'popover']
const documentOf = (html: string) => new DOMParser().parseFromString(html, 'text/html')
const samples = (topic: OverlayTopic) => [overlayExamples[topic], ...overlayDetails[topic].variants.map(v => v.markup)]
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
describe('canonical overlay documentation', () => {
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
        for (const button of doc.querySelectorAll('button')) expect(button.type).toBe('button')
        expect(doc.querySelectorAll('.stack, .cluster, .btn-primary, .rounded, .col-md-4, .col-md-8, .toast-region, .fade, .showing')).toHaveLength(0)
      }
      const metadata = documentedComponents.find(c => c.name === topic)!
      expect(metadata.classes).toEqual(overlayClasses[topic])
      expect(metadata.accessibility).toBe(overlayAccessibility[topic])
      for (const name of metadata.classes) expect(hasClass(name), name).toBe(true)
    })
    it(topic + ': renders raw authored markup without aliases', () => {
      const rendered = [componentExample(topic)!, ...componentDetail(topic)!.variants.map(v => v.markup)]
      for (let i = 0; i < rendered.length; i++) {
        const doc = documentOf(rendered[i]!), raw = documentOf(samples(topic)[i]!)
        expect((doc.querySelector('.demo-contrast') ?? doc.body).innerHTML.trim()).toBe(raw.body.innerHTML.trim())
      }
    })
    it(topic + ': compiles real Sass customization identically to the approved pin', () => {
      const source = guideSource(overlayDetails[topic].sass!)
      expect(cssTree(sass(source))).toBe(cssTree(approvedSass(source)))
    })
  }
  it('Dialog uses named native panels, real targets and deliberate initial focus', () => {
    const doc = documentOf(samples('dialog').join('\n'))
    const ids = [...doc.querySelectorAll('[id]')].map(e => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const trigger of doc.querySelectorAll('[data-trm-toggle="dialog"]')) expect(doc.querySelector(trigger.getAttribute('data-trm-target')!)?.tagName).toBe('DIALOG')
    for (const panel of doc.querySelectorAll('dialog.dialog')) {
      expect(doc.getElementById(panel.getAttribute('aria-labelledby')!)).not.toBeNull()
      expect(panel.querySelector('button[autofocus][data-trm-dismiss="dialog"]')).not.toBeNull()
      expect(panel.hasAttribute('open')).toBe(false)
    }
    expect(overlayDetails.dialog.guidelines.join(' ')).toContain('cancelable starts')
  })
  it('Drawer uses native panels, supported placement/responsive classes and root configuration', () => {
    const doc = documentOf(samples('drawer').join('\n'))
    for (const trigger of doc.querySelectorAll('[data-trm-toggle="drawer"]')) {
      const panel = doc.querySelector(trigger.getAttribute('data-trm-target')!)!
      expect(panel.tagName).toBe('DIALOG')
      expect(panel.className).toMatch(/drawer-(start|end|top|bottom|fullscreen)/)
    }
    expect(doc.querySelectorAll('section.drawer, .drawer-sm, .drawer-lg, .bottom-sheet, .bottom-sheet-handle')).toHaveLength(0)
    expect(doc.querySelector('#drawer-nonmodal')!.getAttribute('data-trm-scroll')).toBe('true')
    expect(doc.querySelector('#drawer-nonmodal')!.getAttribute('data-trm-backdrop')).toBe('false')
    expect(doc.querySelector('#drawer-responsive')!.classList.contains('lg:drawer')).toBe(true)
  })
  it('Tooltip uses actual placement names, named disabled wrapper and enabled sanitization', () => {
    const doc = documentOf(samples('tooltip').join('\n'))
    for (const trigger of doc.querySelectorAll('[data-trm-toggle="tooltip"]')) {
      expect(trigger.getAttribute('data-trm-title')).toBeTruthy()
      expect(trigger.getAttribute('data-trm-placement') ?? '').not.toMatch(/^(start|end)$/)
      expect(trigger.hasAttribute('data-trm-sanitize')).toBe(false)
    }
    expect(doc.querySelector('[role="button"][tabindex="0"][aria-disabled="true"]')!.getAttribute('aria-label')).toBeTruthy()
    expect(doc.querySelector('#tooltip-dark-container [data-trm-container]')!.getAttribute('data-trm-container')).toBe('#tooltip-dark-container')
    expect(overlayDetails.tooltip.guidelines.join(' ')).toContain('explicitly initialize')
  })
  it('Popover separates click/focus dismissal and does not promise modal or expanded state', () => {
    const doc = documentOf(samples('popover').join('\n'))
    expect(doc.querySelector('#focus-popover')!.getAttribute('data-trm-trigger')).toBe('focus')
    expect(doc.querySelectorAll('[data-trm-placement="start"], [data-trm-placement="end"], [aria-expanded], [data-trm-sanitize]')).toHaveLength(0)
    expect(doc.querySelector('.popover[role="tooltip"]')).not.toBeNull()
    expect(overlayAccessibility.popover).toContain('does not automatically dismiss on an outside click')
    expect(overlayDetails.popover.guidelines.join(' ')).toContain('focus-trigger policy')
  })
})
