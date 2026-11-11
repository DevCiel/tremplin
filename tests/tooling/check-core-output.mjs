import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { assetFiles } from '../../build/lib/site-assets.mjs'
import {activeDistributionExceptions} from '../../build/lib/distribution-notices.mjs'

const json = async file => JSON.parse(await readFile(file, 'utf8'))
const policy = await json('metadata/core-delivery-reference.json')
const expected = [...policy.reference.files.filter(file => /^dist\/(css|js)\//.test(file.path)).map(file => file.path.replace(/(^|\/)bootstrap(?=[.-])/g, '$1tremplin')), ...activeDistributionExceptions(policy), 'dist/integrity.json'].sort()
const actual = (await assetFiles('dist')).map(file => file.split(path.sep).join('/')).sort()
assert.equal(expected.length, 29)
assert.deepEqual(actual, expected, 'Core dist contains missing or obsolete/private output')
const graph = await json('artifacts/core-build-graph.json')
assert.equal(graph.compiler, 'rolldown-terser')
assert.equal(graph.commit, policy.reference.commit)
for (const build of graph.graphs) {
  assert(!Object.keys(build.inputs).some(file => /src\/(?:runtime|adapters|js\/extensions)\//.test(file)), 'Default compiler imports optional scaffolding')
}
assert.equal((await assetFiles('js/dist')).length, 140, 'Canonical module outputs are incomplete')
console.log('Core output inventory passed: 17 CSS + 8 JS + required asset/notices/integrity; 140 canonical files, no obsolete outputs.')
