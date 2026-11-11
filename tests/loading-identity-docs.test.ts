import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { loadingExamples, loadingDetails, loadingClasses, loadingAccessibility, type LoadingTopic } from '../site/src/data/loading-identity-docs'
import { componentExample, componentDetail, documentedComponents } from '../site/src/data/component-reference'
import { ast, cssTree, sass, sassPin, sheet } from './helpers/pinned-sass'
import { approvedSass, prepareApprovedSass } from './helpers/approved-sass'
import { guideSource } from './helpers/guide-sass'

const topics: LoadingTopic[] = ['progress', 'spinner', 'skeleton', 'avatar']
const documentOf = (html: string) => new DOMParser().parseFromString(html, 'text/html')
const samples = (topic: LoadingTopic) => [loadingExamples[topic], ...loadingDetails[topic].variants.map(v => v.markup)]
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
describe('canonical loading and identity documentation', () => {
  for (const topic of topics) {
    it(topic + ': verifies immutable MDX, actual classes/tokens and catalog semantics', () => {
      const reference = 'artifacts/bootstrap6-reference/' + sassPin.commit + '/'
      const manifest = JSON.parse(readFileSync(reference + 'reference-manifest.json', 'utf8')) as { commit: string; files: { path: string; sha: string }[] }
      expect(manifest.commit).toBe(sassPin.commit)
      const entry = manifest.files.find(f => f.path === 'site/src/content/docs/components/' + (topic === 'skeleton' ? 'placeholder' : topic) + '.mdx')!
      const bytes = readFileSync(reference + entry.path)
      expect(createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex')).toBe(entry.sha)
      for (const markup of samples(topic)) {
        const doc = documentOf(markup)
        for (const el of doc.querySelectorAll('[class]')) for (const name of el.classList) expect(hasClass(name), name).toBe(true)
        for (const token of markup.matchAll(/--trm-[\w-]+/g)) expect(properties.has(token[0]), token[0]).toBe(true)
        for (const button of doc.querySelectorAll('button')) expect(button.type).toBe('button')
        expect(doc.querySelectorAll('.stack, .cluster, .btn-primary, .rounded, .col-md-4, .col-md-8, .skeleton, .avatar-group, .avatar-square, .avatar-link, .avatar-wrapper, .spinner-border-sm, .spinner-grow-sm')).toHaveLength(0)
      }
      const metadata = documentedComponents.find(c => c.name === topic)!
      expect(metadata.classes).toEqual(loadingClasses[topic])
      expect(metadata.accessibility).toBe(loadingAccessibility[topic])
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
      const source = guideSource(loadingDetails[topic].sass!)
      expect(cssTree(sass(source))).toBe(cssTree(approvedSass(source)))
    })
  }

  it('Progress keeps determinate values and stacked wrapper widths aligned', () => {
    const doc = documentOf(samples('progress').join('\n'))
    for (const root of doc.querySelectorAll('[role="progressbar"]')) {
      expect(root.getAttribute('aria-label') || doc.getElementById(root.getAttribute('aria-labelledby')!)?.textContent).toBeTruthy()
      if (!root.hasAttribute('aria-valuenow')) continue
      const value = Number(root.getAttribute('aria-valuenow'))
      expect(root.getAttribute('aria-valuemin')).toBe('0')
      expect(root.getAttribute('aria-valuemax')).toBe('100')
      const sized = root.parentElement?.classList.contains('progress-stacked') ? root : root.firstElementChild!
      expect((sized as HTMLElement).style.width || (sized.classList.contains('w-75') ? '75%' : '')).toBe(value + '%')
    }
    expect(doc.querySelector('#allocation-progress')!.hasAttribute('role')).toBe(false)
    expect(doc.querySelectorAll('#allocation-progress > .progress[role="progressbar"]')).toHaveLength(2)
    expect(doc.querySelectorAll('[role="progressbar"]:not([aria-valuenow])')).toHaveLength(1)
  })
  it('Spinner uses supported shared size, actual token maps and named status', () => {
    const doc = documentOf(samples('spinner').join('\n'))
    for (const el of doc.querySelectorAll('.spinner-border,.spinner-grow,.spinner-rotate')) {
      expect(el.getAttribute('aria-hidden') === 'true' || el.querySelector('.visually-hidden')?.textContent).toBeTruthy()
    }
    expect(doc.querySelector('button[disabled]')!.getAttribute('aria-label')).toBe('Saving project...')
    expect(loadingDetails.spinner.sass).toContain('$spinner-border-tokens')
    expect(loadingDetails.spinner.sass).toContain('$spinner-grow-tokens')
    expect(loadingDetails.spinner.guidelines.join(' ')).toContain('1.5s')
    expect(loadingDetails.spinner.guidelines.join(' ')).toContain('no automatic reduced-motion')
  })
  it('Placeholder hides shapes and separates status from busy regions without focusable hidden controls', () => {
    const doc = documentOf(samples('skeleton').join('\n'))
    for (const shape of doc.querySelectorAll('.placeholder')) expect(shape.closest('[aria-hidden="true"]')).not.toBeNull()
    expect(doc.querySelectorAll('[aria-busy="true"] [role="status"]')).toHaveLength(0)
    expect(doc.querySelectorAll('[aria-hidden="true"] a[href], [aria-hidden="true"] button:not([disabled])')).toHaveLength(0)
    expect(doc.querySelectorAll('.skeleton, [data-trm-toggle="placeholder"]')).toHaveLength(0)
    expect(componentExample('placeholder')).toBe(componentExample('skeleton'))
    expect(componentDetail('placeholder')).toBe(componentDetail('skeleton'))
  })
  it('Avatar names initials, image identities and statuses without invented controls', () => {
    const doc = documentOf(samples('avatar').join('\n'))
    for (const img of doc.querySelectorAll('img')) {
      expect(img.getAttribute('alt')).toBeTruthy()
      expect(img.getAttribute('src')).toBe('/img/avatar-demo.svg')
      expect(img.hasAttribute('width') && img.hasAttribute('height')).toBe(true)
    }
    for (const el of doc.querySelectorAll('[role="img"]')) expect(el.getAttribute('aria-label')).toBeTruthy()
    for (const el of doc.querySelectorAll('.avatar-status')) expect(el.getAttribute('role')).toBe('img')
    expect(doc.querySelectorAll('.avatar-stack-xl > .avatar')).toHaveLength(4)
    expect(doc.querySelector('a[href="/components/"] .avatar')!.getAttribute('aria-hidden')).toBe('true')
    expect(doc.querySelectorAll('[tabindex], [data-trm-toggle]')).toHaveLength(0)
    expect(loadingDetails.avatar.guidelines.join(' ')).toContain('physical margin-left')
  })
})

