import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { chipTableExamples, chipTableDetails, chipTableClasses, chipTableAccessibility, standaloneChipJavascript, type ChipTableTopic } from '../site/src/data/chip-table-docs'
import { componentExample, componentDetail, componentReference, componentSource, documentedComponents } from '../site/src/data/component-reference'
import { ast, cssTree, sass, sassPin, sheet } from './helpers/pinned-sass'
import { approvedSass, prepareApprovedSass } from './helpers/approved-sass'
import { guideSource } from './helpers/guide-sass'

const topics: ChipTableTopic[] = ['chip','table']
const samples = (name: ChipTableTopic) => [chipTableExamples[name], ...chipTableDetails[name].variants.map(v=>v.markup)]
const dom = (markup: string) => new DOMParser().parseFromString(markup,'text/html')
let selectors: string, properties: Set<string>
beforeAll(async()=>{await prepareApprovedSass();const root=ast(sheet('tremplin')),rules:string[]=[];properties=new Set();root.walkRules(rule=>{rules.push(rule.selector)});root.walkDecls(d=>{properties.add(d.prop)});selectors=rules.join('\n')},90_000)
const hasClass = (name: string) => {
  let escaped=name.replaceAll(':','\\:')
  if(/^\d/.test(escaped)) escaped='\\3'+escaped[0]+' '+escaped.slice(1)
  return new RegExp(('.'+escaped).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![\\w-])').test(selectors)
}

