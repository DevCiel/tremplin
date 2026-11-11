import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const checker = fileURLToPath(new URL('./check-no-legacy.mjs', import.meta.url))
async function fixture(run) {
  const directory = await mkdtemp(path.join(tmpdir(), 'tremplin-no-legacy-'))
  const put = async (file, text) => {
    const target = path.join(directory, file)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, typeof text === 'string' ? text : JSON.stringify(text))
  }
  try {
    await put('metadata/legacy-removal.json', { sourceTargets: ['src/compat'], generatedTargets: ['site/public/legacy'] })
    await put('metadata/asset-retirement.json', { sourceTargets: ['src/runtime/hybrid.ts', 'tsup.config.ts'], generatedTargets: ['site/public/js/tremplin.js'], retiredCssTokens: ['--trm-primary', '--trm-muted'] })
    await put('package.json', { exports: { '.': './dist/js/tremplin.js' }, scripts: {}, sideEffects: [] })
    for (const file of ['build/copy-site.mjs', 'site/src/layouts/DocsLayout.astro', 'site/src/pages/index.astro', 'site/src/pages/examples/index.astro']) await put(file, '')
    await run(put, () => execFileSync(process.execPath, [checker], { cwd: directory, encoding: 'utf8', stdio: 'pipe' }))
  } finally { await rm(directory, { recursive: true, force: true }) }
}
test('accepts a current-only tree', () => fixture(async (_put, check) => assert.match(check(), /No-legacy gate passed/)))

test('rejects reintroduced tool copies after explicit QA relocation',()=>fixture(async(put,check)=>{
  await put('metadata/build-tooling-relocation.json',{moves:{'build/check-core-output.mjs':'tests/tooling/check-core-output.mjs'}})
  await put('build/check-core-output.mjs','// old duplicate')
  assert.throws(check,error=>String(error.stderr).includes('Retired QA/tool path remains: build/check-core-output.mjs'))
}))

for (const file of ['docs/MIGRATION_0.7.md', 'docs/MIGRATION_0.8.md', 'docs/BOOTSTRAP6-PARITY.md', 'docs/bootstrap-LICENSE.txt']) {
  test('rejects reintroduced obsolete documentation: ' + file, () => fixture(async (put, check) => {
    await put(file, '# Retired documentation')
    assert.throws(check, error => String(error.stderr).includes('Retired target remains: ' + file))
  }))
}

test('rejects retired tooling at the new build location without rewriting historical inventories', () => fixture(async (put, check) => {
  await put('metadata/legacy-removal.json', { sourceTargets: ['scripts/build-legacy.mjs'], generatedTargets: [] })
  await put('build/build-legacy.mjs', '// retired maintenance tool')
  assert.throws(check, error => String(error.stderr).includes('Retired target remains: build/build-legacy.mjs'))
}))
for (const [name, file, contents] of [
  ['source', 'src/compat/legacy/button.ts', 'export default class Button {}'],
  ['export', 'package.json', { exports: { './compat/legacy': './dist/compat/legacy.js' }, scripts: {}, sideEffects: [] }],
  ['maintenance command', 'package.json', { exports: {}, scripts: { 'build:compat': 'node build/build-legacy.mjs' }, sideEffects: [] }],
  ['source dependency', 'src/js/button.ts', "import Button from '../compat/legacy/button'"],
  ['site copy', 'site/public/legacy/examples/index.html', '<h1>Retired</h1>'],
  ['archived navigation', 'site/src/layouts/DocsLayout.astro', '<a href="/docs/0.7/">Archive</a>'],
  ['generated graph', 'dist/strict-build-graph.json', { defaultGraph: { inputs: { 'src/compat/legacy/index.ts': {} } } }],
  ['hybrid source', 'src/runtime/hybrid.ts', "claimRuntime('hybrid-0.8', 'test', Symbol())"],
  ['hybrid owner in an orphan chunk', 'site/public/dist/js/chunk-old.js', "claimRuntime('hybrid-0.8', 'test', Symbol())"],
  ['old build configuration', 'tsup.config.ts', "import './src/runtime/hybrid'"],
  ['legacy Sass fallback', 'src/scss/extensions/_sample.scss', '.sample { color: var(--trm-muted, var(--trm-fg-2)); }']
]) test(`rejects a reintroduced retired ${name}`, () => fixture(async (put, check) => {
  await put(file, contents)
  assert.throws(check, error => String(error.stderr).includes('No-legacy gate failed'))
}))
test('retains legitimate pinned compatibility APIs and computed secondary roles', () => fixture(async (put, check) => {
  await put('src/scss/layout/_breakpoints.scss', '// Backwards-compatible alias for next/down loops.\n@mixin loop-breakpoints() {}')
  await put('src/js/tooltip.ts', "element.setAttribute('data-trm-original-title', title) // backwards compatibility")
  await put('dist/css/tremplin.css', ':root { --trm-secondary-base: #eee; --trm-secondary-contrast: #111; }')
  assert.match(check(), /No-legacy gate passed/)
}))
