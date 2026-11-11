import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { budgets, measureBundleSizes, parseBudgets } from '../../build/bundlewatch-table.mjs'
import { proposeBudgets, updateCssBudgets } from '../../build/bundlewatch-fix.mjs'
import { cacheTargets, cleanAstro } from '../../build/clean-astro.mjs'
import { changeVersion } from '../../build/change-version.mjs'
import { validateHTML, validationConfig } from '../../build/html-validate.mjs'
import { prepareDocsReview } from './prepare-docs-review.mjs'

const root = process.cwd()
const cli = (file, args = []) => spawnSync(process.execPath, [path.join(root, file), ...args], { encoding: 'utf8', cwd: root })
async function fixture(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'tremplin-maintenance-'))
  t.after(() => rm(dir, { recursive: true, force: true }))
  return dir
}
async function put(root, file, source = 'test') {
  await mkdir(path.dirname(path.join(root, file)), { recursive: true })
  await writeFile(path.join(root, file), source)
}
const config = () => JSON.parse(readFileSync('.bundlewatch.config.json', 'utf8'))

test('all seven upstream references are Git-verified; adaptations remain explicit', () => {
  const policy = JSON.parse(readFileSync('metadata/core-maintenance-tools.json', 'utf8'))
  const reference = JSON.parse(readFileSync('metadata/core-delivery-reference.json', 'utf8'))
  assert.equal(policy.buildFiles.length, 7)
  for (const entry of policy.buildFiles) {
    assert.equal(reference.reference.files.find(item => item.path === entry.path).gitBlob, entry.gitBlob)
    const original = readFileSync('artifacts/bootstrap6-reference/' + policy.reference + '/' + entry.path)
    assert.equal(createHash('sha1').update('blob ' + original.length + '\0').update(original).digest('hex'), entry.gitBlob)
    const local = readFileSync(entry.path, 'utf8')
    assert.match(local, /The Bootstrap Authors/)
    assert(entry.adaptation.length > 40)
  }
})

test('shared budgets preserve approved caps and exact gzip measurement', () => {
  assert.deepEqual(budgets.map(item => item[1]), [56000, 60000, 62000])
  // Reviewed license-pointer banner change only; independent body comparison
  // proves that the smaller JS measurements do not conceal implementation edits.
  assert.deepEqual(measureBundleSizes().map(item => item.bytes), [51804, 37108, 61413])
  assert(measureBundleSizes().every(item => item.passed))
  const bad = config(); bad.files[0].path = '../outside.css'
  assert.throws(() => parseBudgets(bad), /target/)
  const command = cli('build/bundlewatch-table.mjs', ['--json'])
  assert.equal(command.status, 0, command.stderr)
  assert.equal(JSON.parse(command.stdout).length, 3)
})

test('budget fixes default to no writes; explicit writes cannot raise JavaScript', async t => {
  const dir = await fixture(t), original = config()
  for (const entry of original.files) await put(dir, entry.path, randomBytes(3000))
  original.files[0].maxSize = '1 kB'
  await put(dir, '.bundlewatch.config.json', JSON.stringify(original))
  const before = await readFile(path.join(dir, '.bundlewatch.config.json'), 'utf8')
  assert.equal(updateCssBudgets(dir).mode, 'dry-run')
  assert.equal(await readFile(path.join(dir, '.bundlewatch.config.json'), 'utf8'), before)
  assert.equal(updateCssBudgets(dir, true).proposals[0].automatic, true)
  const next = JSON.parse(await readFile(path.join(dir, '.bundlewatch.config.json'), 'utf8'))
  next.files[1].maxSize = '1 kB'
  await put(dir, '.bundlewatch.config.json', JSON.stringify(next))
  assert.throws(() => updateCssBudgets(dir, true), /separate user approval/)
  assert.equal(JSON.parse(await readFile(path.join(dir, '.bundlewatch.config.json'), 'utf8')).files[1].maxSize, '1 kB')
  assert.throws(() => proposeBudgets(config(), []))
})

