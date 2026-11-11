import { nativeFormGuides, formsGuides } from './helpers/forms-mdx-contract'
import { createHash } from 'node:crypto'
import { assertDocumentationScope } from './helpers/documentation-scope'
import { readFileSync } from 'node:fs'
import { compileString } from 'sass'
import { beforeAll, describe, expect, it } from 'vitest'
import { nativeFormDemoCss, nativeFormSass, nativeFormTokens, nativeFormTopics, indeterminateDemoJavascript } from '../site/src/data/native-form-guides'

import { publishedFormsGuides as guides } from './helpers/forms-mdx-contract'
import { ast, sassPin, sheet } from './helpers/pinned-sass'
import { guideSource } from './helpers/guide-sass'

const read=(f:string)=>readFileSync(f,'utf8'),dom=(s:string)=>new DOMParser().parseFromString(s,'text/html')
const files={field:'_form-field','form-control':'_form-control',checkbox:'_check',radio:'_radio',switch:'_switch'}
let selectors:string
beforeAll(()=>{const rules:string[]=[];ast(sheet('tremplin')).walkRules(r=>{rules.push(r.selector)});selectors=rules.join('\n')},90_000)
const hasClass=(name:string)=>new RegExp(('.'+name.replaceAll(':','\\:')).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![\\w-])').test(selectors)
describe('source-verified native form guides',()=>{
  for(const topic of nativeFormTopics){
    it(topic+': immutable reference, route and title/search identity are retained',()=>{
      const guide=nativeFormGuides[topic],base='artifacts/bootstrap6-reference/'+sassPin.commit+'/',path='site/src/content/docs/forms/'+topic+'.mdx',bytes=readFileSync(base+path)
      const manifest=JSON.parse(read(base+'reference-manifest.json')) as {files:{path:string;sha:string}[]}
      expect(createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex')).toBe(manifest.files.find(f=>f.path===path)!.sha)
      expect(guide.reference!.url).toBe('https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/forms/'+topic+'.mdx')
      expect(formsGuides.find(g=>g.slug===guide.slug)).toBe(guide);expect(guides.find(g=>g.slug===guide.slug)).toBe(guide)
      expect(guide.description).toBe({field:'Group controls with labels, legends, descriptions, and validation feedback.','form-control':'Style text fields, textareas, native selects, files, and readonly values.',checkbox:'Use native checkboxes for independent choices and explicit consent.',radio:'Choose one option from a named group of native radio controls.',switch:'Present a native checkbox as an on/off preference with an explicit label.'}[topic])
    })
    it(topic+': all live/copied markup uses real classes, unique IDs and explicit associations',()=>{
      const sections=nativeFormGuides[topic].sections,doc=dom(sections.map(s=>s.example??'').join('')),ids=[...doc.querySelectorAll('[id]')].map(el=>el.id)
      expect(new Set(ids).size).toBe(ids.length)
      for(const section of sections)if(section.example)expect(section.code!.find(c=>c.language==='html')!.source).toBe(section.example)
      for(const el of doc.querySelectorAll('[class]'))for(const cls of el.classList)expect(hasClass(cls),cls).toBe(true)
      for(const el of doc.querySelectorAll('input,select,textarea'))expect(doc.querySelector('label[for="'+el.id+'"]'),el.id).not.toBeNull()
      for(const el of doc.querySelectorAll('[aria-describedby],[aria-labelledby]'))for(const attr of ['aria-describedby','aria-labelledby'])for(const id of el.getAttribute(attr)?.split(' ')??[])expect(doc.getElementById(id),id).not.toBeNull()
      expect(doc.querySelectorAll('.form-check,.form-check-input,.form-switch,.form-select,.btn-primary,form,button,[data-trm-toggle]')).toHaveLength(0)
      for(const el of doc.querySelectorAll('[role="switch"]'))expect(el.parentElement!.classList.contains('switch')).toBe(true)
    })
    it(topic+': map sample compiles against current source and defaults are source-derived',()=>{
      const css=compileString(guideSource(nativeFormSass[topic]),{loadPaths:[process.cwd()]}).css
      expect(css).toContain('@layer forms')
      if(topic==='form-control'){expect(css).toContain('.form-control-compact');expect(css).toContain('--trm-control-border-radius: 0.5rem');expect(css).toContain('--trm-btn-input-compact-min-height: 2.125rem')}
      if(topic==='field')expect(css).toContain('--trm-radius-7: 0.75rem')
      const source=read('src/scss/forms/'+files[topic]+'.scss')+read('src/scss/forms/_form-text.scss')
      for(const token of nativeFormTokens[topic])expect(source).toContain(token.name+':')
      if(topic==='radio'||topic==='switch')for(const token of nativeFormTokens[topic])expect(source).toContain(token.name+': '+token.defaultValue)
    })
  }
  it('has all 8/17 radio/switch defaults without changing the old token generator',()=>{
    expect(nativeFormTokens.radio).toHaveLength(8);expect(nativeFormTokens.switch).toHaveLength(17);expect(nativeFormTokens.checkbox).toHaveLength(15)
  })
  it('documents actual non-consumed tokens and the defaults-merged size-loop behavior',()=>{
    const check=JSON.stringify(nativeFormGuides.checkbox),control=JSON.stringify(nativeFormGuides['form-control'])
    expect(check).toContain('not consumed');expect(check).toContain('33%');expect(check).toContain('without an active selector')
    expect(control).toContain('$form-label-tokens is declared but not emitted');expect(control).toContain('false value is still iterated')
    expect(read('src/scss/forms/_check.scss')).toContain('border-radius: 33%')
    expect(read('src/scss/forms/_labels.scss')).not.toContain('@include tokens(')
  })
  it('keeps native radio groups exclusive, cards named, and overhead title non-label',()=>{
    const doc=dom(nativeFormTopics.flatMap(t=>nativeFormGuides[t].sections.map(s=>s.example??'')).join('')),groups=new Map<string,Element[]>()
    for(const input of doc.querySelectorAll('[type="radio"][name]')){const name=input.getAttribute('name')!;groups.set(name,[...groups.get(name)??[],input])}
    for(const group of groups.values())expect(group.filter(el=>el.hasAttribute('checked')).length).toBeLessThanOrEqual(1)
    expect(doc.querySelector('#native-field-overhead-title')!.tagName).toBe('P')
    expect(doc.querySelector('#native-plan-basic')!.closest('fieldset')!.querySelector('legend')!.textContent).toContain('project plan')
  })
  it('runs only the shown application indeterminate setup, with no backend or runtime plugin',()=>{
    expect(()=>new Function(indeterminateDemoJavascript)).not.toThrow();expect(indeterminateDemoJavascript).not.toMatch(/fetch\(|XMLHttpRequest|\.value|localStorage|console\.|innerHTML/)
    expect(nativeFormGuides.checkbox.clientScript).toBe(indeterminateDemoJavascript)
    expect(nativeFormGuides.checkbox.sections.flatMap(s=>s.code??[]).filter(c=>c.language==='js').map(c=>c.source)).toEqual([indeterminateDemoJavascript])
    for(const topic of ['field','form-control','radio','switch'] as const)expect(nativeFormGuides[topic].clientScript).toBeUndefined()
    const doc=dom(nativeFormGuides.checkbox.sections.map(s=>s.example??'').join(''));expect(doc.querySelectorAll('[data-native-indeterminate]')).toHaveLength(2)
    expect(nativeFormDemoCss).toContain('form-control-plaintext:focus-visible');expect(nativeFormDemoCss).toContain('left .75rem center')
  })
  it('leaves all 55 protected inputs unchanged',()=>{
    const before=JSON.parse(read('tests/fixtures/documentation-scope/native-forms.json')) as {protectedInputs:Record<string,string>}
    expect(Object.keys(before.protectedInputs)).toHaveLength(55)
    assertDocumentationScope(before.protectedInputs)
  })
})
