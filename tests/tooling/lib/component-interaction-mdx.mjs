import { withinMdxAudit } from './mdx-audit-context.mjs'
import { assertComponentCompletionMdx } from './component-completion-mdx.mjs'
import { assertComponentAdvancedMdx } from './component-advanced-mdx.mjs'
import { assertComponentChoiceMdx } from './component-choice-mdx.mjs'
import { assertComponentMediaMdx } from './component-media-mdx.mjs'
import { assertComponentAdaptiveMdx } from './component-adaptive-mdx.mjs'
import { assertComponentFloatingMdx } from './component-floating-mdx.mjs'
import { assertComponentOverlayMdx } from './component-overlay-mdx.mjs'
import { assertComponentFeedbackMdx, historicalComponentFeedbackSource } from './component-feedback-mdx.mjs'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
const read = file => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
const sha = value => createHash('sha256').update(value).digest('hex')
const names = ['menu', 'tab']
const historical = ['site/src/data/component-docs.ts', 'site/src/data/selection-feedback-docs.ts', 'site/src/data/component-api.ts', 'site/src/libs/component-mdx.ts', 'site/src/pages/components/[slug].astro']

export function assertComponentInteractionMdx() {
  return withinMdxAudit('component-interaction', () => {
    const policy = JSON.parse(read('metadata/component-interaction-mdx.json'))
    assert.equal(policy.phase, 'component-interaction-authored-mdx')
    assert.deepEqual(policy.names, names)
    assert.equal(policy.remaining, 28)
    assert.deepEqual(Object.keys(policy.historicalSources).sort(), historical.toSorted())
    assert.equal(policy.previousPolicy.file, 'metadata/component-navigation-mdx.json')
    assert.equal(sha(read(policy.previousPolicy.file)), policy.previousPolicy.sha256, 'Earlier navigation-component policy was refreshed')
    for (const entry of [...Object.values(policy.historicalSources), policy.expectation]) assert.equal(sha(read(entry.snapshot)), entry.sha256, 'Original interaction-component evidence changed')
    const allNames = [...names], seen = new Set()
    let previous = policy.previousPolicy
    while (previous) {
      assert(!seen.has(previous.file), 'Cyclic component migration policy')
      seen.add(previous.file)
      const prior = JSON.parse(read(previous.file))
      allNames.push(...prior.names)
      previous = prior.previousPolicy
    }
    assert.equal(allNames.length, 19)
    allNames.push(...assertComponentFeedbackMdx().names, ...assertComponentOverlayMdx().names, ...assertComponentFloatingMdx().names, ...assertComponentAdaptiveMdx().names, ...assertComponentMediaMdx().names, ...assertComponentChoiceMdx().names, ...assertComponentAdvancedMdx().names, ...assertComponentCompletionMdx().names)
    assert.deepEqual(readdirSync('site/src/content/docs/components').filter(file => file.endsWith('.mdx')).sort(), allNames.map(name => name + '.mdx').sort())
    assert.deepEqual(Object.keys(policy.sources).filter(file => file.endsWith('.mdx')).sort(), names.map(name => 'site/src/content/docs/components/' + name + '.mdx'))
    for (const [file, expected] of Object.entries(policy.sources)) assert.equal(sha(historicalComponentFeedbackSource(file) ?? read(file)), expected, 'Unrecorded interaction-component migration change: ' + file)
    return policy
  })
}

export function historicalComponentInteractionSource(file) {
  if (!historical.includes(file)) return undefined
  const policy = assertComponentInteractionMdx()
  return read(policy.historicalSources[file].snapshot)
}
