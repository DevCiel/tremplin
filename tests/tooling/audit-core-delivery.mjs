// Read-only migration inventory. A report is not a passing delivery gate.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {activeDistributionExceptions} from '../../build/lib/distribution-notices.mjs'

const projectRoot = fileURLToPath(new URL('../../', import.meta.url))
const json = async file => JSON.parse(await readFile(path.join(projectRoot, file), 'utf8'))

export function safeRelativePath(file) {
  assert(typeof file === 'string' && file.length > 0, 'Expected a relative file path')
  assert(!file.includes('\\') && !file.includes(':') && !file.startsWith('/'), 'Unsafe file path: ' + file)
  assert(file.split('/').every(part => part && part !== '.' && part !== '..'), 'Unsafe file path: ' + file)
  return file
}

export function compareInventories(actual, expected) {
  for (const file of [...actual, ...expected]) safeRelativePath(file)
  assert.equal(new Set(actual).size, actual.length, 'Duplicate actual inventory entry')
  assert.equal(new Set(expected).size, expected.length, 'Duplicate expected inventory entry')
  return {
    missing: expected.filter(file => !actual.includes(file)).sort(),
    extra: actual.filter(file => !expected.includes(file)).sort(),
    matched: expected.filter(file => actual.includes(file)).sort()
  }
}

async function files(directory) {
  let entries
  try { entries = await readdir(path.join(projectRoot, directory), { withFileTypes: true }) }
  catch (error) { if (error.code === 'ENOENT') return []; throw error }
  const output = []
  for (const entry of entries) {
    assert(!entry.isSymbolicLink(), 'Inventory must not follow symlinks: ' + directory + '/' + entry.name)
    const file = directory + '/' + entry.name
    if (entry.isDirectory()) output.push(...await files(file))
    else if (entry.isFile()) output.push(file)
  }
  return output.sort()
}

