import { withinMdxAudit } from './mdx-audit-context.mjs'
import { assertComponentCompletionMdx } from './component-completion-mdx.mjs'
import { assertComponentAdvancedMdx, historicalComponentAdvancedSource } from './component-advanced-mdx.mjs'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
const read = file => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
const sha = value => createHash('sha256').update(value).digest('hex')
const names = ['chips', 'combobox']
const historical = ['site/src/data/component-docs.ts', 'site/src/data/strict-control-docs.ts', 'site/src/data/choice-input-docs.ts', 'site/src/data/component-api.ts', 'site/src/libs/component-mdx.ts', 'site/src/pages/components/[slug].astro']

export function assertComponentChoiceMdx() {
  return withinMdxAudit('component-choice', () => {
    const policy = JSON.parse(read('metadata/component-choice-mdx.json'))
    assert.equal(policy.phase, 'component-choice-authored-mdx')
    assert.deepEqual(policy.names, names)
    assert.deepEqual(policy.canonical, names)
    assert.equal(policy.remaining, 13)
    assert.deepEqual(Object.keys(policy.historicalSources).sort(), historical.toSorted())
    assert.equal(policy.previousPolicy.file, 'metadata/component-media-mdx.json')
    assert.equal(sha(read(policy.previousPolicy.file)), policy.previousPolicy.sha256, 'Earlier media-component policy was refreshed')
    for (const entry of [...Object.values(policy.historicalSources), policy.expectation]) assert.equal(sha(read(entry.snapshot)), entry.sha256, 'Original choice-component evidence changed')
    const allNames = [...names], seen = new Set()
    let previous = policy.previousPolicy
    while (previous) {
      assert(!seen.has(previous.file), 'Cyclic component migration policy')
      seen.add(previous.file)
      const prior = JSON.parse(read(previous.file))
      allNames.push(...prior.names)
      previous = prior.previousPolicy
    }
    assert.equal(allNames.length, 34)
    allNames.push(...assertComponentAdvancedMdx().names, ...assertComponentCompletionMdx().names)
    assert.deepEqual(readdirSync('site/src/content/docs/components').filter(file => file.endsWith('.mdx')).sort(), allNames.map(name => name + '.mdx').sort())
    assert.deepEqual(Object.keys(policy.sources).filter(file => file.endsWith('.mdx')).sort(), names.map(name => 'site/src/content/docs/components/' + name + '.mdx'))
    for (const [file, expected] of Object.entries(policy.sources)) assert.equal(sha(historicalComponentAdvancedSource(file) ?? read(file)), expected, 'Unrecorded choice-component migration change: ' + file)
    return policy
  })
}

export function historicalComponentChoiceSource(file) {
  if (!historical.includes(file)) return undefined
  const policy = assertComponentChoiceMdx()
  return read(policy.historicalSources[file].snapshot)
}
