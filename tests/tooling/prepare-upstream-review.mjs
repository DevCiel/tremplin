import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { gitBlobHash, moduleKind, safeReferencePath, sha256 } from '../../build/lib/tremplin-core.mjs'

// Prepare evidence only. Never writes production source, policies or baselines.
const target=process.argv[2]
assert.match(target??'',/^[a-f0-9]{40}$/,'Supply an immutable target commit')
const pin=JSON.parse(await readFile('metadata/bootstrap6-reference.json','utf8'))
assert.notEqual(target,pin.commit,'Review a different upstream commit')
const oldRoot=path.resolve('artifacts/bootstrap6-reference',pin.commit)
const oldManifest=JSON.parse(await readFile(path.join(oldRoot,'reference-manifest.json'),'utf8'))
const oldFiles=new Map(oldManifest.files.map(entry=>[entry.path,entry.sha]))
const targetRoot=path.resolve('artifacts/bootstrap6-reference',target)
const get=async url=>{const response=await fetch(url,{headers:{'User-Agent':'Tremplin-upstream-review'}});if(!response.ok)throw new Error(`${response.status}: ${url}`);return response}
const relevant=file=>moduleKind(file)||['LICENSE','package.json','tsconfig.json'].includes(file)||/^build\/(?:tsconfig.*\.json|rolldown\.config\.mjs|postcss\.config\.mjs|css-minify\.mjs|build-plugins\.mjs)$/.test(file)||file.startsWith('js/tests/')||file.startsWith('scss/tests/')||/^site\/src\/content\/docs\/.*\.mdx$/.test(file)
const tree=await(await get(`https://api.github.com/repos/twbs/bootstrap/git/trees/${target}?recursive=1`)).json()
assert.equal(tree.truncated,false)
const blobs=tree.tree.filter(entry=>entry.type==='blob'&&relevant(entry.path))
let cursor=0,reused=0,fetched=0
await Promise.all(Array.from({length:6},async()=>{
  while(cursor<blobs.length){
    const entry=blobs[cursor++];safeReferencePath(entry.path)
    let bytes
    if(oldFiles.get(entry.path)===entry.sha){bytes=await readFile(path.join(oldRoot,entry.path));reused++}
    else{bytes=Buffer.from(await(await get(`https://raw.githubusercontent.com/twbs/bootstrap/${target}/${entry.path}`)).arrayBuffer());fetched++}
    assert.equal(gitBlobHash(bytes),entry.sha,'Unverified Git blob: '+entry.path)
    const destination=path.join(targetRoot,entry.path);await mkdir(path.dirname(destination),{recursive:true});await writeFile(destination,bytes)
  }
}))
await writeFile(path.join(targetRoot,'reference-manifest.json'),JSON.stringify({commit:target,files:blobs.map(({path,sha})=>({path,sha}))},null,2)+'\n')
const pkg=JSON.parse(await readFile(path.join(targetRoot,'package.json'),'utf8'))
const changed=blobs.filter(entry=>oldFiles.get(entry.path)!==entry.sha)
const report={from:pin.commit,target,upstreamVersion:pkg.version,typescript:pkg.devDependencies.typescript,gitVerifiedFiles:blobs.length,reused,fetched,expectedCoreModules:Object.fromEntries(['scss','javascript'].map(kind=>[kind,blobs.filter(entry=>moduleKind(entry.path)===kind).length])),changedCore:changed.filter(entry=>moduleKind(entry.path)).map(({path,sha})=>({path,sha,status:oldFiles.has(path)?'modified':'added'})),removedCore:oldManifest.files.filter(entry=>moduleKind(entry.path)&&!blobs.some(item=>item.path===entry.path)).map(entry=>entry.path),productionModified:false}
await mkdir('artifacts',{recursive:true})
await writeFile('artifacts/upstream-review-'+target.slice(0,7)+'.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(report,null,2))
