import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { assertDocumentationPackage } from './helpers/documentation-scope'

const read = (file: string) => JSON.parse(readFileSync(file, 'utf8'))
const node = (source: string) => execFileSync(process.execPath, ['--input-type=module', '-e', source], { encoding: 'utf8' }).trim()

describe('canonical entry-point transition', () => {
  it('routes the root, focused components and explicit canonical paths to one native ES-module graph', () => {
    const product = read('package.json')
    expect(product.exports['.']).toEqual({ types: './js/dist/index.d.ts', default: './js/dist/index.js' })
    expect(product.exports['./*']).toEqual({ types: './js/dist/*.d.ts', default: './js/dist/*.js' })
    expect(product.exports['./js/dist/*']).toBe('./js/dist/*')
    expect(product.files).toContain('js/dist')
    expect(product.sideEffects).toContain('./js/dist/**/*.js')
    for (const field of ['main', 'module', 'types']) expect(product[field]).toBeUndefined()
    expect(product.tremplinMigration.releaseBlocked).toBe(true)
  })

  it('preserves the immutable API origin and all non-delivery public contracts', () => {
    const baseline = read('metadata/strict-api-baseline.json')
    const actual = read('metadata/public-api.json')
    const transition = read('metadata/core-entrypoint-transition.json')
    expect(transition.originPublicApiSha256).toBe(baseline.publicApiSha256)
    expect(createHash('sha256').update(JSON.stringify({ ...actual, packageExports: baseline.packageExports })).digest('hex')).toBe(baseline.publicApiSha256)
    expect(node(`
      import fs from 'node:fs';import {assertEntryPublicApi} from './tests/tooling/lib/entrypoint-transition.mjs';
      const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
      assertEntryPublicApi(read('metadata/public-api.json'),read('metadata/strict-api-baseline.json'),read('metadata/core-entrypoint-transition.json'));console.log('verified');
    `)).toBe('verified')
  })

  it('rejects arbitrary exports, core API drift and method/signature changes without baseline refresh', () => {
    expect(node(`
      import fs from 'node:fs';import assert from 'node:assert/strict';import {assertEntryPublicApi,assertEntryPackage} from './tests/tooling/lib/entrypoint-transition.mjs';
      const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),api=read('metadata/public-api.json'),baseline=read('metadata/strict-api-baseline.json'),transition=read('metadata/core-entrypoint-transition.json');
      for(const mutate of [x=>x.packageExports.push({specifier:'./unapproved',target:'./unapproved.js'}),x=>x.css.componentClasses.push('unapproved'),x=>x.javascriptModules[0].runtimeExports.push('unapproved'),x=>x.sass.mixins.push('unapproved()')]){const copy=structuredClone(api);mutate(copy);assert.throws(()=>assertEntryPublicApi(copy,baseline,transition));}
      const before={...transition.before,name:'tremplin',untouched:true},after={...before,...transition.after};for(const field of transition.removedFields)delete after[field];assertEntryPackage(before,after,transition);
      for(const mutate of [x=>x.files.push('unapproved'),x=>x.exports['./unapproved']='./unapproved.js',x=>x.sideEffects=[],x=>x.untouched=false]){const copy=structuredClone(after);mutate(copy);assert.throws(()=>assertEntryPackage(before,copy,transition));}console.log('rejected');
    `)).toBe('rejected')
  })

  it('keeps historical package fixtures and rejects unrelated package or release changes', () => {
    const original = readFileSync('tests/fixtures/documentation-scope/package.initial.json', 'utf8').replaceAll('\r\n', '\n')
    const hash = createHash('sha256').update(original).digest('hex')
    const product = read('package.json')
    expect(() => assertDocumentationPackage(JSON.stringify(product), hash)).not.toThrow()
    expect(() => assertDocumentationPackage(JSON.stringify({ ...product, main: 'dist/js/tremplin.cjs' }), hash)).toThrow()
    expect(() => assertDocumentationPackage(JSON.stringify({ ...product, files: [...product.files, 'unapproved'] }), hash)).toThrow()
    expect(() => assertDocumentationPackage(JSON.stringify({ ...product, tremplinMigration: { ...product.tremplinMigration, releaseBlocked: false } }), hash)).toThrow()
  })

  it('does not regenerate the retired root and component facades', () => {
    const transition = read('metadata/core-entrypoint-transition.json')
    expect(transition.retiredGeneratedEntries).toHaveLength(82)
    for (const file of transition.retiredGeneratedEntries) expect(existsSync(file), file).toBe(false)
    for (const file of ['js/dist/index.js', 'js/dist/index.d.ts', 'js/dist/button.js', 'js/dist/button.d.ts']) expect(existsSync(file), file).toBe(true)
  })
})
