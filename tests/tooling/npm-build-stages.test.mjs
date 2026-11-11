import assert from 'node:assert/strict'
import {spawn} from 'node:child_process'
import {createHash} from 'node:crypto'
import {existsSync,readFileSync} from 'node:fs'
import {copyFile,lstat,mkdir,mkdtemp,readFile,readdir,rm,symlink,writeFile} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {test} from 'node:test'
import {unzipSync} from 'fflate'
import sharp from 'sharp'
import {chromium} from '@playwright/test'
import {zipExamples} from '../../build/zip-examples.mjs'
import {screenshotExamples} from '../../build/screenshot-examples.mjs'
import {exampleArguments,exampleOutput,loadExamples,safeFile,startExampleServer} from '../../site/build/examples.mjs'

async function fixture(t){const root=await mkdtemp(path.join(os.tmpdir(),'tremplin-example-tools-'));t.after(()=>rm(root,{recursive:true,force:true}));const copy=async(file)=>{await mkdir(path.dirname(path.join(root,file)),{recursive:true});await copyFile(file,path.join(root,file))};for(const file of ['site/data/examples.json','package.json','examples/interactions.html','examples/advanced-interactions.html','examples/kitchen-sink.html','examples/examples.css'])await copy(file);const walk=async dir=>{for(const e of await readdir(dir,{withFileTypes:true})){const file=dir+'/'+e.name;if(e.isDirectory())await walk(file);else await copy(file)}};await walk('dist');return root}

test('all twenty build filenames cover the verified reference, with only five required library helpers',async()=>{
  const policy=JSON.parse(readFileSync('metadata/core-delivery-reference.json'))
  const expected=policy.reference.files.filter(e=>e.path.startsWith('build/')).map(e=>e.path).sort()
  const actual=(await readdir('build',{withFileTypes:true})).filter(e=>e.isFile()).map(e=>'build/'+e.name).sort()
  assert.deepEqual(actual,expected)
  assert.equal((await readdir('build/lib')).length,5)
  for(const file of ['build/screenshot-examples.mjs','build/zip-examples.mjs']){const source=readFileSync('artifacts/bootstrap6-reference/'+policy.reference.commit+'/'+file);const pin=policy.reference.files.find(e=>e.path===file);assert.equal(createHash('sha1').update('blob '+source.length+'\0').update(source).digest('hex'),pin.gitBlob)}
  const stages=JSON.parse(readFileSync('metadata/npm-build-stages.json'))
  for(const file of [...stages.retiredTools,...Object.keys(stages.moves)])assert(!existsSync(file),file)
  for(const target of Object.values(stages.moves))assert(existsSync(target))
  const pkg=JSON.parse(readFileSync('package.json'))
  assert.match(pkg.scripts['css-compile'],/^sass /)
  assert.match(pkg.scripts['js-compile-bundle'],/^rolldown /)
  assert.match(pkg.scripts['js-minify-bundle'],/^terser /)
  assert(!JSON.stringify(pkg.scripts).includes('compile-core.mjs'))
})

test('argument parser rejects unknown, duplicate and unsafe selections',()=>{
  assert.deepEqual(exampleArguments(['--only','interactions,kitchen-sink','--dry-run']),{only:['interactions','kitchen-sink'],dryRun:true})
  for(const args of [['--output','C:/outside'],['--only'],['--only','../x'],['--only','x,x'],['--dry-run','--dry-run']])assert.throws(()=>exampleArguments(args))
})

test('dry runs write nothing and selection cannot silently match nothing',async t=>{
  const root=await fixture(t)
  assert.equal((await zipExamples(root,{only:null,dryRun:true})).files,36)
  assert.equal((await screenshotExamples(root,{only:null,dryRun:true})).images,12)
  assert(!existsSync(path.join(root,'artifacts')))
  await assert.rejects(loadExamples(root,['missing']),/Unknown example/)
  await assert.rejects(safeFile(root,'../outside'),/Unsafe example/)
  const demo=path.join(root,'examples/interactions.html'),original=await readFile(demo,'utf8')
  await writeFile(demo,original.replace('<main ','<main class="btn-primary" '))
  await assert.rejects(loadExamples(root),/Unstyled or retired example class: btn-primary/)
  await writeFile(demo,original)
  const core=path.join(root,'dist/css/tremplin.min.css');await writeFile(core,'tampered')
  await assert.rejects(loadExamples(root),/integrity mismatch/)
})

