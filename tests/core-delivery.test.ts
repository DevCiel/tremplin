import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (file: string) => readFileSync(file, 'utf8')
const policy = JSON.parse(read('metadata/core-delivery-reference.json')) as {
  reference: { repository: string; commit: string; files: Array<{ path: string; gitBlob: string }> }
  sourceRoots: Record<string, string>
  excludedProductRoots: string[]
  requiredDistributionExceptions: string[]
  localOnly: boolean
  publishBlocked: boolean
}
const node = (source: string) => execFileSync(process.execPath, ['--input-type=module', '-e', source], { encoding: 'utf8' }).trim()
const hash = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex')

describe('reviewed core delivery migration', () => {
  it('pins the complete delivery inventories without advancing the core', () => {
    const pin = JSON.parse(read('metadata/bootstrap6-reference.json'))
    expect(policy.reference.commit).toBe(pin.commit)
    expect(policy.reference.repository).toBe(pin.repository)
    const paths = policy.reference.files.map(file => file.path)
    expect(new Set(paths).size).toBe(paths.length)
    expect(paths.filter(file => file.startsWith('dist/css/'))).toHaveLength(17)
    expect(paths.filter(file => file.startsWith('dist/js/'))).toHaveLength(8)
    expect(paths.filter(file => file.startsWith('build/'))).toHaveLength(20)
    expect(paths).toContain('dist/css/bootstrap-utilities.metadata.json')
    for (const file of policy.reference.files) expect(file.gitBlob).toMatch(/^[0-9a-f]{40}$/)
    expect(policy.sourceRoots).toEqual({ 'js/src/': 'src/js/', 'scss/': 'src/scss/' })
  })

  it('retains the Git-verified Sass generator with only declared path and product changes', () => {
    const base = 'artifacts/bootstrap6-reference/' + policy.reference.commit + '/'
    const original = readFileSync(base + 'build/generate-utilities-metadata.scss')
    const entry = policy.reference.files.find(file => file.path === 'build/generate-utilities-metadata.scss')!
    expect(createHash('sha1').update('blob ' + original.length + '\0').update(original).digest('hex')).toBe(entry.gitBlob)
    const expected = '// Derived from the pinned upstream generator; MIT, The Bootstrap Authors.\n// Original notice retained in licenses/third-party-code.txt.\n'
      + original.toString().replaceAll('../scss/', '../src/scss/').replaceAll('BOOTSTRAP-UTILITIES', 'TREMPLIN-UTILITIES').replaceAll('.bootstrap-utilities', '.tremplin-utilities')
    expect(read('build/generate-utilities-metadata.scss').replaceAll('\r\n', '\n')).toBe(expected.replaceAll('\r\n', '\n'))
  })

  it('derives metadata from Sass and independently matches the pinned distribution', () => {
    const output = execFileSync(process.execPath, ['build/generate-utilities-json.mjs', '--check', '--verify-reference'], { encoding: 'utf8' })
    expect(output).toMatch(/Verified metadata for \d+ source-configured utilities/)
    expect(JSON.parse(read('package.json')).scripts['css-docs']).toBe('node build/generate-utilities-json.mjs --verify-reference')
    expect(Object.keys(JSON.parse(read('dist/css/tremplin-utilities.metadata.json')).utilities).length).toBeGreaterThan(100)
  })

  it('responds to Sass configuration instead of copying a canned JSON file', () => {
    const result = node(`
      import { compileString } from 'sass';
      import { extractUtilitiesMetadata } from './build/generate-utilities-json.mjs';
      const stylesheet = '@use "build/generate-utilities-metadata" with ($utilities-map: ("delivery-probe": (property: display, class: probe, values: (alpha: block, beta: none))));';
      console.log(JSON.stringify(extractUtilitiesMetadata(compileString(stylesheet, { loadPaths: [process.cwd()] }).css)));
    `)
    expect(JSON.parse(result)).toEqual({ utilities: { 'delivery-probe': { class: 'probe', property: 'display', classes: ['probe-alpha', 'probe-beta'] } } })
  })

  it('rejects absent, duplicate, reversed, malformed and invalid-schema metadata', () => {
    expect(node(`
      import assert from 'node:assert/strict';
      import { extractUtilitiesMetadata as extract } from './build/generate-utilities-json.mjs';
      const start = 'TREMPLIN-UTILITIES-METADATA-START', end = 'TREMPLIN-UTILITIES-METADATA-END';
      const invalid = ['', start + start + '{}' + end, end + '{}' + start, start + '{broken}' + end,
        start + '{"utilities":[]}' + end, start + '{"utilities":{}}' + end,
        start + '{"utilities":{"x":{"class":"x","classes":[1]}}}' + end];
      for (const source of invalid) assert.throws(() => extract(source));
      console.log(invalid.length);
    `)).toBe('7')
  })

  it('reports missing and extra paths without rewriting production files', () => {
    const protectedFiles = ['package.json', 'src/js/index.ts', 'src/scss/_utilities.scss', 'metadata/strict-api-baseline.json', 'metadata/bootstrap6-security-patches.json']
    const before = protectedFiles.map(hash)
    const report = JSON.parse(execFileSync(process.execPath, ['tests/tooling/audit-core-delivery.mjs', '--json'], { encoding: 'utf8' }))
    expect(report.commit).toBe(policy.reference.commit)
    expect(report.distribution['dist/css/'].expectedCount).toBe(17)
    expect(report.distribution['dist/js/'].expectedCount).toBe(8)
    expect(report.distribution['dist/css/'].missing).not.toContain('dist/css/tremplin-utilities.metadata.json')
    expect(report.readyForCoreDelivery).toBe(report.differences === 0)
    expect(report.releaseBlocked).toBe(true)
    expect(report.requiredAssets.every((asset: { present: boolean }) => asset.present)).toBe(true)
    expect(protectedFiles.map(hash)).toEqual(before)
  })

  it('returns a failing check status while delivery differences remain', () => {
    const result = spawnSync(process.execPath, ['tests/tooling/audit-core-delivery.mjs', '--check', '--json'], { encoding: 'utf8' })
    expect(result.error).toBeUndefined()
    const report = JSON.parse(result.stdout)
    expect(result.status).toBe(report.readyForCoreDelivery ? 0 : 1)
  })

  it('rejects traversal and duplicate inventories and detects an extra output', () => {
    expect(node(`
      import assert from 'node:assert/strict';
      import { safeRelativePath, compareInventories } from './tests/tooling/audit-core-delivery.mjs';
      for (const file of ['/dist/x', '../x', 'dist/../x', 'C:/x', 'dist\\\\x', 'dist//x']) assert.throws(() => safeRelativePath(file));
      assert.throws(() => compareInventories(['dist/x', 'dist/x'], ['dist/x']));
      assert.deepEqual(compareInventories(['dist/js/tremplin.js', 'dist/js/unwanted.js'], ['dist/js/tremplin.js', 'dist/js/tremplin.min.js']), {
        missing: ['dist/js/tremplin.min.js'], extra: ['dist/js/unwanted.js'], matched: ['dist/js/tremplin.js']
      });
      console.log('rejected');
    `)).toBe('rejected')
  })

  it('defers standalone products but preserves component assets and attribution', () => {
    for (const directory of ['examples/', 'icons/', 'starters/']) expect(policy.excludedProductRoots).toContain(directory)
    for (const file of ['dist/icons/datepicker-chevron.svg', 'dist/LICENSE.bootstrap', 'dist/THIRD_PARTY_NOTICES.txt']) expect(policy.requiredDistributionExceptions).toContain(file)
    expect(policy.localOnly).toBe(true)
    expect(policy.publishBlocked).toBe(true)
    expect(JSON.parse(read('package.json')).tremplinMigration.releaseBlocked).toBe(true)
  })
})
