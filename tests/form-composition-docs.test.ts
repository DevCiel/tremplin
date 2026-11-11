import { compositionGuides, formsGuides } from './helpers/forms-mdx-contract'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { compositionDemoCss, compositionSass, compositionTokens, compositionTopics, localFormScript, validationScript } from '../site/src/data/form-composition-guides'

import { publishedFormsGuides as guides } from './helpers/forms-mdx-contract'
import { ast, cssTree, sass, sassPin, sheet } from './helpers/pinned-sass'
import { approvedSass, prepareApprovedSass } from './helpers/approved-sass'
import { guideSource } from './helpers/guide-sass'
import { assertDocumentationScope } from './helpers/documentation-scope'

const read = (file: string) => readFileSync(file, 'utf8')
const dom = (source: string) => new DOMParser().parseFromString(source, 'text/html')
let selectors = ''
beforeAll(async () => {
  await prepareApprovedSass()
  const rules: string[] = []
  ast(sheet('tremplin')).walkRules(rule => { rules.push(rule.selector) })
  selectors = rules.join('\n')
}, 90_000)
const hasClass = (name: string) => new RegExp(('.' + name.replaceAll(':', '\\:')).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w-])').test(selectors)

describe('pinned form composition documentation', () => {
  for (const topic of compositionTopics) {
    it(topic + ': immutable reference and guide identity', () => {
      const base = 'artifacts/bootstrap6-reference/' + sassPin.commit + '/'
      const path = 'site/src/content/docs/forms/' + topic + '.mdx'
      const bytes = readFileSync(base + path)
      const manifest = JSON.parse(read(base + 'reference-manifest.json')) as {files:{path:string;sha:string}[]}
      expect(createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex')).toBe(manifest.files.find(f => f.path === path)!.sha)
      const guide = compositionGuides[topic]
      expect(formsGuides.find(g => g.slug === guide.slug)).toBe(guide)
      expect(guides.find(g => g.slug === guide.slug)).toBe(guide)
      expect(guide.reference!.url).toBe('https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/forms/'+topic+'.mdx')
      expect(guide.description).toBe({ 'input-group':'Combine fields with contextual text and buttons without losing labels or reflow.', 'floating-labels':'Keep a visible label associated with a field while its position changes.', 'form-adorn':'Place contextual text around an editable field while keeping focus visible.', layout:'Arrange labels, controls, and actions with the responsive grid and spacing utilities.', validation:'Explain errors in text, associate feedback with fields, and provide a usable recovery path.' }[topic])
    })
    it(topic + ': real classes, unique IDs, names and exact copied examples', () => {
      const sections = compositionGuides[topic].sections
      const doc = dom(sections.map(s => s.example ?? '').join(''))
      const ids = [...doc.querySelectorAll('[id]')].map(el => el.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const section of sections) if (section.example) expect(section.code!.find(c => c.language === 'html')!.source).toBe(section.example)
      for (const el of doc.querySelectorAll('[class]')) for (const cls of el.classList) expect(hasClass(cls), cls).toBe(true)
      for (const control of doc.querySelectorAll('input:not([type="hidden"]),textarea,select')) expect(control.hasAttribute('aria-label') || !!doc.querySelector('label[for="' + control.id + '"]'), control.id).toBe(true)
      for (const el of doc.querySelectorAll('[aria-describedby],[aria-labelledby]')) for (const attr of ['aria-describedby','aria-labelledby']) for (const id of el.getAttribute(attr)?.split(' ') ?? []) expect(doc.getElementById(id), id).not.toBeNull()
      for (const button of doc.querySelectorAll('button')) expect(button.hasAttribute('type')).toBe(true)
      expect(doc.querySelector('.btn-primary,.form-check,.form-select,.was-validated,.col-md-6,.form-adorn-sm')).toBeNull()
    })
    it(topic + ': all Sass examples match the approved immutable source', () => {
      const samples = compositionGuides[topic].sections.flatMap(s => s.code ?? []).filter(c => c.language === 'scss')
      expect(samples.length).toBeGreaterThan(0)
      for (const sample of samples) {
        const source = guideSource(sample.source)
        expect(cssTree(sass(source))).toBe(cssTree(approvedSass(source)))
      }
    })
  }
  it('lists the complete 7 addon, 15 floating and 3 adorn defaults from actual maps', () => {
    for (const [topic, file, count] of [['input-group','_input-group',7],['floating-labels','_floating-labels',15],['form-adorn','_form-adorn',3]] as const) {
      const source = read('src/scss/forms/' + file + '.scss')
      expect(compositionTokens[topic]).toHaveLength(count)
      for (const token of compositionTokens[topic]) expect(source).toContain(token.name + ': ' + token.defaultValue)
    }
    const css = sass(guideSource(compositionSass['input-group']))
    expect(css).toContain('.input-group-sm'); expect(css).not.toContain('.input-group-lg')
    expect(sass(guideSource(compositionSass.validation))).toContain('.warning-feedback')
    expect(sass(guideSource(compositionSass.validation))).not.toContain(':user-warning')
  })
  it('uses label wrappers with a single ghost and hidden noninteractive adornments', () => {
    const doc = dom(compositionGuides['form-adorn'].sections.map(s => s.example ?? '').join(''))
    for (const wrapper of doc.querySelectorAll('.form-adorn')) {
      expect(wrapper.tagName).toBe('LABEL')
      expect(wrapper.querySelectorAll('.form-ghost')).toHaveLength(1)
      expect(wrapper.querySelector('button,a,label')).toBeNull()
      expect(wrapper.querySelector('[aria-hidden="true"]')).not.toBeNull()
    }
    expect(JSON.stringify(compositionGuides['form-adorn'])).toContain('not form-adorn-sm/lg')
  })
  it('keeps floating labels first, uses nonempty text placeholders and no unsupported selects', () => {
    const doc = dom(compositionGuides['floating-labels'].sections.map(s => s.example ?? '').join(''))
    for (const wrapper of doc.querySelectorAll('.form-floating')) {
      expect(wrapper.firstElementChild!.tagName).toBe('LABEL')
      const control = wrapper.querySelector('input,textarea,select')!
      if (['text','email','password'].includes(control.getAttribute('type') ?? 'text') && !control.hasAttribute('readonly') && control.tagName !== 'SELECT') expect(control.getAttribute('placeholder')).toBeTruthy()
    }
    expect(doc.querySelector('select[multiple],select[size],textarea[rows]')).toBeNull()
    expect(doc.querySelectorAll('.form-floating-always')).toHaveLength(2)
  })
  it('keeps application safety/recovery code explicit, copied and free from network/storage', () => {
    expect(() => new Function(validationScript)).not.toThrow()
    expect(() => new Function(localFormScript)).not.toThrow()
    expect(validationScript).not.toMatch(/fetch\(|XMLHttpRequest|localStorage|console\.|innerHTML/)
    expect(validationScript).toContain("field.setCustomValidity('')")
    expect(validationScript).toContain("form.addEventListener('reset'")
    expect(validationScript).toContain('field.focus()')
    for (const topic of ['layout','validation'] as const) {
      const guide = compositionGuides[topic]
      expect(guide.sections.flatMap(s => s.code ?? []).some(c => c.source === guide.clientScript)).toBe(true)
      const doc = dom(guide.sections.map(s => s.example ?? '').join(''))
      for (const form of doc.querySelectorAll('form')) {
        expect(form.querySelector('button[type="submit"][data-composition-submit][disabled]')).not.toBeNull()
        expect(form.hasAttribute('action')).toBe(false)
      }
    }
    for (const topic of compositionTopics) expect(compositionGuides[topic].sections.at(-1)!.code![0]!.source).toBe(compositionDemoCss)
  })
  it('scopes native success feedback independently from optional fields', () => {
    const section = compositionGuides.validation.sections.find(s => s.heading === 'Scoped native validity')!
    const doc = dom(section.example!)
    expect(doc.querySelector('#composition-native-required')!.closest('[data-trm-validate]')!.getAttribute('data-trm-validate')).toBe('valid')
    expect(doc.querySelector('#composition-native-optional')!.closest('[data-trm-validate]')).toBeNull()
    expect(localFormScript).toContain('form.checkValidity()')
  })
  it('preserves every protected source/config/API/distribution input', () => {
    const baseline = JSON.parse(read('tests/fixtures/documentation-scope/form-composition.json')) as { protectedInputs: Record<string,string> }
    assertDocumentationScope(baseline.protectedInputs)
  })
})
