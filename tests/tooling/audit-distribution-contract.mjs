// Inspect the immutable reference and actual emitted build. Reports differences;
// does not refresh API baselines, rewrite distributions or approve a release.
import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import ts from 'typescript-bootstrap'
import { gitBlobHash, sha256 } from '../../build/lib/tremplin-core.mjs'

const json=async file=>JSON.parse(await readFile(file,'utf8'))
const pin=await json('metadata/bootstrap6-reference.json')
const product=await json('package.json')
const base='artifacts/bootstrap6-reference/'+pin.commit+'/'
const inventory=await json(base+'reference-manifest.json')
assert.equal(inventory.commit,pin.commit)
const upstreamFile='build/rolldown.config.mjs'
const raw=await readFile(base+upstreamFile)
assert.equal(gitBlobHash(raw),inventory.files.find(file=>file.path===upstreamFile)?.sha,'Pinned build reference modified')
const upstream=raw.toString()
const upstreamFormat=upstream.match(/format:\s*'([^']+)'/)?.[1]
const dependencyList=upstream.match(/const external = \[([^\]]+)\]/)?.[1]
assert(upstreamFormat && dependencyList,'Unknown pinned build shape; review before interpreting it')
const dependencies=[...dependencyList.matchAll(/'([^']+)'/g)].map(match=>match[1])
assert(upstream.includes('external.length = 0'),'Unknown pinned bundle dependency policy')
const graph=await json('artifacts/core-build-graph.json')
assert.equal(graph.commit,pin.commit)
const downloads=[]
for(const name of ['tremplin.min','tremplin.bundle.min']) {
  const build=graph.graphs.find(entry=>entry.name===name)
  assert(build,'Missing browser build '+name)
  const file='dist/js/'+name+'.js', bytes=await readFile(file)
  const source=ts.createSourceFile(file,bytes.toString(),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS)
  assert.equal(source.parseDiagnostics.length,0)
  const hasModuleSyntax=ts.isExternalModule(source)
  assert.equal(hasModuleSyntax,build.format==='esm','Build metadata disagrees with emitted module syntax')
  const inputs=Object.keys(build.inputs)
  const externalDependencies=[...new Set(Object.values(build.outputs).flatMap(output=>output.imports.filter(item=>item.external).map(item=>item.path)))].sort()
  assert(!bytes.toString().includes('TremplinFramework'),'Public download creates an obsolete global')
  assert(bytes.toString().includes('THIRD_PARTY_NOTICES.txt'),'Missing distributed license banner')
  downloads.push({file,format:build.format,hasModuleSyntax,sha256:sha256(bytes),externalDependencies,bundledDependencies:dependencies.filter(name=>inputs.some(file=>file.replaceAll('\\','/').includes('node_modules/'+name+'/')))})
}
const differences=[]
if(downloads.some(file=>file.format!==upstreamFormat)) differences.push({code:'DIST-001',summary:'Canonical browser downloads are IIFEs instead of the pinned ESM format.',impact:'Changing these existing paths requires coordinated markup, globals, documentation, runtime-owner and consumer test migration.'})
if(downloads.find(file=>file.file.endsWith('/tremplin.min.js')).bundledDependencies.length) differences.push({code:'DIST-002',summary:'The standard browser download bundles positioning/calendar dependencies; the pinned standard download leaves them external.',impact:'The standard build must use dependency resolution/import maps while the ESM bundle remains self-contained.'})
const notice=await readFile('licenses/third-party-code.txt'),expectedNotice=await readFile(base+'LICENSE')
assert(notice.equals(expectedNotice),'Root notice differs from the verified pinned license')
assert.deepEqual(downloads[0].externalDependencies,[...dependencies].sort(),'Standard build must externalize both pinned peers')
assert.deepEqual(downloads[1].externalDependencies,[],'Bundle must be self-contained')
assert.deepEqual(downloads[1].bundledDependencies,dependencies,'Bundle must include both pinned dependencies')
assert((await readFile('dist/THIRD_PARTY_NOTICES.txt','utf8')).includes(notice.toString()),'Distributed upstream notice differs')
assert((await readFile('dist/LICENSE')).equals(await readFile('LICENSE')),'Distributed Tremplin notice differs')
const thirdParty=await readFile('dist/THIRD_PARTY_NOTICES.txt','utf8')
for(const name of ['@floating-ui/core','@floating-ui/dom','@floating-ui/utils','vanilla-calendar-pro']) {
  assert(thirdParty.includes(await readFile('node_modules/'+name+'/LICENSE','utf8')),'Missing full dependency license: '+name)
}
for(const name of ['floating-ui','vanilla-calendar-pro']) {
  const code=await readFile('artifacts/documentation-assets/dist/vendor/'+name+'.js','utf8')
  assert(ts.isExternalModule(ts.createSourceFile(name+'.js',code,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS)),'Local dependency must be ESM')
}
const report={commit:pin.commit,version:product.version,reference:{path:upstreamFile,gitBlobVerified:true,browserFormat:upstreamFormat,standardExternalDependencies:dependencies,bundleExternalDependencies:[]},current:{browserDownloads:downloads,standardAndBundleIdentical:downloads[0].sha256===downloads[1].sha256,upstreamNoticeMatches:true},browserDistributionParity:differences.length===0,differences,coreSourceChanged:false,apiBaselineChanged:false,published:false,releaseBlocked:product.tremplinMigration.releaseBlocked}
await writeFile('artifacts/distribution-contract-audit.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({browserDistributionParity:report.browserDistributionParity,differences:differences.map(item=>item.code),report:'artifacts/distribution-contract-audit.json',releaseBlocked:report.releaseBlocked}))
