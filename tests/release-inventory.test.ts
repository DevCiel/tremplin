import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { requiredReleaseAssets, requiredReleaseIntegrityAssets, validateCoreReleaseInventory } from './tooling/lib/release-inventory.mjs'

const json = (file: string) => JSON.parse(readFileSync(file, 'utf8'))
const manifest = () => json('package.json')
const integrity = () => json('dist/integrity.json')

describe('current core release inventory without publication permission', () => {
  it('validates native modules, canonical declarations, required assets and consumer notices', () => {
    expect(validateCoreReleaseInventory(manifest(), integrity(), existsSync)).toEqual({requiredAssets:21,requiredIntegrityAssets:13})
    expect(requiredReleaseAssets).toContain('js/dist/index.d.ts')
    expect(requiredReleaseAssets).toContain('dist/icons/datepicker-chevron.svg')
    expect(requiredReleaseAssets).not.toContain('dist/js/tremplin.cjs')
    expect(requiredReleaseAssets).not.toContain('dist/js/tremplin.d.ts')
    expect(requiredReleaseIntegrityAssets).toContain('js/tremplin.bundle.min.js')
  })

  it('rejects missing current assets, old outputs and incomplete consumer notices', () => {
    expect(() => validateCoreReleaseInventory(manifest(), integrity(), file => file !== 'js/dist/index.d.ts' && existsSync(file))).toThrow('Required current release asset is missing')
    expect(() => validateCoreReleaseInventory(manifest(), integrity(), file => file === 'dist/js/tremplin.cjs' || existsSync(file))).toThrow('Retired release output remains')
    const pkg = manifest()
    pkg.files = pkg.files.filter((file: string) => file !== 'THIRD_PARTY_NOTICES.txt')
    expect(() => validateCoreReleaseInventory(pkg, integrity(), existsSync)).toThrow('Required consumer file is not packaged')
  })

  it('rejects internal metadata and standalone products in the core consumer package', () => {
    for (const file of ['metadata','metadata/asset-retirement.json','docs','icons','themes','starters','src/adapters']) {
      const pkg = manifest()
      pkg.files.push(file)
      expect(() => validateCoreReleaseInventory(pkg, integrity(), existsSync), file).toThrow()
    }
  })

  it('rejects missing, malformed and obsolete integrity entries', () => {
    for (const corrupt of [
      (data: ReturnType<typeof integrity>) => { delete data.assets['icons/datepicker-chevron.svg'] },
      (data: ReturnType<typeof integrity>) => { data.assets['js/tremplin.min.js'].integrity = 'sha384-incorrect' },
      (data: ReturnType<typeof integrity>) => { data.assets['js/tremplin.min.js'].bytes = 0 },
      (data: ReturnType<typeof integrity>) => { data.assets['js/tremplin.cjs'] = data.assets['js/tremplin.js'] }
    ]) {
      const data = integrity()
      corrupt(data)
      expect(() => validateCoreReleaseInventory(manifest(), data, existsSync)).toThrow()
    }
  })

  it('still blocks the real release checker before inventory validation and never changes the manifest', () => {
    const before = readFileSync('package.json')
    const result = spawnSync(process.execPath, ['tests/tooling/check-release.mjs'], {encoding:'utf8'})
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Strict core is an unreleased migration')
    expect(result.stderr).not.toContain('Required current release asset is missing')
    expect(manifest().tremplinMigration.releaseBlocked).toBe(true)
    expect(readFileSync('package.json').equals(before)).toBe(true)
  })
})
