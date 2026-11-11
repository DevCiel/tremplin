import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { assertDocumentationPackage, assertDocumentationVisualConfig } from './helpers/documentation-scope'

const read=(file:string)=>readFileSync(file,'utf8')
const initialHash='a79e25ad5bd9643838472289333f7ae83ea1cf03cac27e521e1bd5f046281b11'
const scopes=[
  ['native-forms',55,'e29a0d036a7cd64a7a1ad53e01e76289039132c888186f9c08d8749e97bd9431'],
  ['local-patterns',20,'b89f81b746e2e711b4aa8ddf7c1406fa7c1c0a2f3bafb68d5b0e48038fefa881'],
  ['forms-overview',55,'e29a0d036a7cd64a7a1ad53e01e76289039132c888186f9c08d8749e97bd9431'],
  ['form-composition',58,'e36c603d4a30edb3605a10072e4fcad9bb77878dc4ed33e0aeab5c5c91fe3403'],
  ['choice-inputs',25,'a64a1dce922b2c568187800ef9005aba3dcc6e72db13f6d09b77496e3a979c2a'],
  ['advanced-inputs',35,'1f2037e0cbe2becf57f4d68d5c846eff23f96c85181741deb1bdaac2c2791ea4'],
  ['sheet-command',41,'14438d28a54dcde37c1e6aaf0b02a34dc640870a237f0e842503889fb96bdf73'],
] as const

describe('tracked historical documentation scopes',()=>{
  it.each(scopes)('%s retains its protected inventory', (name,count,digest)=>{
    const fixture=JSON.parse(read(`tests/fixtures/documentation-scope/${name}.json`)) as {
      date:string;sourceArtifact:string;sourceSha256:string;protectedInputs:Record<string,string>
    }
    expect(fixture.date).toBe('2026-11-08')
    expect(fixture.sourceArtifact).toBe(`artifacts/${name}-before.json`)
    expect(fixture.sourceSha256).toMatch(/^[a-f0-9]{64}$/)
    expect(Object.keys(fixture.protectedInputs)).toHaveLength(count)
    expect(createHash('sha256').update(JSON.stringify(fixture.protectedInputs)).digest('hex')).toBe(digest)
    expect(fixture.protectedInputs['package.json']).toBe(initialHash)
    for(const [file,hash]of Object.entries(fixture.protectedInputs)){
      expect(file).not.toMatch(/(^\/|\\|(?:^|\/)\.\.(?:\/|$))/)
      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    }
  })

  it('retains the exact initial manifest and accepts only the approved current changes',()=>{
    const original=read('tests/fixtures/documentation-scope/package.initial.json').replaceAll('\r\n','\n')
    expect(createHash('sha256').update(original).digest('hex')).toBe(initialHash)
    expect(()=>assertDocumentationPackage(read('package.json'),initialHash)).not.toThrow()
  })

  it.each(['dependencies','exports','scripts','preparation','toolingPath','repository','releaseBlock'])('rejects an unapproved %s change',field=>{
    const changed=JSON.parse(read('package.json'))
    if(field==='dependencies')changed.devDependencies.sass='0.0.0'
    if(field==='exports')changed.exports['./css']='./wrong.css'
    if(field==='scripts')changed.scripts.check=changed.scripts.check.replace(' && npm test','')
    if(field==='preparation')changed.scripts.check=changed.scripts.check.replace(' && npm run site:prepare','')
    if(field==='toolingPath')changed.scripts.clean='node other/clean.mjs'
    if(field==='repository')changed.repository.url='https://example.invalid/repository.git'
    if(field==='releaseBlock')changed.tremplinMigration.releaseBlocked=false
    expect(()=>assertDocumentationPackage(JSON.stringify(changed),initialHash)).toThrow()
  })

  it('rejects a substituted historical package hash',()=>{
    expect(()=>assertDocumentationPackage(read('package.json'),'0'.repeat(64))).toThrow('Historical package baseline changed')
  })

  it('allows only the visual server-command relocation, retaining the original settings hash',()=>{
    const source=read('playwright.docs-visual.config.ts')
    const hash='c3b76624908d33c2a6dd0f9e0e4ae580cc3cb9e72c4236e8b4f41917a8f30d83'
    expect(()=>assertDocumentationVisualConfig(source,hash)).not.toThrow()
    for(const [from,to]of [['maxDiffPixelRatio: 0.03','maxDiffPixelRatio: 0.99'],['workers: 1','workers: 8'],['reuseExistingServer: false','reuseExistingServer: true'],['node tests/tooling/serve.mjs','node other/serve.mjs']]){
      expect(source).toContain(from)
      expect(()=>assertDocumentationVisualConfig(source.replace(from!,to!),hash)).toThrow()
    }
  })
})
