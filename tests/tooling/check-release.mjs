import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import {validateCoreReleaseInventory} from './lib/release-inventory.mjs'

const readJson = async path => JSON.parse(await readFile(path, 'utf8'))
const fail = message => {
  throw new Error(`Release readiness check failed: ${message}`)
}

const manifest = await readJson('package.json')
if (manifest.tremplinMigration?.releaseBlocked === true) fail('Strict core is an unreleased migration. Test/documentation/security/visual migration and a reviewed prerelease contract must be completed before publishing.')
const components = await readJson('metadata/components.json')
const api = await readJson('metadata/api.json')
const publicApi = await readJson('metadata/public-api.json')
const deprecations = await readJson('metadata/deprecations.json')
const integrity = await readJson('dist/integrity.json')

if (manifest.private === true) fail('package.json must not be private')
if (!/^https:\/\//.test(manifest.homepage ?? '')) fail('homepage must use HTTPS')
if (manifest.license !== 'MIT') fail('package license must be MIT')
if (manifest.version !== components.version) fail('component metadata version does not match package.json')
if (manifest.version !== api.version) fail('generated component API version does not match package.json')
if (manifest.version !== publicApi.version) fail('generated public API version does not match package.json')
if (manifest.version !== integrity.version) fail('integrity manifest version does not match package.json')
if (!manifest.repository?.url) fail('repository metadata is required')
if (manifest.publishConfig?.access !== 'public') fail('npm access must be public')
if (manifest.publishConfig?.provenance !== true) fail('npm provenance must remain enabled')

for (const document of ['README.md', 'CHANGELOG.md', 'SECURITY.md', 'CONTRIBUTING.md', 'GOVERNANCE.md', 'LICENSE', 'THIRD_PARTY_NOTICES.txt']) {
  if (!existsSync(document)) fail(`${document} is missing`)
  if (document !== 'LICENSE' && !manifest.files.includes(document)) fail(`${document} is not included in the npm package`)
}
// Maintainer documentation stays in the repository; it is not a core npm asset.
if (!existsSync('docs/RELEASING.md')) fail('release process documentation is missing')
if (!existsSync('docs/API_STABILITY.md')) fail('API stability policy is missing')
if (deprecations.framework !== 'Tremplin' || !Array.isArray(deprecations.deprecations)) fail('deprecation registry is invalid')

const inventory=validateCoreReleaseInventory(manifest,integrity,existsSync)

const generatedComponents = new Set(api.components.map(component => component.name))
const sourceComponents = (await readdir('src/js'))
  .filter(file => file.endsWith('.ts') && !['base-component.ts', 'dialog-base.ts', 'index.ts'].includes(file))
  .map(file => file.slice(0, -3))
sourceComponents.push('command-palette')
for (const component of sourceComponents) {
  if (!generatedComponents.has(component)) fail(`${component} is missing from generated API metadata`)
}

const changelog = await readFile('CHANGELOG.md', 'utf8')
if (!changelog.includes(`## ${manifest.version}`)) fail(`CHANGELOG.md has no ${manifest.version} section`)

console.log(`Release metadata, ${inventory.requiredAssets} required assets, ${Object.keys(integrity.assets).length} integrity entries, ${generatedComponents.size} component APIs, and the frozen public contract are ready for ${manifest.name}@${manifest.version}.`)
