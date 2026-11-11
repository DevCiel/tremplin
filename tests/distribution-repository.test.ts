import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read=(file:string)=>readFileSync(file,'utf8')

describe('committed distribution contract',()=>{
  it('tracks root dist without including dependency, temporary, or website copies',()=>{
    const rules=read('.gitignore').split(/\r?\n/).filter(line=>line&&!line.startsWith('#'))
    expect(rules).not.toContain('dist/')
    expect(rules).not.toContain('/dist/')
    for(const ignored of ['node_modules/','artifacts/','site-dist/','/site/public/dist/','site/public/js/','site/public/css/','.env'])expect(rules).toContain(ignored)
  })

  it('preserves LF distribution bytes for cross-platform integrity checks',()=>{
    expect(read('.gitattributes')).toMatch(/^\/dist\/\*\* text eol=lf\r?$/m)
  })

  it('ships runtime formats, types, assets, and unchanged license notices together',()=>{
    for(const file of ['css/tremplin.css','css/tremplin.min.css','css/tremplin.css.map','js/tremplin.js','js/tremplin.bundle.min.js','js/tremplin.bundle.min.js.map','icons/datepicker-chevron.svg','THIRD_PARTY_NOTICES.txt'])expect(existsSync('dist/'+file),file).toBe(true)
    for(const file of ['js/dist/index.js','js/dist/index.d.ts','js/dist/button.js','js/dist/button.d.ts'])expect(existsSync(file),file).toBe(true)
    for(const file of JSON.parse(read('metadata/core-entrypoint-transition.json')).retiredGeneratedEntries)expect(existsSync(file),file).toBe(false)
    expect(readFileSync('dist/LICENSE').equals(readFileSync('LICENSE'))).toBe(true)
    expect(read('dist/THIRD_PARTY_NOTICES.txt')).toContain(read('licenses/third-party-code.txt'))
    expect(read('THIRD_PARTY_NOTICES.txt')).toBe(read('dist/THIRD_PARTY_NOTICES.txt'))
    expect(read('dist/THIRD_PARTY_NOTICES.txt')).not.toMatch(/\n\s*\n$/)
  })

  it('verifies every declared asset against its committed integrity metadata',()=>{
    const manifest=JSON.parse(read('dist/integrity.json')) as {version:string;algorithm:string;assets:Record<string,{bytes:number;integrity:string}>}
    expect(manifest.version).toBe(JSON.parse(read('package.json')).version)
    expect(manifest.algorithm).toBe('sha384')
    expect(Object.keys(manifest.assets).length).toBeGreaterThan(0)
    for(const [file,entry]of Object.entries(manifest.assets)){
      expect(file).not.toMatch(/(^\/|\\|(?:^|\/)\.\.(?:\/|$))/)
      const bytes=readFileSync('dist/'+file)
      expect(bytes.byteLength,file).toBe(entry.bytes)
      expect('sha384-'+createHash('sha384').update(bytes).digest('base64'),file).toBe(entry.integrity)
    }
  })

  it('uses portable source-map paths without local machine directories',()=>{
    const walk=(directory:string):string[]=>readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(directory+'/'+entry.name):[directory+'/'+entry.name])
    const maps=walk('dist').filter(file=>file.endsWith('.map'))
    expect(maps.length).toBeGreaterThan(0)
    for(const file of maps){
      const map=JSON.parse(read(file)) as {sources:string[]}
      for(const source of map.sources)expect(source,file).not.toMatch(/^(?:[a-z]:[\\/]|\/|file:)/i)
    }
    const file='js/dist/alert.js.map'
    const map=JSON.parse(read(file)) as {sources:string[]}
    expect(resolve(dirname(file),map.sources[0]!)).toBe(resolve('src/js/alert.ts'))
  })
})
