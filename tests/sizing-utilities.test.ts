import { beforeAll, describe, expect, it } from 'vitest'
import { rules, values } from './helpers/pinned-sass'
import { checkedFamily, familySource, prepareFamilies } from './helpers/family-sass'

const sources={
  base:familySource(),
  scale:familySource('$sizes: (2: 3rem, 12: null, fit: null, min: 8rem)'),
  override:familySource('', '', "'width': (property: width, class: w, values: (min: 10rem)), 'height': (property: height, class: h, values: (min: 10rem))"),
  variants:familySource('', '', "'max-width': (property: max-width, class: project-cap, responsive: true, print: true, dark: true, state: hover, values: (half: 50%)), 'max-height': null"),
  removed:familySource('', '', "'max-width': (enabled: false), 'max-height': null")
}
beforeAll(()=>prepareFamilies(sources),90_000)
describe('pinned Bootstrap 6 physical sizing families',()=>{
  it('provides non-responsive intrinsic widths/heights without logical-axis substitutions',()=>{
    const root=checkedFamily(sources.base)
    for(const [name,value]of[['min','min-content'],['max','max-content'],['fit','fit-content']]as const) {
      expect(values('.w-'+name,'width',root)).toEqual([value])
      expect(values('.h-'+name,'height',root)).toEqual([value])
      expect(values('.w-'+name,'inline-size',root)).toEqual([])
      expect(rules('.md\\:w-'+name,root)).toEqual([])
    }
  })
  it('provides canonical min/max constraints without legacy maximum aliases',()=>{
    const root=checkedFamily(sources.base)
    for(const [name,property]of[['max-w','max-width'],['max-h','max-height'],['min-w','min-width'],['min-h','min-height']]as const) expect(values('.'+name+'-100',property,root)).toEqual(['100%'])
    expect(values('.min-w-0','min-width',root)).toEqual(['0'])
    for(const selector of['.mw-100','.mh-100','.w-md-min']) expect(rules(selector,root)).toEqual([])
  })
  it('uses physical viewport and dynamic-viewport dimensions',()=>{
    const root=checkedFamily(sources.base)
    for(const[name,property,value]of[['dvw','width','100dvw'],['min-dvw','min-width','100dvw'],['dvh','height','100dvh'],['min-dvh','min-height','100dvh'],['vw','width','100vw'],['vh','height','100vh']]as const) expect(values('.'+name+'-100',property,root)).toEqual([value])
  })
  it('applies sizes to width only while retaining reserved intrinsic values',()=>{
    const root=checkedFamily(sources.scale)
    expect(values('.w-2','width',root)).toEqual(['3rem'])
    expect(rules('.w-12',root)).toEqual([])
    expect(rules('.h-2',root)).toEqual([])
    expect(values('.w-min','width',root)).toEqual(['min-content'])
    expect(values('.w-fit','width',root)).toEqual(['fit-content'])
    expect(values('.h-fit','height',root)).toEqual(['fit-content'])
  })
  it('overrides intrinsic values or removes them through complete width/height family definitions',()=>{
    const root=checkedFamily(sources.override)
    expect(values('.w-min','width',root)).toEqual(['10rem'])
    expect(values('.h-min','height',root)).toEqual(['10rem'])
    expect(rules('.w-fit',root)).toEqual([])
  })
  it('honors explicit flags/class renaming without generating extra maximum aliases',()=>{
    const root=checkedFamily(sources.variants)
    for(const selector of['.project-cap-half','.md\\:project-cap-half','.hover\\:project-cap-half:hover','.print\\:project-cap-half','.dark\\:project-cap-half']) expect(values(selector,'max-width',root)).toEqual(['50%'])
    for(const selector of['.max-w-100','.mw-half','.max-h-100']) expect(rules(selector,root)).toEqual([])
    const removed=checkedFamily(sources.removed)
    expect(rules('.max-w-100',removed)).toEqual([])
  })
})
