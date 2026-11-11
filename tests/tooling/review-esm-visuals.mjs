import assert from 'node:assert/strict'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { PNG } from 'pngjs'

async function walk(dir){const files=[];for(const entry of await readdir(dir,{withFileTypes:true})){assert(!entry.isSymbolicLink());const file=dir+'/'+entry.name;if(entry.isDirectory())files.push(...await walk(file));else files.push(file)}return files}
const review=[]
for(const file of (await walk('artifacts/esm-visual-initial')).filter(file=>file.endsWith('-actual.png')).sort()) {
  const name=file.split('/').at(-1).replace('-actual.png','.png')
  const before=PNG.sync.read(await readFile('artifacts/esm-migration-originals/'+name))
  const after=PNG.sync.read(await readFile(file))
  assert.equal(after.width,before.width,'Unexpected layout width change: '+name)
  let firstDifference=0
  for(;firstDifference<Math.min(before.height,after.height);firstDifference++) {
    const start=firstDifference*before.width*4,end=start+before.width*4
    if(!before.data.subarray(start,end).equals(after.data.subarray(start,end)))break
  }
  const prefixRatio=firstDifference/before.height
  assert(prefixRatio>(name.startsWith('installation-')?0.35:0.80),'Unexpected changes before the edited documentation block: '+name)
  review.push({file:name,width:after.width,previousHeight:before.height,currentHeight:after.height,unchangedPrefixRows:firstDifference,unchangedPrefixRatio:prefixRatio,scope:name.startsWith('installation-')?'ESM loading/CDN integrity, local peers, import map and following content':'Explicit module setup block and following pagination'})
}
assert.equal(review.length,15,'Unexpected visual change inventory')
await writeFile('artifacts/esm-visual-review.json',JSON.stringify({originalsRetained:true,initialComparison:'124 passed; 15 expected content changes',toleranceUnchanged:0.03,review},null,2)+'\n')
console.log(JSON.stringify(review.map(({file,unchangedPrefixRatio})=>({file,unchangedPrefixRatio}))))
