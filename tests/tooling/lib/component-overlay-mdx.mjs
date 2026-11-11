import { withinMdxAudit } from './mdx-audit-context.mjs'
import { assertComponentCompletionMdx, historicalComponentCompletionSource } from './component-completion-mdx.mjs'
import { assertComponentAdvancedMdx } from './component-advanced-mdx.mjs'
import { assertComponentChoiceMdx } from './component-choice-mdx.mjs'
import { assertComponentMediaMdx } from './component-media-mdx.mjs'
import { assertComponentAdaptiveMdx } from './component-adaptive-mdx.mjs'
import { assertComponentFloatingMdx, historicalComponentFloatingSource } from './component-floating-mdx.mjs'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
const read = file => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
const sha = value => createHash('sha256').update(value).digest('hex')
const names = ['bottom-sheet', 'dialog', 'drawer']
const historical = ['site/src/data/component-docs.ts', 'site/src/data/component-reference.ts', 'site/src/data/overlay-component-docs.ts', 'site/src/data/sheet-command-docs.ts', 'site/src/data/component-api.ts', 'site/src/libs/component-mdx.ts', 'site/src/pages/components/[slug].astro']

export function assertComponentOverlayMdx() {
  return withinMdxAudit('component-overlay', () => {
    const policy = JSON.parse(read('metadata/component-overlay-mdx.json'))
    assert.equal(policy.phase, 'component-overlay-authored-mdx')
    assert.deepEqual(policy.names, names)
    assert.deepEqual(policy.canonical, ['dialog', 'drawer'])
    assert.equal(policy.remaining, 22)
    assert.deepEqual(Object.keys(policy.historicalSources).sort(), historical.toSorted())
    assert.equal(policy.previousPolicy.file, 'metadata/component-feedback-mdx.json')
    assert.equal(sha(read(policy.previousPolicy.file)), policy.previousPolicy.sha256, 'Earlier feedback-component policy was refreshed')
    for (const entry of [...Object.values(policy.historicalSources), policy.expectation]) assert.equal(sha(read(entry.snapshot)), entry.sha256, 'Original overlay-component evidence changed')
    const allNames = [...names], seen = new Set()
    let previous = policy.previousPolicy
    while (previous) {
      assert(!seen.has(previous.file), 'Cyclic component migration policy')
      seen.add(previous.file)
      const prior = JSON.parse(read(previous.file))
      allNames.push(...prior.names)
      previous = prior.previousPolicy
    }
    assert.equal(allNames.length, 25)
    allNames.push(...assertComponentFloatingMdx().names, ...assertComponentAdaptiveMdx().names, ...assertComponentMediaMdx().names, ...assertComponentChoiceMdx().names, ...assertComponentAdvancedMdx().names, ...assertComponentCompletionMdx().names)
    assert.deepEqual(readdirSync('site/src/content/docs/components').filter(file => file.endsWith('.mdx')).sort(), allNames.map(name => name + '.mdx').sort())
    assert.deepEqual(Object.keys(policy.sources).filter(file => file.endsWith('.mdx')).sort(), names.map(name => 'site/src/content/docs/components/' + name + '.mdx'))
    for (const [file, expected] of Object.entries(policy.sources)) assert.equal(sha(historicalComponentFloatingSource(file) ?? historicalComponentCompletionSource(file) ?? read(file)), expected, 'Unrecorded overlay-component migration change: ' + file)
    return policy
  })
}

export function historicalComponentOverlaySource(file) {
  if (!historical.includes(file)) return undefined
  const policy = assertComponentOverlayMdx()
  return read(policy.historicalSources[file].snapshot)
}
