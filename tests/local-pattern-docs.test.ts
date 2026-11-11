import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { compile, compileString } from 'sass'
import { beforeAll, describe, expect, it } from 'vitest'
import { localPatternTopics, localPatternClasses, localPatternAccessibility, localPatternExamples, localPatternDetails, localPatternJavascript, type LocalPatternTopic } from '../site/src/data/local-pattern-docs'
import { componentExample, componentDetail, componentReference, componentSource, documentedComponents, componentNavigationGroups } from '../site/src/data/component-reference'
import { ast, sheet, sassPin, cssTree } from './helpers/pinned-sass'
import { guideSource } from './helpers/guide-sass'

const dom=(markup:string)=>new DOMParser().parseFromString(markup,'text/html')
const samples=(topic:LocalPatternTopic)=>[localPatternExamples[topic],...localPatternDetails[topic].variants.map(v=>v.markup)]
const hash=(file:string)=>createHash('sha256').update(readFileSync(file)).digest('hex')
let selectors:string,properties:Set<string>,core:string
beforeAll(()=>{core=sheet('tremplin');const root=ast(core+'\n'+compile('src/scss/extensions/index.scss').css),rules:string[]=[];properties=new Set();root.walkRules(r=>{rules.push(r.selector)});root.walkDecls(d=>{properties.add(d.prop)});selectors=rules.join('\n')},90_000)
const hasClass=(name:string)=>new RegExp(('.'+name.replaceAll(':','\\:')).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![\\w-])').test(selectors)
describe('local optional pattern documentation',()=>{
  for(const topic of localPatternTopics) {
    it(topic+': proves local, optional and unchanged source boundaries without upstream parity claims',()=>{
      const before=JSON.parse(readFileSync('tests/fixtures/documentation-scope/local-patterns.json','utf8')) as {protectedInputs:Record<string,string>}
      const source='src/scss/extensions/_'+topic+'.scss'
      expect(hash(source)).toBe(before.protectedInputs[source])
      const manifest=JSON.parse(readFileSync('artifacts/bootstrap6-reference/'+sassPin.commit+'/reference-manifest.json','utf8')) as {files:{path:string}[]}
      expect(manifest.files.some(f=>f.path==='scss/_'+topic+'.scss')).toBe(false)
      expect(manifest.files.some(f=>f.path==='site/src/content/docs/components/'+topic+'.mdx')).toBe(false)
      expect(core).not.toMatch(new RegExp('\\.'+topic+'(?:\\s|\\{|:)'))
      expect(componentReference(topic)).toBe('https://github.com/DevCiel/tremplin/blob/main/'+componentSource(topic))
      expect(componentNavigationGroups.Extensions).toContain(topic)
      const catalog=documentedComponents.find(c=>c.name===topic)!
      expect(catalog.kind).toBe('local-css-extension');expect(catalog.classes).toEqual(localPatternClasses[topic]);expect(catalog.accessibility).toBe(localPatternAccessibility[topic])
    })
    it(topic+': only real core/extension classes and tokens reach raw rendered examples',()=>{
      const rendered=[componentExample(topic)!,...componentDetail(topic)!.variants.map(v=>v.markup)]
      for(let i=0;i<rendered.length;i++) {
        const doc=dom(rendered[i]!);expect(doc.body.innerHTML.trim()).toBe(dom(samples(topic)[i]!).body.innerHTML.trim())
        for(const el of doc.querySelectorAll('[class]'))for(const name of el.classList)expect(hasClass(name),name).toBe(true)
        for(const token of rendered[i]!.matchAll(/--trm-[\w-]+/g))expect(properties.has(token[0]),token[0]).toBe(true)
        for(const a of doc.querySelectorAll('a'))expect(a.getAttribute('href')).toMatch(/^\/[\w/-]+\/$/)
        for(const button of doc.querySelectorAll('button'))expect(button.type).toBe('button')
      }
      const all=dom(samples(topic).join('\n')),ids=[...all.querySelectorAll('[id]')].map(el=>el.id)
      expect(new Set(ids).size).toBe(ids.length)
      expect(all.querySelectorAll('.btn-primary,.btn-outline-primary,.btn-secondary,.btn-link,.rounded,.cluster,.stack,[role="grid"],[aria-selected]')).toHaveLength(0)
      for(const name of localPatternClasses[topic])expect(hasClass(name),name).toBe(true)
    })
    it(topic+': actual local Sass customization compiles separately from core in the custom layer',()=>{
      const source=guideSource(localPatternDetails[topic].sass!),css=compileString(source,{loadPaths:[process.cwd()]}).css
      expect(css).toContain('@layer custom')
      expect(css).toContain('--trm-'+topic+'-')
      for(const variable of localPatternDetails[topic].variables)expect(readFileSync('src/scss/extensions/_'+topic+'.scss','utf8')).toContain(variable.name)
      expect(localPatternDetails[topic].guidelines.join(' ')).toContain('optional local')
    })
  }
  it('ships the same existing optional CSS in both formats, separate from unchanged core',()=>{
    for(const [file,style]of [['artifacts/documentation-assets/dist/css/tremplin-extensions.css','expanded'],['artifacts/documentation-assets/dist/css/tremplin-extensions.min.css','compressed']] as const) {
      const actual=readFileSync(file,'utf8').replace(/\/\*# sourceMappingURL=[\s\S]*?\*\//g,'')
      expect(cssTree(actual)).toBe(cssTree(compile('src/scss/extensions/index.scss',{style}).css))
    }
    const layout=readFileSync('site/src/components/PageMeta.astro','utf8'),template=readFileSync('site/src/pages/components/[slug].astro','utf8')
    expect(layout).toContain('hasPalette || localPatternTopics.some')
    expect(layout).toContain('{hasOptionalCss && <link')
    expect(template).toContain('set:html={patternJavascript}')
    for(const topic of ['status','empty-state','data-table']){
      const body=readFileSync('site/src/content/docs/components/'+topic+'.mdx','utf8')
      expect(body).toContain(`<Code source={localPatternJavascript["${topic}"]} standalone={true} plain={true} label="Copy local pattern application handler" />`)
      expect(body).toContain('no network requests, persistence or account changes')
    }
    expect(readFileSync('site/src/components/component/Code.astro','utf8')).toContain('<code>{source}</code>')
  })
  it('Status has one live region, one pulse, named native update controls and no double dots',()=>{
    const doc=dom(samples('status').join('\n'))
    expect(doc.querySelectorAll('[role="status"]')).toHaveLength(1);expect(doc.querySelectorAll('.status-pulse')).toHaveLength(1)
    expect(doc.querySelectorAll('.status .status-dot')).toHaveLength(0)
    expect(doc.querySelector('.status-dot')!.getAttribute('aria-hidden')).toBe('true')
    expect(doc.querySelectorAll('[data-demo-status-state]')).toHaveLength(2)
  })
  it('Timeline focuses its actual scroll owner and retains ordered machine-readable events',()=>{
    const doc=dom(samples('timeline').join('\n'))
    for(const list of doc.querySelectorAll('.timeline')){expect(list.tagName).toBe('OL');expect(list.getAttribute('role')).toBe('list');expect(list.getAttribute('aria-label')).toBeTruthy()}
    expect(doc.querySelector('.timeline-horizontal')!.getAttribute('tabindex')).toBe('0')
    expect(doc.querySelectorAll('.timeline-item[tabindex]')).toHaveLength(0)
    for(const time of doc.querySelectorAll('time'))expect(time.getAttribute('datetime')).toMatch(/^2026-\d{2}(?:-\d{2}(?:T\d{2}:\d{2}:\d{2}\+05:30)?)?$/)
  })
  it('Divider separates decorative and structural roles without focusable splitter promises',()=>{
    const doc=dom(samples('divider').join('\n'))
    for(const el of doc.querySelectorAll('.divider'))expect(el.getAttribute('aria-hidden')==='true'||el.getAttribute('role')==='separator').toBe(true)
    expect(doc.querySelectorAll('[role="separator"][aria-orientation]')).toHaveLength(2)
    expect(doc.querySelectorAll('[tabindex]')).toHaveLength(0)
  })
  it('Empty State actions resolve to native destinations or explicit local creation with status/focus',()=>{
    const doc=dom(samples('empty-state').join('\n'))
    for(const section of doc.querySelectorAll('.empty-state'))expect(doc.getElementById(section.getAttribute('aria-labelledby')!)).not.toBeNull()
    for(const button of doc.querySelectorAll('button'))expect(button.hasAttribute('data-demo-create-project')).toBe(true)
    for(const svg of doc.querySelectorAll('svg'))expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(localPatternJavascript['empty-state']).toContain("result.querySelector('a').focus()")
  })
  it('Data Table supplies real headers, one current sort column and native checkbox semantics',()=>{
    const doc=dom(samples('data-table').join('\n'))
    for(const table of doc.querySelectorAll('table')){expect(table.querySelector(':scope > caption')!.textContent).toBeTruthy();expect(table.querySelector(':scope > thead th[scope="col"]')).not.toBeNull()}
    expect(doc.querySelectorAll('[aria-sort]')).toHaveLength(1)
    expect(doc.querySelectorAll('button[aria-sort],tr[aria-selected]')).toHaveLength(0)
    for(const input of doc.querySelectorAll('input[type="checkbox"]'))expect(input.closest('tr')!.classList.contains('table-active')).toBe((input as HTMLInputElement).checked)
    for(const area of doc.querySelectorAll('.data-table-scroll')){expect(area.getAttribute('tabindex')).toBe('0');expect(area.getAttribute('aria-label')).toBeTruthy()}
    for(const code of Object.values(localPatternJavascript)){expect(()=>new Function(code)).not.toThrow();expect(code).not.toMatch(/fetch\(|XMLHttpRequest|innerHTML|localStorage/)}
  })
})
