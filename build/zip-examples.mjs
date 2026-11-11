#!/usr/bin/env node
/*!
 * Package runnable examples, adapted from Bootstrap's zip-examples.mjs.
 * Copyright 2020-2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * Portable in-process ZIP, verified assets/notices, no shell deletion.
 */
import assert from 'node:assert/strict'
import {readFile,writeFile,lstat} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {zipSync} from 'fflate'
import {exampleArguments,exampleOutput,loadExamples,projectRoot,safeFile} from '../site/build/examples.mjs'
const serverSource=`import {createServer} from 'node:http';
import {readFile,realpath,lstat} from 'node:fs/promises';
import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=await realpath(fileURLToPath(new URL('./',import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.json':'application/json','.map':'application/json'};
const server=createServer(async(req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(name.includes('\\\\')||name.split('/').includes('..'))throw Error();let file=path.resolve(root,'.'+name);if((await lstat(file)).isDirectory())file=path.join(file,'index.html');file=await realpath(file);if(!file.startsWith(root+path.sep))throw Error();res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream','Cache-Control':'no-store'});res.end(await readFile(file))}catch{res.writeHead(404);res.end('Not found')}});
server.listen(Number(process.env.PORT??4178),'127.0.0.1',()=>console.log('Examples: http://127.0.0.1:'+server.address().port));
`
export async function zipExamples(root=projectRoot,options={only:null,dryRun:false}){
  const catalog=await loadExamples(root,options.only)
  assert(/^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?$/.test(catalog.version),'Unsafe archive version')
  const folder=`tremplin-${catalog.version}-examples`,inputs=[...catalog.assets,...catalog.selected.map(e=>e.file)].sort()
  if(options.dryRun)return {mode:'dry-run',archive:folder+'.zip',examples:catalog.selected.map(e=>e.slug),files:inputs.length+3}
  const entries={}
  for(const file of inputs)entries[folder+'/'+file]=await readFile(await safeFile(root,file))
  entries[folder+'/serve.mjs']=Buffer.from(serverSource)
  entries[folder+'/README.txt']=Buffer.from('Tremplin '+catalog.version+' examples\n\nUse Node 24: node serve.mjs\nOpen http://127.0.0.1:4178/ (PORT may select a different free local port).\nNative modules require HTTP; do not open these files using file://.\nNo npm install, remote scripts, publication or deployment needed.\nKeep all dist licenses and third-party notices when redistributing.\n')
  entries[folder+'/index.html']=Buffer.from('<!doctype html><html lang="en"><meta charset="utf-8"><title>Tremplin examples</title><h1>Tremplin examples</h1><ul>'+catalog.selected.map(e=>`<li><a href="${e.file}">${e.title}</a></li>`).join('')+'</ul></html>')
  const output=path.join(await exampleOutput(root),folder+'.zip'),stat=await lstat(output).catch(e=>{if(e.code==='ENOENT')return null;throw e})
  assert(!stat||stat.isFile()&&!stat.isSymbolicLink(),'Unsafe ZIP output')
  const bytes=zipSync(Object.fromEntries(Object.entries(entries).map(([name,data])=>[name,[data,{mtime:new Date(2000,0,1)}]])),{level:9})
  await writeFile(output,bytes)
  return {mode:'zip',archive:path.relative(root,output).replaceAll('\\','/'),files:Object.keys(entries).length,bytes:bytes.length,published:false}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(await zipExamples(projectRoot,exampleArguments(process.argv.slice(2))),null,2))
