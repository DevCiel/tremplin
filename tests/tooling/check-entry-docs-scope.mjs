// Local documentation QA only. Never rebuilds core or accepts screenshot baselines.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const json = async file => JSON.parse(await readFile(file, 'utf8'))
const hash = async file => createHash('sha256').update(await readFile(file)).digest('hex')
async function walk(dir) {
  const found = []
  for (const item of await readdir(dir, { withFileTypes: true })) {
    assert(!item.isSymbolicLink(), `Unexpected link: ${dir}/${item.name}`)
    const file = `${dir}/${item.name}`
    if (item.isDirectory()) found.push(...await walk(file))
    else found.push(file)
  }
  return found.sort()
}
const hashes = async files => Object.fromEntries(await Promise.all([...new Set(files)].sort().map(async file => [file, await hash(file)])))
async function current() {
  const prior = await json('artifacts/form-composition-before.json')
  const output = await walk('site-dist')
  return {
    protectedInputs: await hashes([...Object.keys(prior.protectedInputs), ...await walk('src'), ...await walk('dist'), 'package-lock.json', 'metadata/public-api.json']),
    snapshots: await hashes([...await walk('tests/site-visual/snapshots'), ...await walk('tests/visual/snapshots')]),
    html: await hashes(output.filter(file => file.endsWith('/index.html'))),
    renderAssets: await hashes(output.filter(file => !file.startsWith('site-dist/pagefind/') && /\.(?:css|[cm]?js|svg|woff2?|ttf|otf|png|jpe?g|webp|gif|avif)$/.test(file)))
  }
}
const baselineFile = 'artifacts/entry-docs-before.json'
if (process.argv.includes('--before')) {
  // Refuse accidental overwrite of the evidence from the start of this batch.
  try { await readFile(baselineFile); throw new Error('Baseline already exists') }
  catch (error) { if (error.code !== 'ENOENT') throw error }
  const data = await current()
  await mkdir('artifacts/entry-docs-originals', { recursive: true })
  for (const name of ['homepage', 'installation-guide']) await copyFile(`tests/site-visual/snapshots/${name}.png`, `artifacts/entry-docs-originals/${name}.png`)
  await writeFile(baselineFile, JSON.stringify({ date: '2026-11-08', ...data }, null, 2) + '\n')
  console.log(JSON.stringify(Object.fromEntries(Object.entries(data).map(([key, value]) => [key, Object.keys(value).length]))))
} else {
  const before = await json(baselineFile), after = await current()
  const differences = key => {
    const original = before[key], actual = after[key]
    return { total: Object.keys(actual).length, changed: Object.keys(original).filter(file => file in actual && original[file] !== actual[file]), removed: Object.keys(original).filter(file => !(file in actual)), added: Object.keys(actual).filter(file => !(file in original)) }
  }
  const report = Object.fromEntries(Object.keys(after).map(key => [key, differences(key)]))
  for (const key of ['protectedInputs', 'renderAssets']) {
    assert.deepEqual(report[key].changed, [], `Unexpected ${key} changes`)
    assert.deepEqual(report[key].removed, [])
    assert.deepEqual(report[key].added, [])
  }
  assert.deepEqual(report.html.removed, [])
  assert.deepEqual(report.html.added, [])
  // starterHtml is also consumed by the existing Quickstart page.
  assert(report.html.changed.every(file => ['site-dist/index.html', 'site-dist/getting-started/index.html', 'site-dist/getting-started/install/index.html'].includes(file)), 'Unexpected route changes')
  assert.deepEqual(report.snapshots.removed, [])
  assert(report.snapshots.changed.every(file => /\/(?:homepage|installation-guide)\.png$/.test(file)), 'Unrelated screenshot changed')
  assert(report.snapshots.added.every(file => /\/(?:homepage|installation-guide)-(?:dark|rtl)\.png$/.test(file)), 'Unexpected new screenshot')
  for (const name of ['homepage', 'installation-guide']) assert.equal(await hash(`artifacts/entry-docs-originals/${name}.png`), before.snapshots[`tests/site-visual/snapshots/${name}.png`])
  const reviewedExpectations = []
  for(const name of ['homepage','homepage-dark','homepage-rtl','installation-guide','installation-guide-dark','installation-guide-rtl']) {
    const capture = `test-results/entry-docs-review/${name}.png`, expectation = `tests/site-visual/snapshots/${name}.png`
    const sha256 = await hash(capture)
    assert.equal(sha256, await hash(expectation), `Accepted image differs from independent capture: ${name}`)
    reviewedExpectations.push({capture,expectation,sha256})
  }
  await writeFile('artifacts/entry-docs-after.json', JSON.stringify({ date: '2026-11-08', ...after }, null, 2) + '\n')
  await writeFile('artifacts/entry-docs-scope.json', JSON.stringify({ date: '2026-11-08', root: path.basename(root), ...report, reviewedExpectations, releaseBlocked: true }, null, 2) + '\n')
  console.log(JSON.stringify(report))
}
