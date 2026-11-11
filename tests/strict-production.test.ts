import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'

const read = (file: string) => JSON.parse(readFileSync(file, 'utf8'))
const audit = read('artifacts/bootstrap-core-audit.json')

describe('Replaced strict production core', () => {
  it('verifies 131 exact modules and six explicit SEC-001/A11Y-001 patched modules without extra core files', () => {
    expect(audit.modules).toHaveLength(137)
    expect(audit.modules.filter((entry: any) => entry.kind === 'scss')).toHaveLength(102)
    expect(audit.modules.filter((entry: any) => entry.kind === 'javascript')).toHaveLength(35)
    expect(audit.extras.filter((entry: any) => entry.location === 'core-extra')).toEqual([])
    expect(audit.modules.filter((entry: any) => entry.status === 'matched')).toHaveLength(131)
    expect(audit.modules.filter((entry: any) => entry.status === 'approved-security-patch')).toHaveLength(6)
    for (const entry of audit.modules) {
      expect(createHash('sha256').update(readFileSync(entry.local, 'utf8').replaceAll('\r\n', '\n')).digest('hex'), entry.local).toBe(entry.acceptedSha256)
      if (entry.securityPatch) expect(entry.securityPatch.id).toBe(entry.local === 'src/js/nav-overflow.ts' ? 'SEC-001+A11Y-001' : 'SEC-001')
      else expect(entry.acceptedSha256).toBe(entry.expectedSha256)
    }
  })

  it('keeps optional implementations out of the compiled default graph', () => {
    const graph = read('artifacts/core-build-graph.json')
    expect(graph.profile).toBe('strict-core-unreleased')
    expect(Object.keys(graph.defaultGraph.inputs).some(file => /src\/(?:compat|adapters)\/|src\/js\/extensions\//.test(file.replaceAll('\\', '/')))).toBe(false)
    expect(readFileSync('dist/css/tremplin.css', 'utf8')).not.toContain('.command-palette')
    expect(readFileSync('artifacts/documentation-assets/dist/css/tremplin-extensions.css', 'utf8')).toContain('.command-palette')
  })

  it('uses an explicit strict contract and keeps publishing blocked', () => {
    const baseline = read('metadata/strict-api-baseline.json')
    expect(baseline.commit).toBe(read('metadata/bootstrap6-reference.json').commit)
    const digest = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex')
    expect(baseline.apiSha256).toBe(digest(read('metadata/api.json')))
    expect(baseline.publicApiSha256).toBe(digest({ ...read('metadata/public-api.json'), packageExports: baseline.packageExports }))
    expect(baseline.packageExports.some((entry: any) => entry.specifier.startsWith('./compat/'))).toBe(false)
    expect(read('package.json').tremplinMigration.releaseBlocked).toBe(true)
    expect(read('metadata/strict-migration-report.json').releaseReady).toBe(false)
  })

  it('discovers inherited option types and methods rather than flattening source syntax', () => {
    const dialog = read('metadata/api.json').components.find((component: any) => component.name === 'dialog')
    expect(dialog.options.some((option: any) => option.name === 'keyboard' && option.type.includes('boolean'))).toBe(true)
    expect(dialog.methods.some((method: string) => method.startsWith('show('))).toBe(true)
    expect(dialog.methods).not.toContain('_show()')
  })
})
