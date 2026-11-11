// Private local-demo support. These outputs are not part of the core archive.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { lstat, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { assetFiles } from '../../build/lib/site-assets.mjs'
import banner from '../../build/banner.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const destination = path.join(root, 'artifacts/documentation-assets/dist')
for (const segment of ['artifacts','artifacts/documentation-assets','artifacts/documentation-assets/dist','artifacts/documentation-assets/dist/css','artifacts/documentation-assets/dist/vendor']) {
  const entry=await lstat(path.join(root,segment)).catch(error=>{if(error.code!=='ENOENT')throw error;return null})
  assert(!entry || entry.isDirectory() && !entry.isSymbolicLink(), 'Unsafe private asset directory: '+segment)
}
await mkdir(path.join(destination, 'css'), { recursive: true })
await mkdir(path.join(destination, 'vendor'), { recursive: true })
for (const [suffix, style] of [['', 'expanded'], ['.min', 'compressed']]) {
  execFileSync(process.execPath, [path.join(root, 'node_modules/sass/sass.js'), '--style=' + style, '--source-map', 'src/scss/extensions/index.scss', path.join(destination, 'css/tremplin-extensions' + suffix + '.css')], { cwd: root, stdio: 'inherit' })
}
for (const [name, specifier] of [['floating-ui', '@floating-ui/dom'], ['vanilla-calendar-pro', 'vanilla-calendar-pro']]) {
  await build({ stdin: { contents: `export * from ${JSON.stringify(specifier)}`, resolveDir: root }, outfile: path.join(destination, 'vendor', name + '.js'), bundle: true, platform: 'browser', format: 'esm', target: 'es2022', minify: true, sourcemap: true, banner: { js: banner() } })
}
const files = (await assetFiles(destination)).map(file => path.relative(destination, file).replaceAll('\\', '/')).sort()
const expected = ['css/tremplin-extensions.css', 'css/tremplin-extensions.min.css', 'vendor/floating-ui.js', 'vendor/vanilla-calendar-pro.js'].flatMap(file => [file, file + '.map']).sort()
assert.deepEqual(files, expected, 'Unexpected private documentation asset')
console.log('Built eight private documentation CSS/dependency assets; root dist is untouched.')
