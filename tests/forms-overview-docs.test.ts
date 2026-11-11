import { formsGuides, formsOverviewGuide } from './helpers/forms-mdx-contract'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { compileString } from 'sass'
import { beforeAll, describe, expect, it } from 'vitest'

import { formsClasses, formsAccessibility, formsDemoCss, formsDemoJavascript, formsDetails, formsExample, formsSass, sharedFormTokens } from '../site/src/data/forms-overview-docs'
import { componentDetail, componentExample, componentReference, documentedComponents } from '../site/src/data/component-reference'
import { publishedFormsGuides as guides } from './helpers/forms-mdx-contract'
import { ast, sassPin, sheet } from './helpers/pinned-sass'
import { guideSource } from './helpers/guide-sass'
import { assertDocumentationScope } from './helpers/documentation-scope'

const read=(f:string)=>readFileSync(f,'utf8'),dom=(s:string)=>new DOMParser().parseFromString(s,'text/html')
const componentSamples=()=>[formsExample,...formsDetails.variants.map(v=>v.markup)]
const overviewSamples=()=>formsOverviewGuide.sections.flatMap(s=>s.example?[s.example]:[])
let selectors:string
beforeAll(()=>{const rules:string[]=[];ast(sheet('tremplin')).walkRules(r=>{rules.push(r.selector)});selectors=rules.join('\n')},90_000)
const hasClass=(name:string)=>{const css=name.replaceAll(':','\\:');return new RegExp(('.'+css).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![\\w-])').test(selectors)}

describe('source-derived Forms overview and composition documentation',()=>{
  it('verifies the immutable overview MDX blob and both official reference links',()=>{
    const base='artifacts/bootstrap6-reference/'+sassPin.commit+'/',path='site/src/content/docs/forms/overview.mdx',bytes=readFileSync(base+path)
    const manifest=JSON.parse(read(base+'reference-manifest.json')) as {files:{path:string;sha:string}[]}
    expect(createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex')).toBe(manifest.files.find(f=>f.path===path)!.sha)
    expect(formsOverviewGuide.reference!.url).toBe('https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/forms/overview.mdx')
    expect(componentReference('forms')).toBe('https://github.com/DevCiel/tremplin/blob/main/src/scss/forms/index.scss')
    const headings=formsOverviewGuide.sections.map(s=>s.heading);expect(headings.indexOf('Overview')).toBeLessThan(headings.indexOf('Disabled forms'));expect(headings.indexOf('Accessibility')).toBeLessThan(headings.indexOf('CSS'))
  })
  it('uses real catalog classes, CSS classification and the shared docs module',()=>{
    const metadata=documentedComponents.find(c=>c.name==='forms')!
    expect(metadata.classes).toEqual(formsClasses);expect(metadata.accessibility).toBe(formsAccessibility);expect(metadata.kind).toBe('css')
    expect(componentExample('forms')).toBe(formsExample);expect(componentDetail('forms')).toBe(formsDetails)
    expect(formsGuides[0]).toBe(formsOverviewGuide);expect(guides.find(g=>g.slug==='forms/overview')).toBe(formsOverviewGuide)
    for(const name of formsClasses)expect(hasClass(name),name).toBe(true)
  })
  for(const [name,samples] of [['component',componentSamples],['overview',overviewSamples]] as const){
    it(name+': every authored class is current, IDs/labels/help targets are valid',()=>{
      const doc=dom(samples().join('\n')),ids=[...doc.querySelectorAll('[id]')].map(el=>el.id)
      expect(new Set(ids).size).toBe(ids.length)
      for(const el of doc.querySelectorAll('[class]'))for(const cls of el.classList)expect(hasClass(cls),cls).toBe(true)
      for(const el of doc.querySelectorAll('input,select,textarea'))expect(doc.querySelector('label[for="'+el.id+'"]'),el.id).not.toBeNull()
      for(const el of doc.querySelectorAll('[aria-describedby]'))for(const id of el.getAttribute('aria-describedby')!.split(' '))expect(doc.getElementById(id),id).not.toBeNull()
      for(const link of doc.querySelectorAll('a[href^="#"]'))expect(doc.querySelector(link.getAttribute('href')!)).not.toBeNull()
      expect(doc.querySelectorAll('.form-select,.form-check,.form-check-input,.form-check-label,.form-switch,.form-label-required,.error-summary,.stack,.was-validated')).toHaveLength(0)
    })
  }
  it('documents all 39 shared root-form properties without inventing a Forms map',()=>{
    const source=read('src/scss/_root.scss').split('// scss-docs-start root-form-variables')[1]!.split('// scss-docs-end root-form-variables')[0]!
    const names=[...source.matchAll(/(--trm-[\w-]+):/g)].map(m=>m[1])
    expect(sharedFormTokens.map(t=>t.name)).toEqual(names);expect(names).toHaveLength(39)
    expect(formsOverviewGuide.sections.find(s=>s.heading==='CSS')!.table!.rows).toHaveLength(39)
    expect(formsDetails.guidelines.join(' ')).toContain('Input group uses components')
    for(const token of formsDetails.variables)expect(read('src/scss/_root.scss')+read('src/scss/forms/_form-control.scss')+read('src/scss/forms/_form-text.scss')+read('src/scss/forms/_floating-labels.scss')+read('src/scss/forms/_input-group.scss')).toContain(token.name)
  })
  it('compiles the actual root and control maps before full first load',()=>{
    const css=compileString(guideSource(formsSass),{loadPaths:[process.cwd()]}).css
    expect(css).toContain('--trm-btn-input-padding-x: 0.875rem');expect(css).toContain('--trm-control-border-radius: 0.75rem')
    expect(css).toContain('@layer forms');expect(css).toContain('@layer components')
  })
  it('keeps native disabled/readonly, switch wrappers, radio names and label-first floating composition',()=>{
    const doc=dom(componentSamples().join(''))
    expect(doc.querySelector('#forms-state-readonly')!.hasAttribute('readonly')).toBe(true);expect(doc.querySelector('#forms-state-disabled')!.hasAttribute('disabled')).toBe(true)
    for(const el of doc.querySelectorAll('[role="switch"]')){expect(el.getAttribute('type')).toBe('checkbox');expect(el.parentElement!.classList.contains('switch')).toBe(true)}
    expect([...doc.querySelectorAll('[type="radio"]')].map(el=>el.getAttribute('name'))).toEqual(['forms-choice-billing','forms-choice-billing'])
    const input=doc.querySelector('#forms-composition-workspace')!;expect(input.previousElementSibling!.getAttribute('for')).toBe(input.id)
    expect(doc.querySelector('#forms-composition-path')!.getAttribute('aria-describedby')).toBe('forms-composition-prefix')
  })
  it('copies and executes the same bounded handler and scoped contrast CSS',()=>{
    expect(()=>new Function(formsDemoJavascript)).not.toThrow();expect(formsDemoJavascript).not.toMatch(/fetch\(|XMLHttpRequest|localStorage|console\.|innerHTML|\.value|JSON\.stringify/)
    expect(formsDemoJavascript).toContain('new FormData(form).keys()');expect(formsDemoJavascript).toContain('event.preventDefault()');expect(formsDemoJavascript).toContain('summary.focus()')
    expect(formsOverviewGuide.clientScript).toBe(formsDemoJavascript);expect(formsOverviewGuide.sections.at(-1)!.code!.map(c=>c.source)).toEqual([formsDemoCss,formsDemoJavascript])
    const template=read('site/src/pages/components/[slug].astro');expect(template).toContain('set:html={formsDemoJavascript}')
    expect(read('site/src/content/docs/components/forms.mdx')).toContain('<Code source={formsDemoJavascript} standalone={true} plain={true} label="Copy Forms application demo handler" />')
    expect(read('site/src/components/component/Code.astro')).toContain('<code>{source}</code>')
    expect(formsDemoCss).toContain('[data-docs-forms]');expect(read('site/src/components/PageMeta.astro')).toContain("['/forms/overview/','/components/forms/'].includes(pathname)")
  })
  it('keeps local actions disabled in authored markup until their handler is attached',()=>{
    const doc=dom([...componentSamples(),...overviewSamples()].join(''))
    for(const button of doc.querySelectorAll('[data-docs-forms-submit],[data-docs-forms-inspect]'))expect(button.hasAttribute('disabled')).toBe(true)
    for(const form of doc.querySelectorAll('[data-docs-forms-validation]')){expect(form.hasAttribute('novalidate')).toBe(true);expect(form.querySelector('[data-docs-forms-summary]')!.hasAttribute('hidden')).toBe(true)}
  })
  it('preserves every existing Forms topic and the overview search description',()=>{
    expect(formsGuides).toHaveLength(17)
    expect(formsOverviewGuide.description).toBe('Build accessible forms from native controls, explicit labels, and deliberate layouts.')
    const topics=dom(formsOverviewGuide.sections.find(s=>s.heading==='Choose a form topic')!.paragraphs!.join(''))
    for(const guide of formsGuides.slice(1))expect(topics.querySelector('a[href="/'+guide.slug+'/"]'),guide.slug).not.toBeNull()
  })
  it('leaves 55 protected implementation, distribution, API, security and profile inputs unchanged',()=>{
    const before=JSON.parse(read('tests/fixtures/documentation-scope/forms-overview.json')) as {protectedInputs:Record<string,string>}
    expect(Object.keys(before.protectedInputs)).toHaveLength(55)
    assertDocumentationScope(before.protectedInputs)
  })
})
