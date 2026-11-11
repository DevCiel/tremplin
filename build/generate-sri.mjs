import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile, mkdir, lstat } from 'node:fs/promises'
import { extname, relative, resolve, sep } from 'node:path'
import assert from 'node:assert/strict'
import { distributionNotices } from './lib/distribution-notices.mjs'

const args = process.argv.slice(2)
assert(args.length <= 1 && args.every(arg => arg === '--assets-only'), 'Usage: generate-sri.mjs [--assets-only]')
for(const directory of ['dist','dist/icons']) {
  const stat=await lstat(directory).catch(error=>{if(error.code==='ENOENT')return null;throw error})
  assert(!stat || stat.isDirectory()&&!stat.isSymbolicLink(),'Unsafe asset output directory')
}
await mkdir('dist/icons',{recursive:true})
const registry=JSON.parse(await readFile('metadata/bootstrap6-security-patches.json','utf8'))
for(const asset of registry.assets) {
  const destination=resolve(asset.output)
  assert(destination.startsWith(resolve('dist/icons')+sep),'Invalid component asset target')
  const bytes=await readFile(asset.path)
  assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,'Required component asset changed')
  await writeFile(destination,bytes)
}
const product=JSON.parse(await readFile('package.json','utf8'))
await distributionNotices(product)

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const output = []
  for (const entry of entries) {
    const path = `${directory}/${entry.name}`
    if (entry.isDirectory()) output.push(...await files(path))
    else if (['.css', '.js', '.cjs', '.svg'].includes(extname(entry.name))) output.push(path)
  }
  return output
}

const assets = {}
if (!args.includes('--assets-only')) {
for (const path of await files('dist')) {
  const content = await readFile(path)
  assets[relative('dist', path).replaceAll('\\', '/')] = {
    bytes: content.byteLength,
    integrity: `sha384-${createHash('sha384').update(content).digest('base64')}`
  }
}

await writeFile('dist/integrity.json', `${JSON.stringify({ version: product.version, algorithm: 'sha384', assets }, null, 2)}\n`)
} else console.log('Prepared verified same-origin component assets and distribution notices.')