test('Astro cleanup is a fixed-target dry run and preserves unrelated files', async t => {
  const dir = await fixture(t)
  for (const target of cacheTargets) await put(dir, target + '/cache.txt')
  await put(dir, 'site-dist/index.html')
  assert.deepEqual((await cleanAstro(dir)).targets, cacheTargets)
  for (const target of cacheTargets) assert(existsSync(path.join(dir, target, 'cache.txt')))
  await cleanAstro(dir, true)
  for (const target of cacheTargets) assert(!existsSync(path.join(dir, target)))
  assert(existsSync(path.join(dir, 'site-dist/index.html')))
})

test('Astro cleanup rejects linked targets before any removal', async t => {
  const dir = await fixture(t), external = await fixture(t)
  await put(dir, '.astro/keep.txt')
  await put(external, 'outside.txt')
  await mkdir(path.join(dir, 'node_modules'))
  await symlink(external, path.join(dir, 'node_modules/.astro'), process.platform === 'win32' ? 'junction' : 'dir')
  await assert.rejects(cleanAstro(dir, true), /Unsafe Astro cache/)
  assert(existsSync(path.join(dir, '.astro/keep.txt')))
  assert(existsSync(path.join(external, 'outside.txt')))
})

test('version planning and blocked apply do not change real project files', async () => {
  const before = readFileSync('package.json', 'utf8')
  const result = await changeVersion(root, '0.8.0-beta.0', '0.8.0-beta.1')
  assert.equal(result.mode, 'dry-run')
  assert.equal(result.files.length, 4)
  await assert.rejects(changeVersion(root, '0.8.0-beta.0', '0.8.0-beta.1', true), /Release is blocked/)
  assert.equal(readFileSync('package.json', 'utf8'), before)
  for (const invalid of ['v1.0.0', '1.0', '1.0.0-01', '../2.0.0']) await assert.rejects(changeVersion(root, '0.8.0-beta.0', invalid), /SemVer/)
})

test('future version apply touches only four markers, with recoverable backups', async t => {
  const dir = await fixture(t)
  await put(dir, 'package.json', JSON.stringify({ version: '1.0.0', tremplinMigration: { releaseBlocked: false }, dependencies: { other: '1.0.0' } }))
  await put(dir, 'package-lock.json', JSON.stringify({ version: '1.0.0', packages: { '': { version: '1.0.0' }, 'node_modules/other': { version: '1.0.0' } } }))
  await put(dir, 'src/js/base-component.ts', "const VERSION = '1.0.0'\n// historical 1.0.0\n")
  await put(dir, 'src/scss/_banner.scss', 'Tremplin #{$file} v1.0.0 (url)\nCopyright Authors')
  await put(dir, 'CHANGELOG.md', 'historical 1.0.0')
  assert.equal((await changeVersion(dir, '1.0.0', '1.0.1', true)).mode, 'apply')
  const updated = JSON.parse(await readFile(path.join(dir, 'package.json'), 'utf8'))
  assert.equal(updated.version, '1.0.1'); assert.equal(updated.dependencies.other, '1.0.0')
  assert.equal(JSON.parse(await readFile(path.join(dir, 'package-lock.json'), 'utf8')).packages['node_modules/other'].version, '1.0.0')
  assert.match(await readFile(path.join(dir, 'src/js/base-component.ts'), 'utf8'), /historical 1\.0\.0/)
  assert.equal(await readFile(path.join(dir, 'CHANGELOG.md'), 'utf8'), 'historical 1.0.0')
})