describe('pinned Chip and Table documentation',()=>{
  for(const topic of topics) {
    it(topic+': verifies immutable primary docs, actual classes/tokens and catalog',()=>{
      const base='artifacts/bootstrap6-reference/'+sassPin.commit+'/',file='site/src/content/docs/'+(topic==='chip'?'forms/chips':'content/tables')+'.mdx'
      const manifest=JSON.parse(readFileSync(base+'reference-manifest.json','utf8')) as {commit:string;files:{path:string;sha:string}[]}
      expect(manifest.commit).toBe(sassPin.commit)
      const bytes=readFileSync(base+file),entry=manifest.files.find(f=>f.path===file)!
      expect(createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex')).toBe(entry.sha)
      for(const markup of samples(topic)) {
        for(const el of dom(markup).querySelectorAll('[class]')) for(const name of el.classList) expect(hasClass(name),name).toBe(true)
        for(const token of markup.matchAll(/--trm-[\w-]+/g)) expect(properties.has(token[0]),token[0]).toBe(true)
      }
      const catalog=documentedComponents.find(c=>c.name===topic)!
      expect(catalog.classes).toEqual(chipTableClasses[topic]);expect(catalog.accessibility).toBe(chipTableAccessibility[topic])
      for(const name of catalog.classes) expect(hasClass(name),name).toBe(true)
      expect(componentReference(topic)).toBe('https://github.com/DevCiel/tremplin/blob/main/'+componentSource(topic))
    })
    it(topic+': preserves raw authoring and unique IDs without legacy aliases',()=>{
      const rendered=[componentExample(topic)!,...componentDetail(topic)!.variants.map(v=>v.markup)]
      for(let i=0;i<rendered.length;i++){const doc=dom(rendered[i]!);expect((doc.querySelector('.demo-contrast')??doc.body).innerHTML.trim()).toBe(dom(samples(topic)[i]!).body.innerHTML.trim())}
      const all=dom(samples(topic).join('\n')),ids=[...all.querySelectorAll('[id]')].map(el=>el.id)
      expect(new Set(ids).size).toBe(ids.length)
      expect(all.querySelectorAll('.chip-sm,.chip-lg,.chip-avatar,.chip-group,.chip-remove,.table-success,.table-warning,.table-danger,.table-responsive-md,.table-responsive-xxl')).toHaveLength(0)
    })
    it(topic+': real Sass customization matches the approved immutable assembly',()=>{
      const source=guideSource(chipTableDetails[topic].sass!)
      expect(cssTree(sass(source))).toBe(cssTree(approvedSass(source)))
    })
  }
  it('standalone chips keep native actions, explicit focus/selection policy and named SVG dismissal',()=>{
    const doc=dom(samples('chip').join('\n'))
    expect(doc.querySelectorAll('[data-trm-chips],[data-trm-toggle="chip"]')).toHaveLength(0)
    for(const el of doc.querySelectorAll('[data-demo-chip-toggle]')){expect(el.tagName).toBe('BUTTON');expect(el.getAttribute('type')).toBe('button');expect(el.classList.contains('active')).toBe(el.getAttribute('aria-pressed')==='true');expect(el.classList.contains('focus-ring')).toBe(true)}
    const dismiss=doc.querySelector('.chip-dismiss')!;expect(dismiss.getAttribute('aria-label')).toBe('Remove Design filter');expect(dismiss.parentElement!.tagName).toBe('SPAN');expect(dismiss.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true')
    expect(doc.querySelectorAll('button button,a button,button a')).toHaveLength(0)
    for(const img of doc.querySelectorAll('img')){expect(img.getAttribute('alt')).toBe('');expect(img.getAttribute('src')).toBe('/img/avatar-demo.svg')}
    expect(()=>new Function(standaloneChipJavascript)).not.toThrow()
    expect(standaloneChipJavascript).toContain("button.setAttribute('aria-pressed'")
    expect(standaloneChipJavascript).toContain('next.focus()')
  })
  it('all table examples retain real names, scoped headers and named focusable scroll regions',()=>{
    const doc=dom(samples('table').join('\n'))
    for(const table of doc.querySelectorAll('table')){expect(table.querySelector(':scope > caption')!.textContent).toBeTruthy();expect(table.querySelector(':scope > thead th[scope="col"]')).not.toBeNull()}
    for(const th of doc.querySelectorAll('th')) expect(['row','col']).toContain(th.getAttribute('scope'))
    for(const wrapper of doc.querySelectorAll('[role="region"]')){expect(wrapper.getAttribute('aria-label')).toBeTruthy();expect(wrapper.getAttribute('tabindex')).toBe('0')}
    expect(doc.querySelector('tfoot th[colspan="2"]')!.textContent).toBe('Total billed')
    expect(doc.querySelectorAll('[role="grid"],[aria-selected],[aria-sort],[data-trm-toggle]')).toHaveLength(0)
  })
  it('stacked markup supplements real headers and separates viewport overflow from container stacking',()=>{
    const doc=dom(samples('table').join('\n'))
    for(const table of doc.querySelectorAll('table[role="table"]')){expect(table.parentElement!.classList.contains('table-responsive')).toBe(true);for(const td of table.querySelectorAll('td')){expect(td.hasAttribute('data-cell')).toBe(true);expect(td.getAttribute('role')).toBe('cell')}}
    for(const prefix of ['sm','md','lg','xl','2xl']) expect(doc.querySelector(`[class~="${prefix}:table-responsive"]`)).not.toBeNull()
    const guide=chipTableDetails.table.guidelines.join(' ')
    expect(guide).toContain('viewport media queries');expect(guide).toContain('container queries');expect(guide).toContain('Theme custom properties inherited')
  })
  it('both guides are disclosed CSS primitives and the handler is the shared copied/executed source',()=>{
    const template=readFileSync('site/src/pages/components/[slug].astro','utf8')
    expect(readFileSync('site/src/content/docs/components/chip.mdx','utf8')).toContain('<Code source={standaloneChipJavascript} standalone={true} plain={true} label="Copy standalone Chip application handler" />')
    expect(readFileSync('site/src/components/component/Code.astro','utf8')).toContain('<code>{source}</code>')
    expect(template).toContain('set:html={standaloneChipJavascript}')
    expect(chipTableDetails.chip.guidelines.join(' ')).toContain('one size')
    expect(chipTableDetails.table.guidelines.join(' ')).toContain('not a Table plugin')
  })
})
