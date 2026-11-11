import { createHash } from 'node:crypto'
import { assertDemoModule, assertDocumentationScope } from './helpers/documentation-scope'
import { readFileSync } from 'node:fs'
import { compileString } from 'sass'
import { describe, expect, it } from 'vitest'
import { componentDetail, componentExample, componentImport, componentReference, componentSource, componentTarget, documentedComponents, implementationName } from '../site/src/data/component-reference'
import { paletteApiJavascript, paletteDemoCss, paletteDemoJavascript, paletteEvents, paletteOptionRows, sheetDemoJavascript, sheetCommandAccessibility, sheetCommandClasses, sheetCommandDetails, sheetCommandExamples, type SheetCommandTopic } from '../site/src/data/sheet-command-docs'
import { guideSource } from './helpers/guide-sass'
import { sassPin } from './helpers/pinned-sass'

const read=(f:string)=>readFileSync(f,'utf8'), dom=(s:string)=>new DOMParser().parseFromString(s,'text/html')
const topics:SheetCommandTopic[]=['bottom-sheet','command-palette']
describe('source-verified Drawer sheet and optional Command Palette documentation',()=>{
  it('uses a verified immutable Drawer reference and never invents upstream counterparts',()=>{
    const base='artifacts/bootstrap6-reference/'+sassPin.commit+'/',path='site/src/content/docs/components/drawer.mdx',bytes=readFileSync(base+path)
    const manifest=JSON.parse(read(base+'reference-manifest.json')) as {files:{path:string;sha:string}[]}
    expect(createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex')).toBe(manifest.files.find(f=>f.path===path)!.sha)
    expect(manifest.files.some(f=>/\/(bottom-sheet|command-palette)\.(mdx|ts)$/.test(f.path))).toBe(false)
    expect(componentReference('bottom-sheet')).toBe('https://github.com/DevCiel/tremplin/blob/main/'+componentSource('bottom-sheet'))
    expect(componentReference('command-palette')).toBe('https://github.com/DevCiel/tremplin/blob/main/'+componentSource('command-palette'))
  })
  for(const topic of topics){
    it(topic+': actual catalog, unique IDs, real markup and initialization hooks',()=>{
      const c=documentedComponents.find(c=>c.name===topic)!
      expect(c.classes).toEqual(sheetCommandClasses[topic]);expect(c.accessibility).toBe(sheetCommandAccessibility[topic])
      const detail=componentDetail(topic)!,samples=[componentExample(topic)!,...detail.variants.map(v=>v.markup)],doc=dom(samples.join('\n'))
      const ids=[...doc.querySelectorAll('[id]')].map(el=>el.id);expect(new Set(ids).size).toBe(ids.length)
      expect(samples).toEqual([sheetCommandExamples[topic],...sheetCommandDetails[topic].variants.map(v=>v.markup)])
      expect(doc.querySelectorAll('.btn-primary,.btn-outline-primary,.bottom-sheet,.bottom-sheet-handle,.bottom-sheet-sm,.bottom-sheet-lg,.bottom-sheet-full')).toHaveLength(0)
      expect(doc.querySelector(componentTarget(topic))).not.toBeNull()
      for(const trigger of doc.querySelectorAll('[data-trm-target]'))expect(doc.querySelector(trigger.getAttribute('data-trm-target')!)).not.toBeNull()
      if(topic==='bottom-sheet')for(const el of doc.querySelectorAll('dialog')){expect(el.classList.contains('drawer-sheet')).toBe(true);expect(doc.getElementById(el.getAttribute('aria-labelledby')!)).not.toBeNull();expect(el.querySelector('[data-trm-dismiss="drawer"]')).not.toBeNull()}
      else for(const el of doc.querySelectorAll('[data-trm-command-palette]')){expect(el.hasAttribute('hidden')).toBe(true);expect(el.getAttribute('data-trm-shortcut')).toBe('false');expect(el.querySelector('label[for="'+el.querySelector('input')!.id+'"]')).not.toBeNull();for(const item of el.querySelectorAll('.command-item'))expect(item.getAttribute('tabindex')).toBe('-1')}
    })
    it(topic+': actual token defaults and compilable supported Sass map',()=>{
      const path=componentSource(topic),source=read(path)
      expect(path).toBe(topic==='bottom-sheet'?'src/scss/_drawer.scss':'src/scss/extensions/_command-palette.scss')
      for(const token of sheetCommandDetails[topic].variables)expect(source).toContain(token.name)
      expect(compileString(guideSource(sheetCommandDetails[topic].sass!),{loadPaths:[process.cwd()]}).css).toContain('@layer '+(topic==='bottom-sheet'?'components':'custom'))
    })
  }
  it('shares Drawer behavior without a second plugin and preserves the optional named export',()=>{
    expect(implementationName('bottom-sheet')).toBe('drawer');expect(componentImport('bottom-sheet','Drawer')).toBe("import Drawer from 'tremplin/drawer'")
    expect(componentImport('command-palette','CommandPalette')).toBe("import { CommandPalette } from 'tremplin/extensions/command-palette'")
    expect(paletteApiJavascript).not.toContain("from 'tremplin'")
  })
  it('documents every real optional option and emitted event without changing the scanner',()=>{
    const api=JSON.parse(read('metadata/api.json')) as {components:{name:string;options:{name:string}[];events:string[]}[]},c=api.components.find(c=>c.name==='command-palette')!
    expect(paletteOptionRows.map(o=>o.name)).toEqual(c.options.map(o=>o.name));expect(Object.keys(paletteEvents).sort()).toEqual([...c.events].sort())
    const src=read('src/js/extensions/command-palette.ts');for(const event of Object.keys(paletteEvents))expect(src).toContain("'"+event+"'")
    expect(sheetCommandDetails['command-palette'].guidelines.join(' ')).toContain('event.detail')
    expect(sheetCommandDetails['command-palette'].guidelines.join(' ')).toContain('no nested-overlay coordination')
    expect(sheetCommandDetails['bottom-sheet'].variants[0]!.description).toContain('only resets inset-block-end')
  })
  it('copies and executes the same disclosed local setup, without network or persistence',()=>{
    assertDemoModule(paletteDemoJavascript,'tremplin/extensions/command-palette');expect(paletteDemoJavascript).not.toMatch(/fetch\(|XMLHttpRequest|console\.|localStorage|innerHTML/)
    const template=read('site/src/pages/components/[slug].astro');expect(template).toContain('type="module" set:html={paletteDemoJavascript.replaceAll(')
    expect(read('site/src/content/docs/components/command-palette.mdx')).toContain('<Code source={paletteDemoJavascript} standalone={true} plain={true} label="Copy Command Palette application handler" />')
    expect(read('site/src/components/PageMeta.astro')).toContain('{hasPalette && <style is:inline set:html={paletteDemoCss}>')
    expect(paletteDemoCss).toContain(':focus-visible');expect(paletteDemoJavascript).toContain('stopImmediatePropagation')
    expect(()=>new Function(sheetDemoJavascript)).not.toThrow()
    expect(read('site/src/content/docs/components/bottom-sheet.mdx')).toContain('<Code source={sheetDemoJavascript} standalone={true} plain={true} label="Copy Bottom Sheet initial focus handler" />')
    expect(read('site/src/components/component/Code.astro')).toContain('<code>{source}</code>')
    expect(template).toContain('set:html={sheetDemoJavascript}')
    expect(paletteDemoJavascript).toContain("'show.trm.command-palette'");expect(sheetDemoJavascript).toContain('shown.trm.drawer')
  })
  it('keeps group labels out of the option tree and uses non-tabbable div options',()=>{
    const doc=dom([sheetCommandExamples['command-palette'],...sheetCommandDetails['command-palette'].variants.map(v=>v.markup)].join(''))
    for(const label of doc.querySelectorAll('.command-group-label')){expect(label.getAttribute('aria-hidden')).toBe('true');expect(label.tagName).toBe('DIV')}
    for(const option of doc.querySelectorAll('.command-item'))expect(option.tagName).toBe('DIV')
    expect(doc.querySelector('[aria-disabled="true"]')).not.toBeNull()
  })
  it('leaves every protected implementation, distribution, profile and API byte unchanged',()=>{
    const before=JSON.parse(read('tests/fixtures/documentation-scope/sheet-command.json')) as {protectedInputs:Record<string,string>}
    expect(Object.keys(before.protectedInputs)).toHaveLength(41)
    assertDocumentationScope(before.protectedInputs)
  })
})
