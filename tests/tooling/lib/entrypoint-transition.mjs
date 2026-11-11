// Narrow, reversible delivery projection. The established source/API baseline
// remains immutable; changed entry paths cannot bless method, class or Sass drift.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { projectCoreExports } from './core-package-scope.mjs'

export const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
const entries = exports => Object.entries(exports).map(([specifier, target]) => ({ specifier, target })).sort((a, b) => a.specifier.localeCompare(b.specifier))

export function projectEntryExports(baselineExports) {
  const projected = baselineExports.map(entry => entry.specifier === '.'
    ? { specifier: '.', target: { types: './js/dist/index.d.ts', default: './js/dist/index.js' } }
    : entry.specifier === './*'
      ? { specifier: './*', target: { types: './js/dist/*.d.ts', default: './js/dist/*.js' } }
      : entry)
  assert(!projected.some(entry => entry.specifier === './js/dist/*'), 'Canonical module export already exists at the origin')
  projected.push({ specifier: './js/dist/*', target: './js/dist/*' })
  return projected.sort((a, b) => a.specifier.localeCompare(b.specifier))
}

export function assertEntryPackage(expectedBefore, actual, transition) {
  assert.equal(transition.phase, 'canonical-esm-entrypoints')
  assert.deepEqual(transition.removedFields, ['main', 'module', 'types'])
  assert.deepEqual(Object.keys(transition.before).sort(), ['exports', 'files', 'main', 'module', 'sideEffects', 'types'])
  assert.deepEqual(Object.keys(transition.after).sort(), ['exports', 'files', 'sideEffects'])
  for (const [field, value] of Object.entries(transition.before)) assert.deepEqual(expectedBefore[field], value, 'Entry transition origin changed: ' + field)
  const files = transition.before.files.slice()
  assert(!files.includes('js/dist'), 'Canonical modules already packed at the origin')
  files.splice(files.indexOf('dist') + 1, 0, 'js/dist')
  assert.deepEqual(transition.after.files, files, 'Only canonical modules may be added to this package batch')
  const sideEffects = transition.before.sideEffects.slice()
  assert(!sideEffects.includes('./js/dist/**/*.js'))
  sideEffects.splice(sideEffects.indexOf('./src/js/**/*.ts') + 1, 0, './js/dist/**/*.js')
  assert.deepEqual(transition.after.sideEffects, sideEffects, 'Canonical data API registration must survive tree shaking')
  assert.deepEqual(entries(transition.after.exports), projectEntryExports(entries(transition.before.exports)), 'Undeclared export change')
  const expected = { ...expectedBefore, ...transition.after }
  for (const field of transition.removedFields) delete expected[field]
  assert.deepEqual(actual, expected, 'Package changes exceed the declared entry-point projection')
}

export function assertEntryPublicApi(actual, baseline, transition) {
  assert.equal(transition.originPublicApiSha256, baseline.publicApiSha256, 'Wrong immutable API origin')
  assert.deepEqual(entries(transition.before.exports), baseline.packageExports, 'Export origin differs from the frozen baseline')
  assert.deepEqual(actual.packageExports, projectCoreExports(projectEntryExports(baseline.packageExports)), 'Unexpected public export shape')
  assert.equal(digest({ ...actual, packageExports: baseline.packageExports }), baseline.publicApiSha256,
    'Non-delivery public API drift: core methods, classes, tokens, modules and Sass contracts must be unchanged')
}
