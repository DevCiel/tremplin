import { lstat, mkdir, readFile, readdir, unlink } from 'node:fs/promises'
import path from 'node:path'
import { build } from 'esbuild'
import { runtimeGuardPlugin } from '../../build/lib/runtime-guard.mjs'
const product=JSON.parse(await readFile('package.json','utf8'))
await mkdir('site/public/js',{recursive:true})
// Retire the old classic copy and prior generated chunks, never the directory.
const output=path.resolve('site/public/js')
for(const segment of ['site','site/public','site/public/js']) {
  const entry=await lstat(segment)
  if(entry.isSymbolicLink()||!entry.isDirectory())throw new Error('Unsafe generated asset directory: '+segment)
}
for(const name of await readdir(output)) if(/^(?:tremplin(?:-command-palette|-docs)?\.min\.js(?:\.map)?|docs-chunk-[\w-]+\.js(?:\.map)?)$/.test(name)) {
  const target=path.resolve(output,name)
  if(path.dirname(target)!==output||!(await lstat(target)).isFile())throw new Error('Unsafe generated asset target: '+target)
  await unlink(target)
}
const result=await build({
  entryPoints:{'tremplin-docs.min':'site/src/docs-runtime.ts','tremplin-command-palette.min':'site/src/palette-runtime.ts'},
  outdir:'site/public/js',chunkNames:'docs-chunk-[hash]',bundle:true,splitting:true,platform:'browser',format:'esm',target:'es2022',
  minify:true,sourcemap:true,metafile:true,define:{TREMPLIN_BUILD_VERSION:JSON.stringify(product.version)},
  plugins:[runtimeGuardPlugin('src/js','src/runtime/strict.ts')]
})
const files=Object.keys(result.metafile.inputs).map(file=>file.replaceAll('\\','/'))
if(!files.includes('src/js/extensions/command-palette.ts')||files.some(file=>file.startsWith('src/compat/')))throw new Error('Invalid documentation graph')
console.log('Built documentation-owned ESM core/palette entries sharing one graph; no public global or IIFE build.')
