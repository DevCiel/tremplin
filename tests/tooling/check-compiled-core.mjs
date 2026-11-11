// Read-only output contracts and private graph/report assembly after npm stages.
import assert from 'node:assert/strict'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { budgets } from '../../build/bundlewatch-table.mjs'
import {activeDistributionExceptions} from '../../build/lib/distribution-notices.mjs'
const json = async file => JSON.parse(await readFile(file,'utf8'))
export async function verifyCompiledCore(preview=false) {
  const destination=preview?'artifacts/core-delivery-preview':'dist'
  const policy=await json('metadata/core-delivery-reference.json')
  assert.equal((await json('package.json')).tremplinMigration.releaseBlocked,true)
  const builds=await Promise.all(['standalone','bundle'].map(kind=>json(`artifacts/${preview?'preview':'core'}-stage-${kind}.json`)))
  for(const build of builds) {
    assert.equal(build.exports.length,20)
    assert(!build.inputs.some(file=>/src\/(?:adapters|runtime|js\/extensions)\//.test(file)))
    assert.deepEqual(build.imports,build.file.includes('.bundle.')?[]:['@floating-ui/dom','vanilla-calendar-pro'])
    for(const file of [build.file,build.file.replace(/\.js$/,'.min.js')]) {
      const code=await readFile(destination+'/'+file,'utf8')
      assert(code.includes('Tremplin')&&code.includes('The Bootstrap Authors'),'Missing distribution attribution')
    }
  }
  const walk=async dir=>(await Promise.all((await readdir(dir,{withFileTypes:true})).map(async entry=>entry.isDirectory()?walk(dir+'/'+entry.name):[dir+'/'+entry.name]))).flat().sort()
  const actual=(await walk(destination)).map(file=>file.slice(destination.length+1))
  const expected=policy.reference.files.filter(file=>/^dist\/(css|js)\//.test(file.path)).map(file=>file.path.replace(/^dist\//,'').replace(/(^|\/)bootstrap(?=[.-])/g,'$1tremplin'))
  assert.deepEqual(actual,[...expected,...activeDistributionExceptions(policy).map(file=>file.replace(/^dist\//,'')),...(preview?[]:['integrity.json'])].sort(),'Unexpected compiled inventory')
  for(const file of actual.filter(file=>file.endsWith('.map'))) for(const source of (await json(destination+'/'+file)).sources) assert(!/^(?:[a-z]:[\\/]|\/|file:)/i.test(source),'Nonportable source map')
  const graphs=builds.flatMap(build=>{
    const name=path.basename(build.file,'.js'),inputs=Object.fromEntries(build.inputs.map(file=>[path.relative(process.cwd(),file).split(path.sep).join('/'),{}]))
    const outputs={[build.file]:{imports:build.imports.map(file=>({path:file,external:true}))}}
    return [name,name+'.min'].map(name=>({name,format:'esm',inputs,outputs}))
  })
  if(!preview)await writeFile('artifacts/core-build-graph.json',JSON.stringify({commit:policy.reference.commit,profile:'strict-core-unreleased',compiler:'rolldown-terser',graphs,defaultGraph:graphs.find(graph=>graph.name==='tremplin')},null,2)+'\n')
  const metadata=await json(destination+'/css/tremplin-utilities.metadata.json')
  const report={commit:policy.reference.commit,status:'compiled-and-contract-checked-preview',coreFiles:expected.length,utilityFamilies:Object.keys(metadata.utilities).length,files:actual,builds,packageExportsChanged:false,activeBrowserDistributionChanged:false,releaseBlocked:true,published:false,budgets:[]}
  for(const[file,maximum]of budgets){const bytes=gzipSync(await readFile(destination+'/'+file.replace(/^dist\//,'')),{level:9}).byteLength;report.budgets.push({file,bytes,maximum,passed:bytes<=maximum})}
  report.budgetReady=report.budgets.every(item=>item.passed)
  assert(report.budgetReady,'Compiled download exceeds approved size budget')
  if(preview)await writeFile('artifacts/core-delivery-preview-report.json',JSON.stringify(report,null,2)+'\n')
  console.log(`Verified ${preview?'preview':'active'} npm-stage output: 25 core downloads, 20 exports, portable maps and unchanged size budgets.`)
  return report
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  assert(process.argv.slice(2).length===0,'No arguments supported')
  await verifyCompiledCore()
}
