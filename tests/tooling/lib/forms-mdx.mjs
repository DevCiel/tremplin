import { historicalComponentCompletionSource } from './component-completion-mdx.mjs'
import { historicalHelpersSource } from './helpers-mdx.mjs'
import { historicalUtilitiesSource } from './utilities-mdx.mjs'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { historicalComponentPresentationSource } from './component-presentation-mdx.mjs'
import { historicalComponentChoiceSource } from './component-choice-mdx.mjs'
import { historicalComponentAdvancedSource } from './component-advanced-mdx.mjs'
const read = file => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
const sha = value => createHash('sha256').update(value).digest('hex')
const historical = ['forms-guides', 'form-composition-guides', 'native-form-guides', 'forms-overview-docs', 'choice-input-docs', 'advanced-input-docs', 'strict-control-guides', 'guide-docs'].map(name => 'site/src/data/' + name + '.ts').concat('site/src/libs/mdx-guides.ts')

export function assertFormsMdx() {
  const policy = JSON.parse(read('metadata/forms-mdx.json'))
  assert.equal(policy.phase, 'forms-authored-mdx')
  assert.equal(policy.guides, 17)
  assert.deepEqual(Object.keys(policy.historicalSources).sort(), historical.toSorted())
  for (const entry of [...Object.values(policy.historicalSources), policy.expectation]) assert.equal(sha(read(entry.snapshot)), entry.sha256, 'Historical Forms evidence changed')
  assert.deepEqual(policy.removed, ['site/src/data/strict-control-guides.ts'])
  for (const file of policy.removed) assert.equal(existsSync(file), false, 'Retired guide shim restored: ' + file)
  const files = readdirSync('site/src/content/docs/forms').filter(name => name.endsWith('.mdx')).map(name => 'site/src/content/docs/forms/' + name).sort()
  assert.equal(files.length, 17)
  assert.deepEqual(Object.keys(policy.sources).filter(file => file.endsWith('.mdx')).sort(), files)
  for (const [file, expected] of Object.entries(policy.sources)) assert.equal(sha(historicalComponentPresentationSource(file) ?? historicalComponentChoiceSource(file) ?? historicalComponentAdvancedSource(file) ?? historicalComponentCompletionSource(file) ?? historicalHelpersSource(file) ?? historicalUtilitiesSource(file) ?? read(file)), expected, 'Unrecorded Forms migration change: ' + file)
  return policy
}

export function historicalFormsSource(file) {
  if (!historical.includes(file)) return undefined
  const policy = assertFormsMdx()
  return read(policy.historicalSources[file].snapshot)
}
