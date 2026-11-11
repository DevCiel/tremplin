import { choiceFormsGuides } from './helpers/forms-mdx-contract'
import { createHash } from 'node:crypto'
import { assertDocumentationScope } from './helpers/documentation-scope'
import { readFileSync } from 'node:fs'
import { compileString } from 'sass'
import { beforeAll, describe, expect, it } from 'vitest'
import { choiceAccessibility, choiceApiJavascript, choiceClasses, choiceComboboxExample, choiceDemoCss, choiceDetails, choiceEvents, choiceExamples, choiceOptionRows, chipsSubmissionJavascript, type ChoiceTopic } from '../site/src/data/choice-input-docs'
import { componentDetail, componentExample, componentReference, componentSource, documentedComponents } from '../site/src/data/component-reference'
import { ast, sassPin, sheet } from './helpers/pinned-sass'
import { guideSource } from './helpers/guide-sass'

const topics:ChoiceTopic[]=['chips','combobox']
const dom=(s:string)=>new DOMParser().parseFromString(s,'text/html')
const read=(s:string)=>readFileSync(s,'utf8')
const samples=(t:ChoiceTopic)=>[choiceExamples[t],...choiceDetails[t].variants.map(v=>v.markup)]
let selectors:string
beforeAll(()=>{const rules:string[]=[];ast(sheet('tremplin')).walkRules(r=>{rules.push(r.selector)});selectors=rules.join('\n')},90_000)
const hasClass=(name:string)=>new RegExp(('.'+name).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![\\w-])').test(selectors)
describe('pinned choice-input documentation',()=>{
  for(const topic of topics){
    it(topic+': uses hash-verified immutable forms reference and actual public catalog',()=>{
      const file='site/src/content/docs/forms/'+topic+'.mdx',base='artifacts/bootstrap6-reference/'+sassPin.commit+'/'
      const manifest=JSON.parse(read(base+'reference-manifest.json')) as {files:{path:string;sha:string}[]}
      const source=readFileSync(base+file),sha=createHash('sha1').update('blob '+source.length+'\0').update(source).digest('hex')
      expect(sha).toBe(manifest.files.find(f=>f.path===file)!.sha)
      expect(componentReference(topic)).toBe('https://github.com/DevCiel/tremplin/blob/main/'+componentSource(topic))
      const catalog=documentedComponents.find(c=>c.name===topic)!
      expect(catalog.classes).toEqual(choiceClasses[topic]);expect(catalog.accessibility).toBe(choiceAccessibility[topic])
      expect(choiceOptionRows[topic]).toHaveLength(topic==='chips'?7:8)
    })
    it(topic+': shares rendered markup, real selectors and unique labelled examples',()=>{
      const rendered=[componentExample(topic)!,...componentDetail(topic)!.variants.map(v=>v.markup)]
      expect(rendered).toHaveLength(11)
      for(let i=0;i<rendered.length;i++){
        const actual=dom(rendered[i]!);actual.querySelectorAll('.demo-contrast').forEach(el=>el.replaceWith(...el.childNodes))
        expect(actual.body.innerHTML.trim()).toBe(dom(samples(topic)[i]!).body.innerHTML.trim())
        for(const el of actual.querySelectorAll('[class]'))for(const name of el.classList)expect(hasClass(name),name).toBe(true)
        for(const svg of actual.querySelectorAll('svg'))expect(svg.getAttribute('aria-hidden')).toBe('true')
      }
      const doc=dom(samples(topic).join('\n')),ids=[...doc.querySelectorAll('[id]')].map(el=>el.id)
      expect(new Set(ids).size).toBe(ids.length)
      expect(doc.querySelectorAll('.combobox,[data-trm-combobox],[aria-activedescendant]')).toHaveLength(0)
      for(const name of choiceClasses[topic])expect(hasClass(name),name).toBe(true)
      for(const input of doc.querySelectorAll('input:not([type="hidden"])'))expect(input.hasAttribute('aria-label')||doc.querySelector('label[for="'+input.id+'"]')).toBeTruthy()
    })
    it(topic+': actual Sass examples compile and guide/application choices are disclosed',()=>{
      const css=compileString(guideSource(choiceDetails[topic].sass!),{loadPaths:[process.cwd()]}).css
      expect(css).toContain('@layer '+(topic==='chips'?'forms':'components'))
      expect(choiceFormsGuides[topic].sections[0]!.example).toBeTruthy()
      expect(JSON.stringify(choiceFormsGuides[topic])).toContain(choiceDemoCss.replaceAll('\n','\\n'))
      expect(choiceApiJavascript[topic]).toContain("import "+(topic==='chips'?'Chips':'Combobox')+" from 'tremplin/"+topic+"'")
      expect(choiceApiJavascript[topic]).not.toMatch(/getValue\(|setValue\(/)
    })
  }
  it('escapes choice values, descriptions, group and accessible names as text',()=>{
    const doc=dom(choiceComboboxExample('safe','<label>',[{value:'"><img src=x>',label:'<script>x</script>',description:'<b>details</b>',group:'<svg/onload=x>'}]))
    expect(doc.querySelectorAll('script,img,b')).toHaveLength(0)
    expect(doc.querySelector('[data-trm-value]')!.getAttribute('data-trm-value')).toBe('"><img src=x>')
    expect(doc.querySelector('[role="group"]')!.getAttribute('aria-label')).toBe('<svg/onload=x>')
    expect(doc.querySelector('.menu-item-description')!.textContent).toBe('<b>details</b>')
  })
  it('documents real cancellation, event timing, disabled limits and submission without inventing APIs',()=>{
    expect(choiceDetails.chips.guidelines.join(' ')).toContain('clear() removes all chips directly')
    expect(choiceDetails.chips.guidelines.join(' ')).toContain('not read-only mode')
    expect(choiceDetails.combobox.guidelines.join(' ')).toContain('real focus')
    expect(choiceDetails.combobox.guidelines.join(' ')).toContain('do not await Menu transitions')
    expect(choiceEvents['change.trm.chips']).toContain('copied values array')
    expect(choiceEvents['change.trm.combobox']).toContain('preventing this event does not undo selection')
    expect(()=>new Function(chipsSubmissionJavascript)).not.toThrow()
    expect(chipsSubmissionJavascript).toContain('JSON.stringify(event.values)');expect(chipsSubmissionJavascript).not.toMatch(/fetch\(|innerHTML|localStorage|event.detail/)
    const template=read('site/src/pages/components/[slug].astro')
    expect(template).toContain('set:html={chipsSubmissionJavascript}')
    expect(read('site/src/content/docs/components/chips.mdx')).toContain('<Code source={chipsSubmissionJavascript} standalone={true} plain={true} label="Copy Chips submission handler" />')
    expect(read('site/src/components/component/Code.astro')).toContain('<code>{source}</code>')
    expect(read('site/src/components/PageMeta.astro')).toContain('choiceDemoCss')
    expect(choiceDetails.combobox.variables).toEqual([])
    for(const variable of choiceDetails.chips.variables)expect(read('src/scss/forms/_chip-input.scss')+read('src/scss/_chip.scss')).toContain(variable.name)
  })
  it('does not change frozen APIs, protected core, approved exceptions or existing optional sources',()=>{
    const before=JSON.parse(read('tests/fixtures/documentation-scope/choice-inputs.json')) as {protectedInputs:Record<string,string>}
    expect(Object.keys(before.protectedInputs)).toHaveLength(25)
    assertDocumentationScope(before.protectedInputs)
  })
})
