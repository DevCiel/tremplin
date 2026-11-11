import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { assertDocumentationPackage } from './helpers/documentation-scope'

const read = (file: string) => JSON.parse(readFileSync(file, 'utf8'))
const node = (source: string) => execFileSync(process.execPath, ['--input-type=module', '-e', source], { encoding: 'utf8' }).trim()

describe('core package optional-product separation', () => {
  it('removes precisely the eight optional exports and optional peers, without changing core import paths', () => {
    const policy = read('metadata/core-package-scope.json'), pkg = read('package.json')
    expect(policy.removedExports).toHaveLength(8)
    for (const specifier of policy.removedExports) expect(pkg.exports[specifier]).toBeUndefined()
    expect(Object.keys(pkg.exports)).toHaveLength(11)
    expect(pkg.exports['.']).toEqual({ types: './js/dist/index.d.ts', default: './js/dist/index.js' })
    expect(pkg.peerDependencies).toEqual({ '@floating-ui/dom': '^1.8.0', 'vanilla-calendar-pro': '^3.4.0' })
    expect(pkg.peerDependenciesMeta).toBeUndefined()
    expect(pkg.sideEffects).toContain('./js/dist/**/*.js')
  })

  it('packs only maintained core sources and excludes optional/generated internal products', () => {
    const pkg = read('package.json'), policy = read('metadata/core-package-scope.json')
    expect(pkg.files).toEqual(read('metadata/tremplin-branding.json').filesAfter)
    for (const path of ['src/js', 'src/scss', 'js/dist', 'dist', 'LICENSE', 'THIRD_PARTY_NOTICES.txt']) expect(pkg.files).toContain(path)
    expect(policy.requiredAssetException).toBe('dist/icons/datepicker-chevron.svg')
    for (const path of ['!dist/cjs/**', '!dist/types/**', '!dist/js/adapters/**', '!dist/js/extensions/**', '!dist/css/tremplin-extensions*', '!src/js/extensions/**', '!src/scss/extensions/**']) expect(pkg.files).toContain(path)
    for (const path of ['src', 'src/adapters', 'examples', 'starters', 'themes', 'icons', 'docs']) expect(pkg.files).not.toContain(path)
    const assets = Object.keys(read('dist/integrity.json').assets)
    expect(assets).toContain('icons/datepicker-chevron.svg')
    expect(assets.some(file => /^(?:cjs|types)\/|^js\/(?:adapters|extensions)\/|tremplin-extensions/.test(file))).toBe(false)
  })

  it('preserves authored local products and the required same-origin calendar asset', () => {
    for (const path of ['src/adapters/react.ts', 'src/adapters/vue.ts', 'src/js/extensions/command-palette.ts', 'src/scss/extensions/index.scss', 'icons/tremplin-icons.svg', 'themes/tremplin-ocean.css', 'starters/react/package.json']) expect(existsSync(path), path).toBe(true)
    expect(readFileSync('icons/ui/datepicker-chevron.svg').equals(readFileSync('dist/icons/datepicker-chevron.svg'))).toBe(true)
    expect(readFileSync('dist/THIRD_PARTY_NOTICES.txt','utf8')).toContain(readFileSync('licenses/third-party-code.txt','utf8'))
    expect(read('metadata/core-package-scope.json').localOnly).toBe(true)
    expect(read('package.json').tremplinMigration.releaseBlocked).toBe(true)
  })

  it('keeps the historical whole-API fingerprint and package fixture unchanged', () => {
    const api = read('metadata/public-api.json'), baseline = read('metadata/strict-api-baseline.json')
    expect(createHash('sha256').update(JSON.stringify({ ...api, packageExports: baseline.packageExports })).digest('hex')).toBe(baseline.publicApiSha256)
    const fixture = readFileSync('tests/fixtures/documentation-scope/package.initial.json', 'utf8').replaceAll('\r\n', '\n')
    expect(() => assertDocumentationPackage(JSON.stringify(read('package.json')), createHash('sha256').update(fixture).digest('hex'))).not.toThrow()
  })

  it('rejects unreviewed exports, missing side-effect protection and unrelated release changes', () => {
    expect(node(`
      import fs from 'node:fs';import assert from 'node:assert/strict';
      import {projectCorePackage,assertCorePackage,projectCoreExports,isCoreArchivePath} from './tests/tooling/lib/core-package-scope.mjs';
      const before=JSON.parse(fs.readFileSync('tests/fixtures/documentation-scope/package.initial.json','utf8'));
      before.sideEffects.push('./js/dist/**/*.js');
      const projected=projectCorePackage(before);assertCorePackage(before,projected);
      for(const mutate of [x=>x.exports['./react']='./unapproved.js',x=>x.files.push('icons'),x=>x.sideEffects=[],x=>x.version='1.0.0',x=>x.tremplinMigration.releaseBlocked=false]){const copy=structuredClone(projected);mutate(copy);assert.throws(()=>assertCorePackage(before,copy));}
      for(const file of ['../x','dist/../x','/dist/x','C:/x'])assert.throws(()=>isCoreArchivePath(file));
      for(const file of ['dist/cjs/js/button.js','src/js/extensions/command-palette.ts','icons/tremplin-icons.svg'])assert.equal(isCoreArchivePath(file),false);
      assert.equal(isCoreArchivePath('dist/icons/datepicker-chevron.svg'),true);
      assert.throws(()=>projectCoreExports([]));console.log('rejected');
    `)).toBe('rejected')
  })

  it('keeps lockfile peer requirements synchronized with the core manifest', () => {
    const pkg = read('package.json'), lock = read('package-lock.json').packages['']
    expect(lock.peerDependencies).toEqual(pkg.peerDependencies)
    expect(lock.peerDependenciesMeta).toBeUndefined()
    expect(lock.devDependencies).toEqual(pkg.devDependencies)
  })
})
