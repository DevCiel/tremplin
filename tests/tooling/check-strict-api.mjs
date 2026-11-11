import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { assertEntryPublicApi } from './lib/entrypoint-transition.mjs'

const read = async file => JSON.parse(await readFile(file, 'utf8'))
execFileSync(process.execPath, ['tests/tooling/audit-tremplin-core.mjs', '--check'], { stdio: 'inherit' })
const pin = await read('metadata/bootstrap6-reference.json')
const baseline = await read('metadata/strict-api-baseline.json')
assert.equal(baseline.commit, pin.commit, 'Strict contract belongs to a different upstream pin')
assert.equal(baseline.profile, 'bootstrap6-clone-first-legacy-free')
const api = await read('metadata/api.json')
const publicApi = await read('metadata/public-api.json')
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
assert.equal(digest(api), baseline.apiSha256, 'Component contract drift: explain and review the strict baseline change; never auto-refresh it')
const transition = await read('metadata/core-entrypoint-transition.json')
assertEntryPublicApi(publicApi, baseline, transition)
assert.deepEqual(api.components.map(component => component.name), baseline.components)
const product = await read('package.json')
assert.deepEqual(publicApi.packageExports, Object.entries(product.exports).map(([specifier, target]) => ({ specifier, target })).sort((a, b) => a.specifier.localeCompare(b.specifier)), 'Package export metadata is stale')
const audit = await read('artifacts/bootstrap-core-audit.json')
const coreComponents = audit.modules.filter(entry => entry.kind === 'javascript' && /^src\/js\/[^/]+\.ts$/.test(entry.local) && !/\/(?:base-component|dialog-base|index)\.ts$/.test(entry.local)).map(entry => entry.local.split('/').at(-1).slice(0, -3)).sort()
assert.equal(coreComponents.length, 20, 'Incomplete pinned component inventory')
assert.deepEqual(api.components.filter(component => component.name !== 'command-palette').map(component => component.name).sort(), coreComponents, 'Missing or extra core component metadata')
await writeFile('metadata/strict-migration-report.json', JSON.stringify({
  commit: pin.commit, profile: 'bootstrap6-clone-first-legacy-free', breakingChanges: true, releaseReady: false,
  baseline: 'metadata/strict-api-baseline.json', coreModules: audit.modules.length, coreComponents: coreComponents.length,
  deliveryTransition: 'metadata/core-entrypoint-transition.json',
  packageScope: 'metadata/core-package-scope.json',
  securityExceptions: 'metadata/bootstrap6-security-patches.json',
  explanation: 'Approved clone-first contract replaces the retired hybrid baseline. No compatibility fallback is shipped. Exact source parity and six documented SEC-001/A11Y-001 patches constrain the core; optional APIs remain separate. Publishing is still blocked pending remaining acceptance gates.'
}, null, 2) + '\n')
console.log(`Strict contract verified: ${coreComponents.length} core plugins, ${publicApi.packageExports.length} package exports; no fallback baseline. Not a release approval.`)
