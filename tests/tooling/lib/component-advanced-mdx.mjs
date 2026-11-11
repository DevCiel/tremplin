import { withinMdxAudit } from './mdx-audit-context.mjs'
import { assertComponentCompletionMdx, historicalComponentCompletionSource } from './component-completion-mdx.mjs'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
const read = file => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
const sha = value => createHash('sha256').update(value).digest('hex')
const names = ['datepicker', 'otp-input', 'range', 'strength']
const historical = ['site/src/data/component-docs.ts', 'site/src/data/strict-control-docs.ts', 'site/src/data/advanced-input-docs.ts', 'site/src/data/component-api.ts', 'site/src/libs/component-mdx.ts', 'site/src/pages/components/[slug].astro']

export function assertComponentAdvancedMdx() {
  return withinMdxAudit('component-advanced', () => {
    const policy = JSON.parse(read('metadata/component-advanced-mdx.json'))
    assert.equal(policy.phase, 'component-advanced-authored-mdx')
    assert.deepEqual(policy.names, names)
    assert.deepEqual(policy.canonical, names)
    assert.equal(policy.remaining, 9)
    assert.deepEqual(Object.keys(policy.historicalSources).sort(), historical.toSorted())
    assert.equal(policy.previousPolicy.file, 'metadata/component-choice-mdx.json')
    assert.equal(sha(read(policy.previousPolicy.file)), policy.previousPolicy.sha256, 'Earlier choice-component policy was refreshed')
    for (const entry of [...Object.values(policy.historicalSources), policy.expectation]) assert.equal(sha(read(entry.snapshot)), entry.sha256, 'Original advanced-component evidence changed')
    const allNames = [...names], seen = new Set()
    let previous = policy.previousPolicy
    while (previous) {
      assert(!seen.has(previous.file), 'Cyclic component migration policy')
      seen.add(previous.file)
      const prior = JSON.parse(read(previous.file))
      allNames.push(...prior.names)
      previous = prior.previousPolicy
    }
    assert.equal(allNames.length, 38)
    allNames.push(...assertComponentCompletionMdx().names)
    assert.deepEqual(readdirSync('site/src/content/docs/components').filter(file => file.endsWith('.mdx')).sort(), allNames.map(name => name + '.mdx').sort())
    assert.deepEqual(Object.keys(policy.sources).filter(file => file.endsWith('.mdx')).sort(), names.map(name => 'site/src/content/docs/components/' + name + '.mdx'))
    for (const [file, expected] of Object.entries(policy.sources)) assert.equal(sha(historicalComponentCompletionSource(file) ?? read(file)), expected, 'Unrecorded advanced-component migration change: ' + file)
    return policy
  })
}

export function historicalComponentAdvancedSource(file) {
  if (!historical.includes(file)) return undefined
  const policy = assertComponentAdvancedMdx()
  return read(policy.historicalSources[file].snapshot)
}
