import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { brandedPath, brandSource, gitBlobHash, moduleKind, productionPath, safeReferencePath, sha256 } from '../../build/lib/tremplin-core.mjs'
import { loadSecurityRegistry, approvedSecuritySource, classifySecuritySource } from '../../build/lib/tremplin-security.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const settings = JSON.parse(await readFile(path.join(root, 'metadata/bootstrap6-reference.json'), 'utf8'))
const product = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const identity = { version: product.version, upstreamVersion: settings.upstreamVersion }
const securityRegistry = await loadSecurityRegistry(root, settings.commit)
const args = new Set(process.argv.slice(2))
for (const arg of args) if (!['--fetch', '--stage', '--check'].includes(arg)) throw new Error(`Unknown option: ${arg}`)
if (!/^[a-f0-9]{40}$/.test(settings.commit) || settings.repository !== 'twbs/bootstrap') throw new Error('Invalid pinned Bootstrap reference')
const cache = path.join(root, 'artifacts/bootstrap6-reference', settings.commit)
const staging = path.join(root, 'artifacts/bootstrap6-strict', settings.commit)
const get = async url => {
  const response = await fetch(url, { headers: { 'User-Agent': 'Tremplin-strict-core-audit' } })
  if (!response.ok) throw new Error(`${response.status}: ${url}`)
  return response
}
const put = async (base, file, content) => {
  safeReferencePath(file)
  const target = path.join(base, file)
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, content)
}
const relevant = file => moduleKind(file) || ['LICENSE', 'package.json', 'package-lock.json', '.browserslistrc', 'tsconfig.json', 'dist/css/bootstrap-utilities.metadata.json', 'js/dist/index.js.map'].includes(file) || file.startsWith('build/') || file.startsWith('js/tests/') || file.startsWith('scss/tests/') || /^site\/src\/content\/docs\/.*\.mdx$/.test(file)

if (args.has('--fetch')) {
  const tree = await (await get(`https://api.github.com/repos/${settings.repository}/git/trees/${settings.commit}?recursive=1`)).json()
  if (tree.truncated || !Array.isArray(tree.tree)) throw new Error('Incomplete reference tree')
  const blobs = tree.tree.filter(entry => entry.type === 'blob' && relevant(entry.path))
  if (!blobs.some(entry => entry.path === 'scss/bootstrap.scss') || !blobs.some(entry => entry.path === 'js/src/index.ts')) throw new Error('Reference lacks required core entrypoints')
  let cursor = 0
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (cursor < blobs.length) {
      const entry = blobs[cursor++]
      safeReferencePath(entry.path)
      const bytes = Buffer.from(await (await get(`https://raw.githubusercontent.com/${settings.repository}/${settings.commit}/${entry.path}`)).arrayBuffer())
      if (gitBlobHash(bytes) !== entry.sha) throw new Error(`Git blob verification failed: ${entry.path}`)
      await put(cache, entry.path, bytes)
    }
  }))
  await put(cache, 'reference-manifest.json', JSON.stringify({ commit: settings.commit, files: blobs.map(({ path, sha }) => ({ path, sha })) }, null, 2) + '\n')
}

let manifest
try { manifest = JSON.parse(await readFile(path.join(cache, 'reference-manifest.json'), 'utf8')) }
catch (error) { if (error.code === 'ENOENT') throw new Error('No pinned reference snapshot. Run npm run audit:tremplin -- --fetch first.'); throw error }
if (manifest.commit !== settings.commit) throw new Error('Reference commit mismatch')
if (!Array.isArray(manifest.files) || new Set(manifest.files.map(entry => entry.path)).size !== manifest.files.length) throw new Error('Invalid or duplicate reference inventory')
for (const [kind, expected] of Object.entries(settings.expectedCoreModules)) {
  const actual = manifest.files.filter(entry => moduleKind(entry.path) === kind).length
  if (actual !== expected) throw new Error(`Incomplete pinned ${kind} inventory: ${actual}/${expected}`)
}
const records = []
const testFixtures = []
for (const entry of manifest.files) {
  safeReferencePath(entry.path)
  const bytes = await readFile(path.join(cache, entry.path))
  if (gitBlobHash(bytes) !== entry.sha) throw new Error(`Modified reference snapshot: ${entry.path}`)
  const kind = moduleKind(entry.path)
  if (!kind) {
    if (entry.path.startsWith('js/tests/') || entry.path.startsWith('scss/tests/')) {
      const expected = brandSource(bytes.toString('utf8'), identity)
      testFixtures.push({ path: entry.path, sha256: sha256(expected) })
      if (args.has('--stage')) await put(staging, entry.path, expected)
    }
    continue
  }
  const upstream = bytes.toString('utf8')
  const expected = brandSource(upstream, identity)
  const localPath = productionPath(entry.path)
  let local
  try { local = await readFile(path.join(root, localPath), 'utf8') }
  catch (error) { if (error.code !== 'ENOENT') throw error }
  const accepted = approvedSecuritySource(localPath, expected, securityRegistry)
  records.push({ upstream: entry.path, local: localPath, kind, status: classifySecuritySource(local, expected, accepted), securityPatch: accepted.patch, upstreamSha256: sha256(bytes), expectedSha256: sha256(expected), acceptedSha256: sha256(accepted.source), localSha256: local === undefined ? null : sha256(local.replace(/\r\n/g, '\n')) })
  if (args.has('--stage')) await put(staging, brandedPath(entry.path), expected)
}
// Attribution is part of the production artifact, not only the staging cache.
const upstreamLicense = await readFile(path.join(cache, 'LICENSE'))
let localLicense
try { localLicense = await readFile(path.join(root, 'licenses/third-party-code.txt')) }
catch (error) { if (error.code !== 'ENOENT') throw error }
if (!localLicense?.equals(upstreamLicense)) throw new Error('licenses/third-party-code.txt must preserve the exact pinned Bootstrap license')