test('loopback screenshot server exposes only allowed files and releases its port',async t=>{
  const root=await fixture(t),server=await startExampleServer(root,['examples/interactions.html'])
  const url=server.url
  try{assert.equal((await fetch(url+'/examples/interactions.html')).status,200);assert.equal((await fetch(url+'/package.json')).status,404);assert.equal((await fetch(url+'/%2e%2e/package.json')).status,404)}finally{await server.close()}
  await assert.rejects(fetch(url+'/examples/interactions.html'))
})

test('linked inputs/output folders are refused without following them',async t=>{
  const root=await fixture(t),outside=await mkdtemp(path.join(os.tmpdir(),'tremplin-example-link-'))
  t.after(()=>rm(outside,{recursive:true,force:true}))
  await symlink(outside,path.join(root,'artifacts'),process.platform==='win32'?'junction':'dir')
  await assert.rejects(exampleOutput(root),/Unsafe output/)
  await symlink(outside,path.join(root,'examples/linked'),process.platform==='win32'?'junction':'dir')
  await writeFile(path.join(outside,'secret.txt'),'outside')
  await assert.rejects(safeFile(root,'examples/linked/secret.txt'),/Linked input/)
})

test('ZIP contains runnable examples, exact core bytes and all notices; extracted server works offline',async t=>{
  const root=await fixture(t),result=await zipExamples(root)
  const files=unzipSync(await readFile(path.join(root,result.archive)))
  assert.equal(Object.keys(files).length,36)
  const folder='tremplin-'+JSON.parse(await readFile(path.join(root,'package.json'))).version+'-examples'
  for(const name of ['LICENSE','THIRD_PARTY_NOTICES.txt'])assert.deepEqual(Buffer.from(files[folder+'/dist/'+name]),await readFile(path.join(root,'dist',name)))
  const catalog=await loadExamples(root)
  for(const file of [...catalog.assets,...catalog.selected.map(e=>e.file)])assert.deepEqual(Buffer.from(files[folder+'/'+file]),await readFile(path.join(root,file)))
  const extracted=path.join(root,'unpacked');await mkdir(extracted)
  for(const[file,bytes]of Object.entries(files)){assert(!file.includes('..')&&!path.isAbsolute(file));await mkdir(path.dirname(path.join(extracted,file)),{recursive:true});await writeFile(path.join(extracted,file),bytes)}
  const child=spawn(process.execPath,[path.join(extracted,folder,'serve.mjs')],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe'],windowsHide:true})
  let output='',errors='';child.stderr.on('data',bytes=>errors+=bytes)
  const url=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{child.kill();reject(Error('Archive server did not start: '+errors))},10000);child.on('exit',code=>{clearTimeout(timer);reject(Error('Archive server exited '+code+': '+errors))});child.stdout.on('data',bytes=>{output+=bytes;const match=output.match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timer);resolve(match[0])}})})
  let browser
  try{browser=await chromium.launch();for(const e of catalog.selected){const page=await browser.newPage();const failures=[];page.on('pageerror',error=>failures.push(error.message));await page.route('**/*',route=>new URL(route.request().url()).origin===url?route.continue():route.abort());const response=await page.goto(url+'/'+e.file,{waitUntil:'networkidle'});assert.equal(response.status(),200);assert.equal(await page.evaluate(()=>{const button=document.createElement('button');button.setAttribute('data-trm-toggle','button');button.setAttribute('aria-pressed','false');document.body.append(button);button.click();return button.getAttribute('aria-pressed')}),'true','Archive lost declarative module startup');assert.deepEqual(failures,[]);await page.close()}assert.equal((await fetch(url+'/%2e%2e/package.json')).status,404)}finally{await browser?.close();await new Promise(resolve=>{child.once('exit',resolve);child.kill()})}
})

test('screenshot tool produces correct light/dark 1x and 2x images without baseline changes',async t=>{
  const root=await fixture(t),result=await screenshotExamples(root,{only:['interactions'],dryRun:false})
  assert.equal(result.files.length,4)
  for(const file of result.files){const meta=await sharp(await readFile(path.join(root,file))).metadata(),scale=file.includes('@2x')?2:1;assert.equal(meta.width,480*scale);assert.equal(meta.height,300*scale)}
  assert(!(await readFile(path.join(root,result.files[0]))).equals(await readFile(path.join(root,result.files[2]))),'Dark output must not duplicate light output')
})
