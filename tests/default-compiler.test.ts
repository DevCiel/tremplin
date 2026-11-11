import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { assertReviewedUpstreamInput } from './helpers/documentation-scope'
import { relocateToolPaths } from './tooling/lib/tool-paths.mjs'
import {brandTooling} from './tooling/lib/tremplin-tooling.mjs'
import { projectSiteScripts } from './tooling/lib/site-architecture.mjs'

const read=(file:string)=>JSON.parse(readFileSync(file,'utf8'))
const files=(root:string):string[]=>readdirSync(root,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(root+'/'+entry.name):[root+'/'+entry.name]).sort()

describe('default compiler and physical output retirement',()=>{
  it.each(['interactions','kitchen-sink','advanced-interactions'])('retained %s example uses one self-contained build without retired import maps',name=>{
    const source=readFileSync('examples/'+name+'.html','utf8')
    expect(source).toContain('type="module" src="../dist/js/tremplin.bundle.min.js"')
    expect(source).not.toContain('../dist/vendor/')
    expect(source).not.toContain('type="importmap"')
  })
  it('keeps the retained optional discovery demo on one private combined graph',()=>{
    const source=readFileSync('examples/discovery.html','utf8')
    expect(source).toContain('../site/public/js/tremplin-command-palette.min.js')
    expect(source).toContain('../artifacts/documentation-assets/dist/css/tremplin-extensions.css')
    expect(source.match(/<script type="module"/g)).toHaveLength(1)
    expect(source).not.toContain('../dist/vendor/')
    expect(source).not.toContain('../dist/js/extensions/')
  })
  it('rebuilds exactly the pinned core download names with declared required exceptions',()=>{
    const policy=read('metadata/core-delivery-reference.json')
    const expected=[...policy.reference.files.filter((file:{path:string})=>/^dist\/(css|js)\//.test(file.path)).map((file:{path:string})=>file.path.replace(/(^|\/)bootstrap(?=[.-])/g,'$1tremplin')),...read('metadata/tremplin-branding.json').distributionExceptions,'dist/integrity.json'].sort()
    expect(files('dist')).toEqual(expected)
    expect(expected).toHaveLength(29)
    expect(execFileSync(process.execPath,['tests/tooling/check-core-output.mjs'],{encoding:'utf8'})).toContain('Core output inventory passed')
  })

  it('switches actual commands and refuses obsolete root outputs and compiler tools',()=>{
    const pkg=read('package.json'),scope=read('metadata/compiler-cutover.json')
    const stages=read('metadata/npm-build-stages.json')
    for(const [name,change]of Object.entries(scope.scriptReplacements) as [string,{after:string}][]) {
      const historical=brandTooling(stages.scriptReplacements[name]?.after??relocateToolPaths(change.after))
      const expected=name==='site:prepare'?projectSiteScripts({'site:prepare':historical})['site:prepare']:historical
      expect(pkg.scripts[name]).toBe(expected)
    }
    expect(pkg.scripts['build:css:extensions']).toBeUndefined()
    expect(pkg.scripts['build:css']).toBe('npm run css-compile && npm run css-prefix && npm run css-minify && npm run css-docs && npm run build:css:assets')
    expect(pkg.scripts['build:js']).toContain('npm run js-build')
    for(const file of [...scope.retiredTools,...scope.retiredOutputRoots,scope.retiredReport])expect(existsSync(file),file).toBe(false)
    for(const file of stages.retiredTools)expect(existsSync(file)).toBe(false)
    expect(spawnSync(process.execPath,['build/postcss.config.mjs','--unapproved'],{encoding:'utf8'}).status).not.toBe(0)
  })

  it('matches the qualified preview without copying preview files into production',()=>{
    for(const file of files('dist').filter(file=>/\/(?:css|js)\//.test(file)&&!file.endsWith('.map')))expect(readFileSync(file).equals(readFileSync(file.replace(/^dist\//,'artifacts/core-delivery-preview/'))),file).toBe(true)
    // Maps intentionally differ by output-relative paths; both must resolve.
    for(const file of files('dist').filter(file=>file.endsWith('.map')))for(const source of read(file).sources)expect(source).not.toMatch(/^(?:file:|[a-z]:[\\/]|\/)/i)
  })

  it('records real Rolldown inputs, twenty exports and no optional/runtime graph',()=>{
    const graph=read('artifacts/core-build-graph.json')
    expect(graph.compiler).toBe('rolldown-terser')
    expect(graph.graphs).toHaveLength(4)
    for(const build of graph.graphs)expect(Object.keys(build.inputs).some(file=>/src\/(?:runtime|adapters|js\/extensions)\//.test(file))).toBe(false)
    expect(read('artifacts/core-delivery-preview-report.json').builds.every((build:{exports:string[]})=>build.exports.length===20)).toBe(true)
  })

  it('keeps private CSS/dependencies out of core but available to documentation mirrors',()=>{
    expect(files('artifacts/documentation-assets/dist')).toHaveLength(8)
    for(const file of files('artifacts/documentation-assets/dist'))expect(readFileSync(file).equals(readFileSync(file.replace('artifacts/documentation-assets','site/public')))).toBe(true)
    expect(existsSync('dist/vendor')).toBe(false)
    expect(existsSync('dist/css/tremplin-extensions.css')).toBe(false)
  })

  it('rejects arbitrary CSS changes instead of refreshing historical hashes for compiler output',()=>{
    const scope=read('metadata/upstream-transition-9062790.json').historicalScopeUpdates.find((entry:{file:string})=>entry.file==='dist/css/tremplin.css')
    const css=readFileSync('dist/css/tremplin.css','utf8')
    expect(()=>assertReviewedUpstreamInput(scope.file,scope.before,Buffer.from(css))).not.toThrow()
    expect(()=>assertReviewedUpstreamInput(scope.file,scope.before,Buffer.from(css+'\n.injected { color: red; }'))).toThrow()
    expect(()=>assertReviewedUpstreamInput(scope.file,'0'.repeat(64),Buffer.from(css))).toThrow()
  })
})
