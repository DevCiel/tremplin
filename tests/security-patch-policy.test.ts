import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
// @ts-expect-error Runtime JavaScript helper is covered directly by these tests.
import { validateSecurityRegistry, approvedSecuritySource, classifySecuritySource } from '../build/lib/tremplin-security.mjs'
import registry from '../metadata/bootstrap6-security-patches.json'
import pin from '../metadata/bootstrap6-reference.json'

const original = (file: string) => readFileSync(`artifacts/bootstrap6-strict/${pin.commit}/${file.replace(/^src\/js\//, 'js/src/').replace(/^src\/scss\//, 'scss/')}`, 'utf8')

describe('Approved security exceptions do not hide source drift', () => {
  it('reconstructs all six patched files from the pristine pin', () => {
    expect(validateSecurityRegistry(registry, pin.commit)).toBe(registry)
    expect(registry.files).toHaveLength(6)
    for (const entry of registry.files) expect(approvedSecuritySource(entry.path, original(entry.path), registry).source).toBe(readFileSync(entry.path, 'utf8').replaceAll('\r\n', '\n'))
  })

  it('rejects changed pins, targets, duplicate targets and edit digests', () => {
    expect(() => validateSecurityRegistry(registry, '0'.repeat(40))).toThrow()
    for (const mutate of [
      (copy: any) => { copy.files[0].path = '../outside.ts' },
      (copy: any) => { copy.files[0].path = 'src/js/dialog.ts' },
      (copy: any) => { copy.files[1] = copy.files[0] },
      (copy: any) => { copy.files[0].edits[0].after.push('// unreviewed') }
    ]) {
      const copy = structuredClone(registry)
      mutate(copy)
      expect(() => validateSecurityRegistry(copy, pin.commit)).toThrow()
    }
  })

  it('allows the accessibility exception only on NavOverflow with explicit approval', () => {
    for (const mutate of [
      (copy: any) => { delete copy.accessibilityApproval },
      (copy: any) => { copy.accessibilityApproval.id = 'A11Y-002' },
      (copy: any) => { copy.files.find((entry: any) => entry.path === 'src/js/nav-overflow.ts').id = 'SEC-001' },
      (copy: any) => { copy.files[0].id = 'SEC-001+A11Y-001' }
    ]) {
      const copy = structuredClone(registry)
      mutate(copy)
      expect(() => validateSecurityRegistry(copy, pin.commit)).toThrow()
    }
  })

  it('rejects a modified base or declared patched output', () => {
    const entry = registry.files[0]!
    expect(() => approvedSecuritySource(entry.path, original(entry.path) + '\n// drift', registry)).toThrow(/base/)
    const copy = structuredClone(registry)
    copy.files[0]!.patchedSha256 = '0'.repeat(64)
    expect(() => approvedSecuritySource(entry.path, original(entry.path), copy)).toThrow(/output digest/)
  })

  it('labels patches honestly and rejects both reverts and unrelated edits', () => {
    const entry = registry.files[0]!
    const base = original(entry.path)
    const accepted = approvedSecuritySource(entry.path, base, registry)
    expect(classifySecuritySource(accepted.source, base, accepted)).toBe('approved-security-patch')
    expect(classifySecuritySource(base, base, accepted)).toBe('security-patch-missing')
    expect(classifySecuritySource(accepted.source + '\n// unexpected', base, accepted)).toBe('implementation-differs')
    expect(classifySecuritySource(undefined, base, accepted)).toBe('missing')
  })

  it('rejects missing or redirected security asset declarations', () => {
    for (const mutate of [
      (copy: any) => { copy.assets = [] },
      (copy: any) => { copy.assets[0].path = 'icons/other.svg' },
      (copy: any) => { copy.assets[0].output = '../outside.svg' },
      (copy: any) => { copy.assets[0].sha256 = 'not-a-digest' }
    ]) {
      const copy = structuredClone(registry)
      mutate(copy)
      expect(() => validateSecurityRegistry(copy, pin.commit)).toThrow()
    }
  })

  it('leaves non-patched modules subject to exact equality', () => {
    const file = 'src/js/dialog.ts'
    const base = original(file)
    const accepted = approvedSecuritySource(file, base, registry)
    expect(accepted.patch).toBeNull()
    expect(classifySecuritySource(base, base, accepted)).toBe('matched')
    expect(classifySecuritySource(base + ' ', base, accepted)).toBe('implementation-differs')
  })
})
