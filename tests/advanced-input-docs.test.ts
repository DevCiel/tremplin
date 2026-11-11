import { advancedFormsGuides } from './helpers/forms-mdx-contract'
import { createHash } from 'node:crypto'
import { assertDemoModule, assertDocumentationScope } from './helpers/documentation-scope'
import { readFileSync } from 'node:fs'
import { compileString } from 'sass'
import { beforeAll, describe, expect, it } from 'vitest'
import { advancedAccessibility, advancedApiJavascript, advancedClasses, advancedDemoJavascript, advancedDetails, advancedEvents, advancedExamples, advancedFormsTopic, advancedOptionRows, advancedRuntimeEvent, advancedTopics, type AdvancedTopic } from '../site/src/data/advanced-input-docs'
import { componentDetail, componentExample, componentReference, componentSource, documentedComponents } from '../site/src/data/component-reference'
import { ast, sassPin, sheet } from './helpers/pinned-sass'
import { guideSource } from './helpers/guide-sass'

const read=(f:string)=>readFileSync(f,'utf8'),dom=(s:string)=>new DOMParser().parseFromString(s,'text/html')
const samples=(t:AdvancedTopic)=>[advancedExamples[t],...advancedDetails[t].variants.map(v=>v.markup)]
const paths:Record<AdvancedTopic,string>={datepicker:'_datepicker','otp-input':'forms/_otp-input',range:'forms/_form-range',strength:'forms/_strength'}
let selectors:string
beforeAll(()=>{const rules:string[]=[];ast(sheet('tremplin')).walkRules(r=>{rules.push(r.selector)});selectors=rules.join('\n')},90_000)
const hasClass=(name:string)=>new RegExp(('.'+name).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![\\w-])').test(selectors)
describe('source-verified advanced input documentation',()=>{
  for(const topic of advancedTopics){
    it(topic+': immutable MDX, actual catalog, defaults and reference are consistent',()=>{
      const path='site/src/content/docs/forms/'+advancedFormsTopic(topic)+'.mdx',base='artifacts/bootstrap6-reference/'+sassPin.commit+'/',bytes=readFileSync(base+path)
      const manifest=JSON.parse(read(base+'reference-manifest.json')) as {files:{path:string;sha:string}[]}
      expect(createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex')).toBe(manifest.files.find(f=>f.path===path)!.sha)
      expect(componentReference(topic)).toBe('https://github.com/DevCiel/tremplin/blob/main/'+componentSource(topic))
      const component=documentedComponents.find(c=>c.name===topic)!
      expect(component.classes).toEqual(advancedClasses[topic]);expect(component.accessibility).toBe(advancedAccessibility[topic])
      const api=JSON.parse(read('metadata/api.json')) as {components:{name:string;options:{name:string}[]}[]}
      expect(advancedOptionRows[topic].map(o=>o.name)).toEqual(api.components.find(c=>c.name===topic)!.options.map(o=>o.name))
    })
    it(topic+': rendered examples retain real classes, names and unique IDs',()=>{
      const actual=[componentExample(topic)!,...componentDetail(topic)!.variants.map(v=>v.markup)]
      expect(actual).toHaveLength(samples(topic).length)
      for(let i=0;i<actual.length;i++){
        const doc=dom(actual[i]!);doc.querySelectorAll('.demo-contrast').forEach(el=>el.replaceWith(...el.childNodes))
        // Calendar contrast options are explicitly supplied by the renderer, not core.
        doc.querySelectorAll('[data-trm-vcp-options]').forEach(el=>el.removeAttribute('data-trm-vcp-options'))
        expect(doc.body.innerHTML.trim()).toBe(dom(samples(topic)[i]!).body.innerHTML.trim())
        for(const el of doc.querySelectorAll('[class]'))for(const name of el.classList)expect(hasClass(name),name).toBe(true)
        for(const input of doc.querySelectorAll('input:not([type="hidden"])'))expect(doc.querySelector('label[for="'+input.id+'"]')).not.toBeNull()
      }
      const doc=dom(samples(topic).join('\n')),ids=[...doc.querySelectorAll('[id]')].map(el=>el.id)
      expect(new Set(ids).size).toBe(ids.length)
      expect(doc.querySelectorAll('.btn-primary,.rounded,.cluster,[role="meter"],[role="progressbar"]')).toHaveLength(0)
      for(const name of advancedClasses[topic])expect(hasClass(name),name).toBe(true)
    })
    it(topic+': token catalog, Sass customization, Forms code and methods use real source',()=>{
      const source=read('src/scss/'+paths[topic]+'.scss')
      for(const token of advancedDetails[topic].variables)expect(source).toContain(token.name)
      expect(compileString(guideSource(advancedDetails[topic].sass!),{loadPaths:[process.cwd()]}).css).toContain('@layer '+(topic==='range'||topic==='strength'?'forms':'components'))
      expect(advancedFormsGuides[topic].sections[0]!.example).toBeTruthy()
      expect(advancedApiJavascript[topic]).toContain("from 'tremplin/"+topic+"'")
      expect(advancedApiJavascript[topic]).not.toContain("'#example'")
      const all=dom(advancedFormsGuides[topic].sections.map(s=>s.example??'').join(''))
      const ids=[...all.querySelectorAll('[id]')].map(el=>el.id);expect(new Set(ids).size).toBe(ids.length)
    })
  }
  it('corrects OTP event presentation without changing frozen scanner entries',()=>{
    expect(advancedRuntimeEvent('input.trm.otp-input')).toBe('input.trm.otpInput')
    expect(advancedEvents['complete.trm.otpInput']).toContain('repeated setValue')
    expect(advancedEvents['input.trm.otpInput']).toContain('setValue and clear do not emit')
    expect(read('metadata/api.json')).toContain('complete.trm.otp-input')
  })
  it('documents source limitations rather than importing unsupported promises from prose',()=>{
    expect(advancedDetails.range.guidelines.join(' ')).toContain('formatter')
    expect(advancedOptionRows.range.find(o=>o.name==='formatter')!.description).toContain('not passed through formatter')
    expect(advancedDetails['otp-input'].guidelines.join(' ')).toContain('not direction-aware')
    expect(advancedDetails.datepicker.guidelines.join(' ')).toContain('Manual text edits')
    expect(advancedDetails.strength.guidelines.join(' ')).toContain('NaN')
    expect(advancedEvents['strengthChange.trm.strength']).toContain('only when the level changes')
  })
  it('shares copied/executed local demo code, full message keys and no network or secret logging',()=>{
    assertDemoModule(advancedDemoJavascript,'tremplin')
    expect(advancedDemoJavascript).not.toMatch(/fetch\(|XMLHttpRequest|console\.|localStorage|innerHTML|submit\(/)
    expect(advancedDemoJavascript).toContain('Range.getInstance(wrapper)?.dispose()')
    for(const topic of ['datepicker','range','strength'] as const)expect(advancedFormsGuides[topic].clientScript).toBe(advancedDemoJavascript)
    const template=read('site/src/pages/components/[slug].astro')
    expect(template).toContain('type="module" set:html={advancedDemoJavascript.replaceAll(')
    for(const topic of ['datepicker','range','strength'])expect(read('site/src/content/docs/components/'+topic+'.mdx')).toContain('<Code source={advancedDemoJavascript} standalone={true} plain={true} label="Copy advanced input demo setup" />')
    expect(read('site/src/components/component/Code.astro')).toContain('<code>{source}</code>')
    for(const topic of ['chips','combobox'])expect(read('site/src/content/docs/components/'+topic+'.mdx')).toContain('<Code source={choiceDemoCss} standalone={true} plain={true} label="Copy choice input accessibility CSS" />')
    expect(read('site/src/data/component-api.ts')).toContain("advancedRuntimeEvent(name === 'nav-overflow' ? adaptiveRuntimeEvent(catalogEvent) : catalogEvent)")
  })
  it('keeps native submission, decorative slots/feedback and real scroll owners',()=>{
    const otp=dom(samples('otp-input').join(''));for(const el of otp.querySelectorAll('[data-trm-otp]')){expect(el.querySelectorAll('input')).toHaveLength(1);expect(el.querySelectorAll('.otp-slot')).toHaveLength(0);expect(el.querySelector('input')!.name).toBe('code')}
    const strength=dom(samples('strength').join(''));for(const el of strength.querySelectorAll('.strength,.strength-bar'))expect(el.getAttribute('aria-hidden')).toBe('true')
    const date=dom(samples('datepicker').join(''));for(const el of date.querySelectorAll('.table-responsive')){expect(el.getAttribute('tabindex')).toBe('0');expect(el.getAttribute('aria-label')).toBeTruthy()}
    expect(date.querySelector('#inline-calendar input')).toBeNull()
    expect(date.querySelector('#inline-calendar-value')!.getAttribute('name')).toBe('selected-date')
  })
  it('leaves 35 protected source, API, exception, profile, distribution and arrow inputs unchanged',()=>{
    const before=JSON.parse(read('tests/fixtures/documentation-scope/advanced-inputs.json')) as {protectedInputs:Record<string,string>}
    expect(Object.keys(before.protectedInputs)).toHaveLength(35)
    assertDocumentationScope(before.protectedInputs)
  })
})