export async function auditCoreDelivery() {
  const policy = await json('metadata/core-delivery-reference.json')
  const pin = await json('metadata/bootstrap6-reference.json')
  const product = await json('package.json')
  assert.equal(policy.reference.commit, pin.commit, 'Delivery reference differs from the source pin')
  assert.equal(policy.reference.repository, pin.repository, 'Delivery repository differs from the source pin')
  const references = policy.reference.files.map(file => {
    safeRelativePath(file.path)
    assert(/^[0-9a-f]{40}$/.test(file.gitBlob), 'Invalid upstream Git blob: ' + file.path)
    return file.path
  })
  assert.equal(new Set(references).size, references.length, 'Duplicate upstream reference')
  const branded = file => file.replace(/(^|\/)bootstrap(?=[.-])/g, '$1' + policy.distributionBasename)
  const distribution = {}
  for (const directory of policy.distributionRoots) {
    safeRelativePath(directory.replace(/\/$/, ''))
    const expected = references.filter(file => file.startsWith(directory)).map(branded)
    assert(expected.length, 'Empty required distribution inventory: ' + directory)
    const actual = await files(directory.replace(/\/$/, ''))
    distribution[directory] = { actualCount: actual.length, expectedCount: expected.length, ...compareInventories(actual, expected) }
  }
  const pluginExpected = references.filter(file => file.startsWith(policy.pluginOutputRoot))
  for (const entry of policy.sourceDerivedModuleOutputs ?? []) {
    safeRelativePath(entry.source)
    assert(entry.source.startsWith('js/src/') && entry.source.endsWith('.ts'), 'Invalid source-derived module')
    const bytes = await readFile(path.join(projectRoot, 'artifacts/bootstrap6-reference', pin.commit, entry.source))
    assert.equal(createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex'), entry.sourceGitBlob, 'Source-derived module is not the Git-verified pin')
    const base = entry.source.replace(/^js\/src\//, policy.pluginOutputRoot).slice(0, -3)
    assert.deepEqual(entry.outputs, ['.js', '.js.map', '.d.ts', '.d.ts.map'].map(extension => base + extension), 'Unexpected source-derived output names')
    pluginExpected.push(...entry.outputs)
  }
  assert(pluginExpected.length, 'Empty individual-module reference inventory')
  const plugins = compareInventories(await files(policy.pluginOutputRoot.replace(/\/$/, '')), pluginExpected)
  const inputs = []
  for (const directory of ['build', 'tests', 'site/src', 'site/build', 'docs', 'metadata', '.github', 'src']) {
    for (const file of await files(directory)) if (/\.(?:[cm]?js|ts|json|md|mdx|astro|scss|yml|yaml)$/.test(file)) {
      inputs.push({ file, text: await readFile(path.join(projectRoot, file), 'utf8') })
    }
  }
  inputs.push({ file: 'package.json', text: await readFile(path.join(projectRoot, 'package.json'), 'utf8') })
  let restored=[]
  try { const stages=await json('metadata/npm-build-stages.json'); assert.equal(stages.phase,'npm-build-stages-and-example-tools');restored=stages.restoredBuildTools } catch(error){if(error.code!=='ENOENT')throw error}
  assert(restored.every(file=>policy.deferredBuildTools.includes(file)),'Unreviewed restored build tool')
  const deferred=policy.deferredBuildTools.filter(file=>!restored.includes(file))
  const expectedBuild = references.filter(file => file.startsWith('build/') && !deferred.includes(file))
  const buildFiles = await files('build')
  const build = {
    ...compareInventories(buildFiles, expectedBuild),
    deferred,
    files: buildFiles.map(file => ({
      file,
      action: expectedBuild.includes(file) ? 'adapt-and-verify' : file.endsWith('.test.mjs') ? 'relocate-test' : /(?:review-|report-|prepare-upstream-review|summarize-)/.test(file) ? 'review-retirement-after-callers' : 'retain-or-relocate-verification-before-replacement',
      // Literal callers are evidence, not proof that dynamic callers do not exist.
      literalReferences: inputs.filter(input => input.file !== file && input.text.includes(file)).map(input => input.file)
    }))
  }
  const packagingIssues = []
  if (product.exports?.['.']?.types !== './js/dist/index.d.ts') packagingIssues.push('Root declarations do not target js/dist/index.d.ts')
  if (product.exports?.['.']?.default !== './js/dist/index.js') packagingIssues.push('Root ES-module export does not target js/dist/index.js')
  for (const specifier of Object.keys(product.exports ?? {})) {
    if (/^\.\/(?:react|vue|icons|themes|extensions|css\/extensions)(?:$|\/)/.test(specifier)) packagingIssues.push('Optional product export remains: ' + specifier)
  }
  for (const directory of ['icons', 'starters', 'themes']) if (product.files?.includes(directory)) packagingIssues.push('Standalone product is still packed: ' + directory)
  if (product.files?.includes('src')) packagingIssues.push('Unrestricted src packaging still includes optional product source trees')
  // Check the rest of dist as well: a clean css/js pair must not conceal old
  // cjs, types, vendor or internal-report trees beside it.
  const extraDistributionFiles = (await files('dist')).filter(file =>
    !policy.distributionRoots.some(directory => file.startsWith(directory))
    && !activeDistributionExceptions(policy).includes(file) && file !== 'dist/integrity.json')
  const requiredAssets = []
  for (const file of activeDistributionExceptions(policy)) {
    safeRelativePath(file)
    try { await readFile(path.join(projectRoot, file)); requiredAssets.push({ file, present: true }) }
    catch (error) { if (error.code !== 'ENOENT') throw error; requiredAssets.push({ file, present: false }) }
  }
  const differences = Object.values(distribution).reduce((sum, entry) => sum + entry.missing.length + entry.extra.length, 0)
    + plugins.missing.length + plugins.extra.length + build.missing.length + build.extra.length
    + packagingIssues.length + extraDistributionFiles.length + requiredAssets.filter(asset => !asset.present).length
  return {
    commit: pin.commit, distribution, plugins, build, packagingIssues, extraDistributionFiles, requiredAssets,
    optionalSourcePolicy: 'Defer standalone products; preserve authored source and required component assets. This audit does not delete files.',
    readyForCoreDelivery: differences === 0, differences,
    releaseBlocked: product.tremplinMigration?.releaseBlocked === true,
    mutatedProduction: false, pushed: false
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2))
  for (const arg of args) assert(['--check', '--json', '--report'].includes(arg), 'Unknown argument: ' + arg)
  const report = await auditCoreDelivery()
  if (args.has('--report')) {
    await mkdir(path.join(projectRoot, 'artifacts'), { recursive: true })
    await writeFile(path.join(projectRoot, 'artifacts/core-delivery-review.json'), JSON.stringify(report, null, 2) + '\n')
  }
  console.log(JSON.stringify(args.has('--json') ? report : {
    commit: report.commit,
    distribution: Object.fromEntries(Object.entries(report.distribution).map(([directory, value]) => [directory, { current: value.actualCount, target: value.expectedCount, missing: value.missing.length, extra: value.extra.length }])),
    differences: report.differences, readyForCoreDelivery: report.readyForCoreDelivery,
    releaseBlocked: report.releaseBlocked,
    report: args.has('--report') ? 'artifacts/core-delivery-review.json' : undefined
  }, null, 2))
  if (args.has('--check') && !report.readyForCoreDelivery) process.exitCode = 1
}
