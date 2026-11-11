import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

export const corePackageScope = JSON.parse(readFileSync(new URL('../../../metadata/core-package-scope.json', import.meta.url), 'utf8'))
const removedExports = ['./css/extensions', './css/extensions/min', './icons', './icons/sprite', './themes/*', './react', './vue', './extensions/*']
// Physical local outputs are still retained for the staged compiler switch;
// archive selection and its integrity metadata must agree in the meantime.
export function isCoreArchivePath(file) {
  assert(typeof file === 'string' && !file.includes('\\') && !file.startsWith('/') && !file.includes(':') && file.split('/').every(part => part && part !== '.' && part !== '..'), 'Unsafe archive path')
  if(file==='LICENSE.bootstrap'||file==='dist/LICENSE.bootstrap')return false
  if(file.startsWith('metadata/')&&!['metadata/api.json','metadata/public-api.json'].includes(file))return false
  return !/^(?:(?:examples|starters|themes|docs|icons)\/|src\/(?:adapters|integrations|runtime)\/|src\/(?:js|scss)\/extensions\/|dist\/(?:cjs|types|vendor)\/|dist\/js\/(?:adapters|extensions)\/|dist\/css\/tremplin-extensions|dist\/strict-build-graph\.json$)/.test(file)
}
export function projectCoreExports(entries) {
  assert.equal(corePackageScope.phase, 'core-package-optional-product-separation')
  assert.deepEqual(corePackageScope.removedExports, removedExports)
  for (const specifier of removedExports) assert(entries.some(entry => entry.specifier === specifier), 'Missing optional export origin: ' + specifier)
  return entries.filter(entry => !removedExports.includes(entry.specifier))
}

export function projectCorePackage(before) {
  const expected = structuredClone(before)
  const entries = Object.entries(before.exports).map(([specifier, target]) => ({ specifier, target }))
  expected.exports = Object.fromEntries(projectCoreExports(entries).map(({ specifier, target }) => [specifier, target]))
  assert.deepEqual(corePackageScope.removedOptionalPeers, ['react', 'vue'])
  assert.deepEqual(Object.keys(before.peerDependenciesMeta).sort(), ['react', 'vue'])
  for (const peer of corePackageScope.removedOptionalPeers) {
    assert.equal(before.peerDependenciesMeta[peer].optional, true)
    assert(peer in expected.peerDependencies)
    delete expected.peerDependencies[peer]
  }
  delete expected.peerDependenciesMeta
  assert(before.files.includes('src') && before.files.includes('icons') && before.files.includes('docs'))
  expected.files = corePackageScope.files.slice()
  expected.sideEffects = before.sideEffects.filter(pattern => !['./src/runtime/*.ts', './dist/js/**/*.cjs', './dist/cjs/**/*.js'].includes(pattern))
  assert(expected.sideEffects.includes('./js/dist/**/*.js'), 'Canonical data API registration must remain side-effectful')
  assert.equal(expected.tremplinMigration.releaseBlocked, true)
  return expected
}

export function assertCorePackage(before, actual) {
  assert.deepEqual(actual, projectCorePackage(before), 'Package exceeds the reviewed optional-product separation')
}
