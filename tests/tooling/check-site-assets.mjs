import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { assetFiles, siteAssetInputs } from '../../build/lib/site-assets.mjs'

const root = process.cwd()
for (const name of ['dist', 'themes', 'js/dist']) {
  const source = path.join(root, name)
  const inputs = await siteAssetInputs(root, name)
  const expected = [...inputs.keys()].sort()
  assert.ok(expected.length, `Missing source assets: ${name}`)
  for (const prefix of ['site/public', 'site-dist']) {
    const destination = path.join(root, prefix, name)
    // Astro owns /themes/index.html beside the copied theme assets.
    const actual = (await assetFiles(destination)).map(file => path.relative(destination, file)).filter(file => !(prefix === 'site-dist' && name === 'themes' && file === 'index.html')).sort()
    assert.deepEqual(actual, expected, `Missing or orphaned files in ${prefix}/${name}`)
    for (const file of expected) assert.ok((await readFile(inputs.get(file))).equals(await readFile(path.join(destination, file))), `Stale copied asset: ${prefix}/${name}/${file}`)
  }
}
console.log('Site distribution/theme/canonical-module mirrors contain only current files and match their sources byte-for-byte.')
