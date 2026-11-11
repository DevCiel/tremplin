import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'

const root=process.cwd(),workspace=path.resolve('artifacts/consumer-toolchains'),work=path.join(workspace,'work')
const npmCli=process.env.npm_execpath||path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js')
assert(existsSync(npmCli),'An npm CLI installation is required')
const json=async file=>JSON.parse(await readFile(file,'utf8'))
const put=async(file,value)=>{await mkdir(path.dirname(file),{recursive:true});await writeFile(file,value)}
const product=await json('package.json'),fixtures=path.resolve('tests/consumer-toolchains/fixtures')
assert.equal(product.tremplinMigration.releaseBlocked,true)
const tools={vite:'8.3.5',vite6:'npm:vite@6.4.5',webpack:'5.112.2','webpack-cli':'7.3.1',parcel:'2.16.4',rollup:'4.65.0','@rollup/plugin-node-resolve':'16.0.3','sass-loader':'17.1.0',sass:(await json('node_modules/sass/package.json')).version,react:'19.0.0','react-dom':'19.0.0',vue:'3.5.44'}
const cases=[['vite-css','vite',false],['vite-sass','vite',true],['webpack-css','webpack',false],['webpack-sass','webpack',true],['parcel-css','parcel',false],['rollup-js','rollup',true],['starter-vite','vite6',false],['starter-react','vite6',false],['starter-vue','vite6',false],['starter-html','html',false]]
const run=(args,cwd,label)=>{console.log('Running '+label);try{return execFileSync(process.execPath,args,{cwd,encoding:'utf8',timeout:240000,maxBuffer:16*1024*1024,windowsHide:true,env:{...process.env,PARCEL_WORKERS:'1',CI:'true'}})}catch(error){process.stderr.write(error.stdout||'');process.stderr.write(error.stderr||'');throw error}}
await mkdir(workspace,{recursive:true})
if(!existsSync(path.join(workspace,'workspace.json'))){
  assert(!existsSync(work),'Refusing to reuse an unmarked work directory')
  await mkdir(work,{recursive:true})
  const packed=JSON.parse(run([npmCli,'pack','--json','--pack-destination',work],root,'local tarball (no publication)'))
  await put(path.join(work,'package.json'),JSON.stringify({name:'tremplin-consumer-matrix',private:true,type:'module',dependencies:{...tools,tremplin:'file:./'+packed[0].filename}},null,2)+'\n')
  await put(path.join(workspace,'workspace.json'),JSON.stringify({root,work,archive:packed[0].filename,version:product.version,tools},null,2)+'\n')
}
const marker=await json(path.join(workspace,'workspace.json'))
assert.equal(marker.root,root);assert.equal(marker.work,work);assert.equal(marker.version,product.version)
if(!existsSync(path.join(work,'node_modules/tremplin/package.json')))await put(path.join(workspace,'install.log'),run([npmCli,'install','--ignore-scripts','--no-audit','--no-fund','--fetch-retries=0','--fetch-timeout=30000'],work,'isolated pinned consumer dependencies'))
const installed=path.join(work,'node_modules/tremplin')
assert.equal((await json(path.join(installed,'package.json'))).version,product.version)
assert.deepEqual((await json(path.join(installed,'package.json'))).exports,product.exports)
for(const file of ['dist/js/tremplin.js','dist/js/tremplin.bundle.min.js','dist/css/tremplin.css','THIRD_PARTY_NOTICES.txt'])assert((await readFile(path.join(root,file))).equals(await readFile(path.join(installed,file))),'Archive identity mismatch: '+file)
const results=[]
for(const [name,tool,usesSass]of cases){
  const project=path.join(work,'projects',name),output=path.join(project,'dist')
  await mkdir(path.join(project,'src'),{recursive:true})
  await put(path.join(project,'package.json'),JSON.stringify({name:'consumer-'+name,private:true,type:'module'})+'\n')
  if(name.startsWith('starter-')&&tool!=='html')await cp(path.join(root,'starters',name.slice(8)),project,{recursive:true})
  else if(tool==='html'){
    const html=(await readFile('starters/html/index.html','utf8')).replaceAll('https://cdn.jsdelivr.net/npm/tremplin@'+product.version+'/dist/','./dist/')
    await put(path.join(output,'index.html'),html);await cp(path.join(installed,'dist'),path.join(output,'dist'),{recursive:true})
  }else{
    await cp(path.join(fixtures,'index.html'),path.join(project,'index.html'))
    await cp(path.join(fixtures,'theme.'+(usesSass?'scss':'css')),path.join(project,'src/theme.'+(usesSass?'scss':'css')))
    const imports=tool==='rollup'?'':usesSass?"import './theme.scss'\n":"import 'tremplin/css'\nimport './theme.css'\n"
    await put(path.join(project,'src/main.js'),imports+await readFile(path.join(fixtures,'app.js'),'utf8'))
  }
  let command=[]
  if(tool==='vite'||tool==='vite6'){
    if(!name.startsWith('starter-'))await cp(path.join(fixtures,'vite.config.mjs'),path.join(project,'vite.config.mjs'))
    command=[path.join(work,'node_modules',tool,'bin/vite.js'),'build']
  }else if(tool==='webpack'){
    await cp(path.join(fixtures,'webpack.config.cjs'),path.join(project,'webpack.config.cjs'))
    command=[path.join(work,'node_modules/webpack-cli/bin/cli.js'),'--config','webpack.config.cjs']
  }else if(tool==='parcel')command=[path.join(work,'node_modules/parcel/lib/bin.js'),'build','index.html','--public-url','./','--dist-dir','dist','--no-autoinstall']
  else if(tool==='rollup'){
    await cp(path.join(fixtures,'rollup.config.mjs'),path.join(project,'rollup.config.mjs'))
    command=[path.join(work,'node_modules/rollup/dist/bin/rollup'),'--config','rollup.config.mjs']
  }
  if(command.length)await put(path.join(workspace,name+'.log'),run(command,project,name+' production build'))
  if(tool==='webpack')await put(path.join(output,'index.html'),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Webpack installed consumer</title><link rel="stylesheet" href="./app.css"></head><body><div id="app"></div><script defer src="./app.js"></script></body></html>')
  if(tool==='rollup'){
    const sass=createRequire(path.join(work,'package.json'))('sass')
    const compiled=sass.compile(path.join(project,'src/theme.scss'),{importers:[new sass.NodePackageImporter(project)]})
    await put(path.join(output,'vendor/css/theme.css'),compiled.css)
    await cp(path.join(installed,'dist/icons'),path.join(output,'vendor/icons'),{recursive:true})
    await put(path.join(output,'index.html'),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rollup installed consumer</title><link rel="stylesheet" href="./vendor/css/theme.css"></head><body><div id="app"></div><script type="module" src="./app.js"></script></body></html>')
  }
  const target=path.join(workspace,'builds',name)
  await cp(output,target,{recursive:true})
  await put(path.join(target,'THIRD_PARTY_NOTICES.txt'),await readFile(path.join(installed,'dist/THIRD_PARTY_NOTICES.txt')))
  results.push({name,tool,toolVersion:tool==='html'?null:(await json(path.join(work,'node_modules',tool,'package.json'))).version,sass:usesSass,sassPipeline:tool==='rollup'?'Dart Sass compiled separately; CSS/SVG copied with relative layout':usesSass?'bundler-native':'precompiled CSS',entry:'/artifacts/consumer-toolchains/builds/'+name+'/index.html'})
  await put(path.join(workspace,'build-progress.json'),JSON.stringify(results,null,2)+'\n')
}
await put(path.join(workspace,'build-report.json'),JSON.stringify({version:product.version,node:process.version,tools:marker.tools,cases:results,installedTarball:true,hostSourceImports:false,published:false,releaseBlocked:true},null,2)+'\n')
console.log('Built '+results.length+' local installed-tarball consumers; framework source and root dependencies unchanged.')