if (args.has('--stage')) {
  await put(staging, 'LICENSE.bootstrap', await readFile(path.join(cache, 'LICENSE')))
  await put(staging, 'stage-manifest.json', JSON.stringify({ commit: settings.commit, productVersion: product.version, productionModified: false, modules: records.map(record => ({ path: brandedPath(record.upstream), sha256: record.expectedSha256 })), testFixtures }, null, 2) + '\n')
}

async function localFiles(directory, prefix) {
  const entries = await readdir(directory, { withFileTypes: true })
  const results = await Promise.all(entries.map(entry => entry.isDirectory() ? localFiles(path.join(directory, entry.name), `${prefix}${entry.name}/`) : [`${prefix}${entry.name}`]))
  return results.flat()
}
const expectedPaths = new Set(records.map(record => record.local))
const extras = (await Promise.all(['src/scss', 'src/js'].map(directory => localFiles(path.join(root, directory), `${directory}/`)))).flat().filter(file => /\.(scss|ts)$/.test(file) && !expectedPaths.has(file)).sort().map(file => ({ file, location: file.includes('/extensions/') ? 'extension' : 'core-extra' }))
const count = rows => rows.reduce((result, row) => ({ ...result, [row.status]: (result[row.status] ?? 0) + 1 }), {})
const report = {
  commit: settings.commit, upstreamVersion: settings.upstreamVersion,
  source: `https://github.com/${settings.repository}/tree/${settings.commit}`,
  definition: 'Exact identity-adapted source, plus separately labeled user-approved literal SEC-001 security and A11Y-001 clone-identity patches. No whitespace/comment/algorithm normalization; all other changes fail.',
  securityPolicy: { registry: 'metadata/bootstrap6-security-patches.json', approval: securityRegistry.approval, accessibilityApproval: securityRegistry.accessibilityApproval, patchedModules: records.filter(record => record.securityPatch).length, verifiedAssets: securityRegistry.assets },
  productionModified: false,
  productionProfile: product.tremplinMigration?.profile ?? 'unconfigured-unreleased',
  counts: { scss: count(records.filter(record => record.kind === 'scss')), javascript: count(records.filter(record => record.kind === 'javascript')) },
  referenceTests: { sass: manifest.files.filter(entry => entry.path.startsWith('scss/tests/')).map(entry => entry.path), javascript: manifest.files.filter(entry => entry.path.startsWith('js/tests/')).map(entry => entry.path) },
  documentationRoutes: manifest.files.filter(entry => entry.path.startsWith('site/src/content/docs/')).map(entry => entry.path.replace('site/src/content/docs/', '').replace(/\.mdx$/, '')),
  extras, modules: records.sort((a, b) => a.upstream.localeCompare(b.upstream))
}
await put(path.join(root, 'artifacts'), 'bootstrap-core-audit.json', JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify({ commit: report.commit, counts: report.counts, coreExtras: extras.filter(entry => entry.location === 'core-extra').length, extensionFiles: extras.filter(entry => entry.location === 'extension').length, referenceTestFiles: { sass: report.referenceTests.sass.length, javascript: report.referenceTests.javascript.length }, documentationRoutes: report.documentationRoutes.length, staged: args.has('--stage'), productionModified: false, report: 'artifacts/bootstrap-core-audit.json' }, null, 2))
if (args.has('--check') && (records.some(record => !['matched', 'approved-security-patch'].includes(record.status)) || extras.some(entry => entry.location === 'core-extra'))) process.exitCode = 1
