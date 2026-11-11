import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

const read=(file:string)=>readFileSync(file,'utf8')
const require=createRequire(import.meta.url)
const semver=require('semver') as {coerce:(version:string)=>{version:string}|null;satisfies:(version:string,range:string)=>boolean}
const tools=['astro','vitest','vite','sass','jsdom'].map(name=>JSON.parse(read('node_modules/'+name+'/package.json')) as {name:string;version:string;engines:{node:string}})
describe('repository development toolchain',()=>{
  it('distinguishes locked repository installs from future registry publication',()=>{
    const readme=read('README.md')
    expect(readme).toContain('### Available now: local package')
    expect(readme).toContain('### After verified npm publication only')
    expect(readme).toContain('npm i tremplin@<published-version>')
    expect(readme).toContain('GitHub repository ownership does not establish ownership of an npm name')
    expect(readme).toContain('npm install ./vendor/tremplin-0.8.0-beta.0.tgz')
    expect(read('.github/workflows/ci.yml')).toContain('run: npm install')
    expect(read('site/src/pages/index.astro')).toContain('<code>{registryInstallCommand}</code>')
    expect(read('site/src/pages/index.astro')).toContain('Until publication is verified')
  })
  for(const workflow of ['ci','docs','release']) it(workflow+': Node version supports every installed development tool and pin preparation precedes builds',()=>{
    const source=read('.github/workflows/'+workflow+'.yml')
    expect(source).toContain('run: npm install')
    expect(source).toContain('git diff --exit-code -- package.json package-lock.json')
    const node=source.match(/node-version:\s*['"]?([\d.]+)/)![1]!
    const version=semver.coerce(node)!.version
    for(const tool of tools) expect(semver.satisfies(version,tool.engines.node),tool.name+' '+tool.version+' requires '+tool.engines.node).toBe(true)
    const prepare=source.indexOf('npm run audit:tremplin -- --fetch --stage --check')
    const build=source.indexOf(workflow==='docs'?'npm run build:site':workflow==='ci'?'npm run check':'uses: changesets/action')
    expect(prepare).toBeGreaterThan(-1)
    expect(build).toBeGreaterThan(prepare)
  })
  it('keeps the publication block and public consumer exports unchanged',()=>{
    const manifest=JSON.parse(read('package.json'))
    expect(manifest.tremplinMigration).toEqual({profile:'strict-core-unreleased',releaseBlocked:true})
    const api=JSON.parse(read('metadata/public-api.json'))
    expect(Object.keys(manifest.exports).sort()).toEqual(api.packageExports.map((entry:{specifier:string})=>entry.specifier).sort())
    expect(read('CONTRIBUTING.md')).toContain('Use Node.js 24')
  })
})
