import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read=(file:string)=>readFileSync(file,'utf8')
const current=['README.md','docs/PRODUCT_PLAN.md','docs/FEATURES.md','docs/MIGRATION.md','docs/COMPONENTS.md','docs/CUSTOMIZATION.md','docs/LAYOUT.md','docs/INTEGRATIONS.md','docs/INTERACTIONS.md','docs/LOCALIZATION.md']

describe('current-only maintainer documentation',()=>{
  it.each(['docs/MIGRATION_0.7.md','docs/MIGRATION_0.8.md','docs/BOOTSTRAP6-PARITY.md','docs/bootstrap-LICENSE.txt'])('does not retain obsolete file %s',file=>{
    expect(existsSync(file)).toBe(false)
  })

  it.each(current)('%s has no broken local references or old migration links',file=>{
    const source=read(file)
    expect(source).not.toMatch(/\]\([^)]*(?:MIGRATION_0\.[78]|BOOTSTRAP6-PARITY|bootstrap-LICENSE)/)
    for(const match of source.matchAll(/\]\(([^)]+)\)/g)){
      const target=match[1]!
      if(target.startsWith('#')||target.includes('://'))continue
      expect(existsSync(resolve(dirname(file),target.split('#')[0]!)),file+': '+target).toBe(true)
    }
  })

  it('keeps the current AI delivery contract without resurrecting a classic global',()=>{
    const source=read('llms.txt')
    expect(source).toContain('type="module"')
    expect(source).toContain('/getting-started/ai/')
    expect(source).toContain('docs/MIGRATION.md')
    expect(source).toContain('build/')
    expect(source).not.toMatch(/classic IIFE|exposing TremplinFramework|col-md-6/)
  })

  it('does not delete required attribution, changelog history or strict regression evidence',()=>{
    for(const file of ['LICENSE','licenses/third-party-code.txt','dist/THIRD_PARTY_NOTICES.txt','CHANGELOG.md','metadata/strict-api-baseline.json','metadata/bootstrap6-security-patches.json','tests/fixtures/documentation-scope/package.initial.json'])expect(existsSync(file),file).toBe(true)
    expect(read('dist/THIRD_PARTY_NOTICES.txt')).toContain(read('licenses/third-party-code.txt'))
  })

  it('points locale examples at the real strict Datepicker options',()=>{
    const metadata=JSON.parse(read('metadata/api.json')) as {components:{name:string;options:{name:string}[]}[]}
    const names=metadata.components.find(component=>component.name==='datepicker')!.options.map(option=>option.name)
    expect(names).toEqual(expect.arrayContaining(['locale','firstWeekday','vcpOptions']))
    expect(names).not.toContain('labels')
    expect(read('docs/LOCALIZATION.md')).toContain('firstWeekday: 1')
  })
})
