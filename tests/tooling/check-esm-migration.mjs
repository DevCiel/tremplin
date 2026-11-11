import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
const read=async file=>JSON.parse(await readFile(file,'utf8'))
const hash=async file=>createHash('sha256').update(await readFile(file)).digest('hex')
async function walk(dir){const out=[];for(const entry of await readdir(dir,{withFileTypes:true})){assert(!entry.isSymbolicLink());const file=dir+'/'+entry.name;if(entry.isDirectory())out.push(...await walk(file));else out.push(file)}return out.sort()}
const hashes=async files=>Object.fromEntries(await Promise.all(files.map(async file=>[file,await hash(file)])))
const protectedFiles=[...await walk('src'),'metadata/strict-api-baseline.json','metadata/bootstrap6-security-patches.json','metadata/bootstrap6-reference.json','metadata/api.json','metadata/public-api.json','package.json','package-lock.json','tsconfig.core.json','tsconfig.core-types.json','tsconfig.json','site/public/docs.css','playwright.docs-visual.config.ts',...await walk('dist/css')]
const snapshots=[...await walk('tests/site-visual/snapshots'),...await walk('tests/visual/snapshots')]
if(process.argv.includes('--before')) {
  try{await readFile('artifacts/esm-migration-before.json');throw new Error('ESM baseline already exists')}catch(error){if(error.code!=='ENOENT')throw error}
  await mkdir('artifacts/esm-migration-originals',{recursive:true})
  for(const file of snapshots)await copyFile(file,'artifacts/esm-migration-originals/'+file.split('/').at(-1))
  await writeFile('artifacts/esm-migration-before.json',JSON.stringify({protectedInputs:await hashes(protectedFiles),snapshots:await hashes(snapshots),routes:await hashes((await walk('site-dist')).filter(file=>file.endsWith('/index.html')))},null,2)+'\n')
  console.log('Recorded immutable core/API/CSS and recoverable screenshot baseline.')
} else {
  const before=await read('artifacts/esm-migration-before.json'),protectedNow=await hashes(protectedFiles)
  assert.deepEqual(protectedNow,before.protectedInputs,'Core/API/CSS/profile changed during distribution migration')
  const audit=await read('artifacts/distribution-contract-audit.json')
  assert(audit.browserDistributionParity,'Browser distribution gaps remain')
  const current=await hashes(snapshots)
  assert.deepEqual(Object.keys(current),Object.keys(before.snapshots),'Screenshot inventory changed')
  const routes=await hashes((await walk('site-dist')).filter(file=>file.endsWith('/index.html')))
  assert.deepEqual(Object.keys(routes),Object.keys(before.routes),'Documentation route inventory changed')
  const changedRoutes=Object.keys(routes).filter(file=>routes[file]!==before.routes[file])
  const changed=Object.keys(before.snapshots).filter(file=>current[file]!==before.snapshots[file])
  const reviewed=new Set(['datepicker-guide','range-guide','strength-guide','command-palette-guide','installation-guide'].flatMap(name=>['','-dark','-rtl'].map(theme=>name+theme+'.png')))
  assert(changed.every(file=>reviewed.has(file.split('/').at(-1))),'Unrelated screenshot baseline changed')
  for(const file of Object.keys(before.snapshots))assert.equal(await hash('artifacts/esm-migration-originals/'+file.split('/').at(-1)),before.snapshots[file])
  await writeFile('artifacts/esm-migration-identities.json',JSON.stringify({protectedInputsUnchanged:Object.keys(protectedNow).length,routes:Object.keys(routes).length,changedRoutes,currentRouteHashes:routes,savedImages:Object.keys(current).length,changedImages:changed,currentSnapshotHashes:current,releaseBlocked:true},null,2)+'\n')
  console.log(JSON.stringify({protectedInputsUnchanged:Object.keys(protectedNow).length,changedImages:changed}))
}