test('Sass checker detects unused imports and respects pinned suppression syntax without writing', async t => {
  const dir = await fixture(t)
  await put(dir, 'input.scss', '@use "sass:math";\n.foo {color:red}\n')
  const before = await readFile(path.join(dir, 'input.scss'), 'utf8')
  assert.equal(cli('build/check-unused-imports.mjs', [dir]).status, 1)
  assert.equal(await readFile(path.join(dir, 'input.scss'), 'utf8'), before)
  await put(dir, 'input.scss', '// check-unused-imports-disable-next-line\n@use "sass:math";\n.foo {color:red}\n')
  assert.equal(cli('build/check-unused-imports.mjs', [dir]).status, 0)
  assert.equal(cli('build/check-unused-imports.mjs').status, 2)
})

test('HTML validation retains pinned rules, finds duplicates and rejects empty/escaping input', async t => {
  const dir = await fixture(t)
  assert.equal(validationConfig.rules['no-dup-id'], 'error')
  await put(dir, 'site-dist/index.html', '<!doctype html><html lang="en"><head><title>Test</title></head><body><p id="one">One</p></body></html>')
  assert.equal((await validateHTML(dir)).valid, true)
  await put(dir, 'site-dist/index.html', '<p id="same">One</p><p id="same">Two</p>')
  const result = await validateHTML(dir)
  assert.equal(result.valid, false); assert(result.errors.some(item => item.rule === 'no-dup-id'))
  await assert.rejects(validateHTML(dir, ['missing/**/*.html']), /No HTML files/)
  await assert.rejects(validateHTML(dir, ['../outside.html']), /relative HTML/)
})

test('Sass aggregation imports need actual emitted CSS, not a blanket suppression', async t => {
  const dir = await fixture(t)
  await put(dir, '_styles.scss', '.example { color: red; }')
  await put(dir, 'index.scss', '@use "styles";\n')
  const sideEffect = cli('build/check-unused-imports.mjs', [dir])
  assert.equal(sideEffect.status, 0, sideEffect.stdout + sideEffect.stderr)
  await put(dir, '_tokens.scss', '$unused: red;')
  await put(dir, 'index.scss', '@use "tokens";\n')
  assert.equal(cli('build/check-unused-imports.mjs', [dir]).status, 1)
})

test('documentation preparation is read-only by default and stages unique verified local copies', async t => {
  const dir = await fixture(t)
  for (const file of ['index.html','dist/css/tremplin.min.css','dist/js/tremplin.bundle.min.js','dist/LICENSE','dist/THIRD_PARTY_NOTICES.txt']) await put(dir, 'site-dist/' + file)
  const dry = await prepareDocsReview(dir)
  assert.equal(dry.destination, null); assert.equal(dry.files, 5)
  assert(!existsSync(path.join(dir, 'artifacts')))
  const first = await prepareDocsReview(dir, true), second = await prepareDocsReview(dir, true)
  assert.notEqual(first.destination, second.destination)
  assert.equal(first.deploymentApproved, false)
  assert.equal(await readFile(path.join(first.destination, 'payload/index.html'), 'utf8'), 'test')
  assert.equal(cli('tests/tooling/prepare-docs-review.mjs', ['--deploy']).status, 1)
  const bash = 'C:/Program Files/Git/bin/bash.exe'
  if (existsSync(bash)) execFileSync(bash, ['--noprofile', '--norc', '-n', 'build/docs-prep.sh'], { cwd: root })
  const bridge = readFileSync('build/docs-prep.sh', 'utf8')
  assert(!/git\s+(checkout|reset|pull|push)|rm\s+-/.test(bridge))
})

test('documentation staging rejects links and incomplete built sites', async t => {
  const dir = await fixture(t), external = await fixture(t)
  await mkdir(path.join(dir, 'site-dist'))
  await assert.rejects(prepareDocsReview(dir, true), /Incomplete built docs/)
  await symlink(external, path.join(dir, 'site-dist/linked'), process.platform === 'win32' ? 'junction' : 'dir')
  await assert.rejects(prepareDocsReview(dir, true), /Linked docs/)
  assert(!existsSync(path.join(dir, 'artifacts')))
})
