import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'

async function walk(dir){const result=[];for(const entry of await readdir(dir,{withFileTypes:true})){assert(!entry.isSymbolicLink(),'Unexpected symlink: '+dir+'/'+entry.name);const file=dir+'/'+entry.name;if(entry.isDirectory())result.push(...await walk(file));else result.push(file)}return result.sort()}
const hashes=async files=>Object.fromEntries(await Promise.all(files.map(async file=>[file,createHash('sha256').update(await readFile(file)).digest('hex')])))
const site=await walk('site-dist')
const sets={
  protectedInputs:[...await walk('src'),...await walk('metadata'),'package.json','package-lock.json','LICENSE','licenses/third-party-code.txt','tsconfig.core.json','tsconfig.core-types.json','tsconfig.json','site/public/docs.css','playwright.docs-visual.config.ts','playwright.visual.config.ts',...await walk('dist')].sort(),
  snapshots:[...await walk('tests/site-visual/snapshots'),...await walk('tests/visual/snapshots')].sort(),
  routes:site.filter(file=>file.endsWith('/index.html')),
  renderAssets:site.filter(file=>!file.startsWith('site-dist/pagefind/')&&/\.(?:css|[cm]?js|svg|woff2?|ttf|otf|png|jpe?g|webp|gif|avif)$/.test(file))
}
const file='artifacts/full-quality-before.json'
if(process.argv.includes('--before')){
  try{await readFile(file);throw new Error('Full quality baseline already exists; retain the original evidence')}catch(error){if(error.code!=='ENOENT')throw error}
  const before={}
  for(const [name,files]of Object.entries(sets))before[name]=await hashes(files)
  await writeFile(file,JSON.stringify(before,null,2)+'\n')
  console.log(JSON.stringify(Object.fromEntries(Object.entries(before).map(([name,values])=>[name,Object.keys(values).length]))))
}else{
  const before=JSON.parse(await readFile(file,'utf8')),result={}
  for(const [name,files]of Object.entries(sets)){
    const current=await hashes(files)
    const changed=Object.keys(before[name]).filter(path=>path in current&&current[path]!==before[name][path])
    const removed=Object.keys(before[name]).filter(path=>!(path in current))
    const added=Object.keys(current).filter(path=>!(path in before[name]))
    result[name]={total:files.length,changed,removed,added}
  }
  await writeFile('artifacts/full-quality-identities.json',JSON.stringify(result,null,2)+'\n')
  for(const [name,value]of Object.entries(result))assert.deepEqual({changed:value.changed,removed:value.removed,added:value.added},{changed:[],removed:[],added:[]},'Unexpected qualification change: '+name)
  console.log('Full qualification scope unchanged: '+JSON.stringify(Object.fromEntries(Object.entries(result).map(([name,value])=>[name,value.total]))))
}
