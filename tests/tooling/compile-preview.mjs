// Isolated QA preview of the same CLI stages; never a production compiler.
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {copyFile,lstat,mkdir,readFile,unlink} from 'node:fs/promises'
import path from 'node:path'
import {verifyCompiledCore} from './check-compiled-core.mjs'
assert.equal(process.argv.slice(2).length,0,'No preview path/arguments accepted')
const target=path.resolve('artifacts/core-delivery-preview')
let parent=process.cwd()
for(const part of ['artifacts','core-delivery-preview','css']){parent=path.join(parent,part);const stat=await lstat(parent).catch(e=>{if(e.code==='ENOENT')return null;throw e});assert(!stat||stat.isDirectory()&&!stat.isSymbolicLink(),'Unsafe preview directory')}
await mkdir(path.join(target,'css'),{recursive:true})
const files=['dist/css/tremplin.min.css','dist/js/tremplin.bundle.min.js']
const hash=async file=>createHash('sha256').update(await readFile(file)).digest('hex')
const before=await Promise.all(files.map(hash))
const env={...process.env,TREMPLIN_BUILD_OUTPUT:target}
const run=(entry,args=[])=>execFileSync(process.execPath,[entry,...args],{env,stdio:'inherit'})
run('node_modules/sass/sass.js',['--style=expanded','--source-map','--embed-sources','--no-error-css',...['tremplin','tremplin-grid','tremplin-reboot','tremplin-utilities'].map(name=>`src/scss/${name}.scss:${path.join(target,'css',name+'.css')}`)])
run('build/postcss.config.mjs',['--prefix'])
run('build/css-minify.mjs')
run('build/generate-utilities-json.mjs',['--verify-reference'])
for(const bundled of [false,true]) {
  run('node_modules/rolldown/bin/cli.mjs',['--environment','BUNDLE:'+bundled,'--config','build/rolldown.config.mjs','--sourcemap'])
  const basename=bundled?'tremplin.bundle':'tremplin',dir=path.join(target,'js')
  const mapInput=path.relative(process.cwd(),path.join(dir,basename+'.js.map')).replaceAll('\\','/')
  run('node_modules/terser/bin/terser',['--compress','passes=2','--mangle','--comments','/^!/','--source-map',`content=${mapInput},includeSources,filename=${basename}.min.js,url=${basename}.min.js.map`,'--output',path.join(dir,basename+'.min.js'),path.join(dir,basename+'.js')])
}
await mkdir(path.join(target,'icons'),{recursive:true})
for(const name of ['LICENSE','THIRD_PARTY_NOTICES.txt'])await copyFile('dist/'+name,path.join(target,name))
const retired=path.join(target,'LICENSE.bootstrap'),retiredStat=await lstat(retired).catch(error=>{if(error.code==='ENOENT')return null;throw error})
if(retiredStat){assert(retiredStat.isFile()&&!retiredStat.isSymbolicLink(),'Unsafe retired preview notice');await unlink(retired)}
await copyFile('dist/icons/datepicker-chevron.svg',path.join(target,'icons/datepicker-chevron.svg'))
await verifyCompiledCore(true)
assert.deepEqual(await Promise.all(files.map(hash)),before,'Preview changed active downloads')
