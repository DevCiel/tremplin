// Catalog and path safety shared by the optional example tools.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {createServer} from 'node:http'
import {lstat,mkdir,readFile,readdir,realpath} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {JSDOM} from 'jsdom'
import postcss from 'postcss'
import {activeDistributionExceptions} from '../../build/lib/distribution-notices.mjs'
export const projectRoot=fileURLToPath(new URL('../../',import.meta.url))
export async function safeFile(root,file){
  assert(typeof file==='string'&&!path.isAbsolute(file)&&!file.includes('\\')&&!file.includes(':')&&file.split('/').every(p=>p&&p!=='.'&&p!=='..'),'Unsafe example path')
  let current=path.resolve(root)
  assert(!(await lstat(current)).isSymbolicLink(),'Linked root')
  for(const p of file.split('/')){current=path.join(current,p);assert(!(await lstat(current)).isSymbolicLink(),'Linked input')}
  assert((await realpath(current)).startsWith((await realpath(root))+path.sep),'Path escapes root')
  assert((await lstat(current)).isFile(),'Expected file')
  return current
}
export function exampleArguments(args){
  let only=null,dryRun=false
  for(let i=0;i<args.length;i++){
    if(args[i]==='--dry-run'){assert(!dryRun,'Duplicate flag');dryRun=true}
    else if(args[i]==='--only'){assert(only===null&&args[i+1]&&!args[i+1].startsWith('--'),'--only needs comma-separated slugs');only=args[++i].split(',');assert(only.every(s=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s))&&new Set(only).size===only.length,'Invalid selection')}
    else throw Error('Unknown example argument: '+args[i])
  }
  return {only,dryRun}
}
export async function loadExamples(root=projectRoot,only=null){
  const catalog=JSON.parse(await readFile(await safeFile(root,'site/data/examples.json'),'utf8'))
  assert(Array.isArray(catalog)&&catalog.length,'Empty catalog')
  assert.equal(new Set(catalog.map(e=>e.slug)).size,catalog.length,'Duplicate slugs')
  for(const e of catalog){assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.slug)&&e.file===`examples/${e.slug}.html`&&typeof e.title==='string'&&/^[\w ,.-]+$/.test(e.title),'Invalid catalog');await safeFile(root,e.file)}
  if(only)assert(only.length&&only.every(s=>catalog.some(e=>e.slug===s)),'Unknown example selection')
  const selected=only?catalog.filter(e=>only.includes(e.slug)):catalog,assets=[]
  async function walk(dir){const stat=await lstat(path.join(root,dir));assert(stat.isDirectory()&&!stat.isSymbolicLink(),'Linked asset directory');for(const e of await readdir(path.join(root,dir),{withFileTypes:true})){assert(!e.isSymbolicLink(),'Linked asset');const file=dir+'/'+e.name;if(e.isDirectory())await walk(file);else{await safeFile(root,file);assets.push(file)}}}
  await walk('dist')
  const policy=JSON.parse(await readFile(path.join(projectRoot,'metadata/core-delivery-reference.json'),'utf8'))
  const expected=[...policy.reference.files.filter(e=>/^dist\/(css|js)\//.test(e.path)).map(e=>e.path.replace(/(^|\/)bootstrap(?=[.-])/g,'$1tremplin')),...activeDistributionExceptions(policy),'dist/integrity.json'].sort()
  assert.deepEqual(assets.slice().sort(),expected,'Build the complete core before using example tools')
  for(const e of selected)for(const file of e.assets??[]){assert(/^examples\/[\w-]+\.css$/.test(file),'Unsupported local demo asset');await safeFile(root,file);if(!assets.includes(file))assets.push(file)}
  const integrity=JSON.parse(await readFile(await safeFile(root,'dist/integrity.json'),'utf8'))
  const version=JSON.parse(await readFile(await safeFile(root,'package.json'),'utf8')).version
  assert.equal(integrity.version,version,'Example assets belong to a different version')
  for(const[file,item]of Object.entries(integrity.assets)){const b=await readFile(await safeFile(root,'dist/'+file));assert.equal('sha384-'+createHash('sha384').update(b).digest('base64'),item.integrity,'Dependency integrity mismatch')}
  const coreStyles=await readFile(await safeFile(root,'dist/css/tremplin.css'),'utf8')
  for(const e of selected){
    const dom=new JSDOM(await readFile(await safeFile(root,e.file),'utf8'))
    try{
      const sheets=[coreStyles,...await Promise.all((e.assets??[]).map(async file=>readFile(await safeFile(root,file),'utf8'))),...[...dom.window.document.querySelectorAll('style')].map(node=>node.textContent)]
      let selectors='';for(const sheet of sheets)postcss.parse(sheet).walkRules(rule=>{selectors+=rule.selector+'\n'})
      const hooks=e.behaviorHooks??[]
      assert(hooks.every(name=>['carousel-control-prev','carousel-control-next'].includes(name)),'Unreviewed behavior-only class')
      for(const node of dom.window.document.querySelectorAll('[class]'))for(const name of node.classList){
        if(hooks.includes(name))continue
        const escaped=name.replaceAll(':','\\:').replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
        assert(new RegExp('\\.'+escaped+'(?![\\w-])').test(selectors),'Unstyled or retired example class: '+name)
      }
    }finally{dom.window.close()}
  }
  for(const e of selected){const dom=new JSDOM(await readFile(await safeFile(root,e.file),'utf8'),{url:'http://local/'+e.file});try{for(const element of dom.window.document.querySelectorAll('script[src],link[rel="stylesheet"][href],img[src]')){const url=new URL(element.getAttribute(element.tagName==='LINK'?'href':'src'),'http://local/'+e.file);assert.equal(url.origin,'http://local','Remote dependency');assert(assets.includes(decodeURIComponent(url.pathname.slice(1))),'Unpackaged dependency: '+url.pathname)}}finally{dom.window.close()}}
  return {selected,assets:assets.sort(),version}
}
export async function exampleOutput(root,subdirectory=''){
  let output=path.resolve(root)
  for(const segment of ['artifacts','examples',...(subdirectory?[subdirectory]:[])]){assert(/^[\w-]+$/.test(segment));output=path.join(output,segment);const stat=await lstat(output).catch(e=>{if(e.code==='ENOENT')return null;throw e});assert(!stat||stat.isDirectory()&&!stat.isSymbolicLink(),'Unsafe output');if(!stat)await mkdir(output)}
  return output
}
export async function startExampleServer(root,files){
  const allowed=new Set(files),types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.json':'application/json','.map':'application/json'}
  const server=createServer(async(req,res)=>{try{const file=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1);if(!allowed.has(file)){res.writeHead(404).end();return}const data=await readFile(await safeFile(root,file));res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream','Cache-Control':'no-store'}).end(data)}catch{res.writeHead(400).end()}})
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)})
  return {url:'http://127.0.0.1:'+server.address().port,close:()=>new Promise((resolve,reject)=>{server.close(e=>e?reject(e):resolve());server.closeAllConnections()})}
}
