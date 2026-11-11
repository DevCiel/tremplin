import { withinMdxAudit } from './mdx-audit-context.mjs'
import { assertComponentCompletionMdx } from './component-completion-mdx.mjs'
import { assertComponentAdvancedMdx } from './component-advanced-mdx.mjs'
import { assertComponentChoiceMdx } from './component-choice-mdx.mjs'
import { assertComponentMediaMdx } from './component-media-mdx.mjs'
import { assertComponentAdaptiveMdx } from './component-adaptive-mdx.mjs'
import { assertComponentFloatingMdx } from './component-floating-mdx.mjs'
import { assertComponentOverlayMdx } from './component-overlay-mdx.mjs'
import { assertComponentFeedbackMdx } from './component-feedback-mdx.mjs'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { assertComponentCollectionMdx, historicalComponentCollectionSource } from './component-collection-mdx.mjs'
import { assertComponentNavigationMdx, historicalComponentNavigationSource } from './component-navigation-mdx.mjs'
import { assertComponentInteractionMdx, historicalComponentInteractionSource } from './component-interaction-mdx.mjs'
const read = file => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
const sha = value => createHash('sha256').update(value).digest('hex')
const names = ['accordion', 'collapse']
const historical = ['site/src/data/component-docs.ts', 'site/src/data/collection-disclosure-docs.ts', 'site/src/data/navigation-disclosure-docs.ts', 'site/src/libs/component-mdx.ts', 'site/src/data/component-api.ts', 'site/src/pages/components/[slug].astro']

export function assertComponentDisclosureMdx() {
  return withinMdxAudit('component-disclosure', () => {
    const policy = JSON.parse(read('metadata/component-disclosure-mdx.json'))
    assert.equal(policy.phase, 'component-disclosure-authored-mdx')
    assert.deepEqual(policy.names, names)
    assert.equal(policy.remaining, 36)
    assert.deepEqual(Object.keys(policy.historicalSources).sort(), historical.toSorted())
    assert.equal(policy.previousPolicy.file, 'metadata/component-actions-mdx.json')
    assert.equal(sha(read(policy.previousPolicy.file)), policy.previousPolicy.sha256, 'Earlier action-component policy was refreshed')
    for (const entry of [...Object.values(policy.historicalSources), policy.expectation]) assert.equal(sha(read(entry.snapshot)), entry.sha256, 'Original disclosure-component evidence changed')
    const previous = JSON.parse(read(policy.previousPolicy.file))
    const first = JSON.parse(read(previous.previousPolicy.file))
    const allNames = [...first.names, ...previous.names, ...names, ...assertComponentCollectionMdx().names, ...assertComponentNavigationMdx().names, ...assertComponentInteractionMdx().names, ...assertComponentFeedbackMdx().names, ...assertComponentOverlayMdx().names, ...assertComponentFloatingMdx().names, ...assertComponentAdaptiveMdx().names, ...assertComponentMediaMdx().names, ...assertComponentChoiceMdx().names, ...assertComponentAdvancedMdx().names, ...assertComponentCompletionMdx().names].sort()
    assert.deepEqual(readdirSync('site/src/content/docs/components').filter(file => file.endsWith('.mdx')).sort(), allNames.map(name => name + '.mdx').sort())
    assert.deepEqual(Object.keys(policy.sources).filter(file => file.endsWith('.mdx')).sort(), names.map(name => 'site/src/content/docs/components/' + name + '.mdx'))
    for (const [file, expected] of Object.entries(policy.sources)) assert.equal(sha(historicalComponentCollectionSource(file) ?? historicalComponentNavigationSource(file) ?? historicalComponentInteractionSource(file) ?? read(file)), expected, 'Unrecorded disclosure-component migration change: ' + file)
    return policy
  })
}

export function historicalComponentDisclosureSource(file) {
  if (!historical.includes(file)) return undefined
  const policy = assertComponentDisclosureMdx()
  return read(policy.historicalSources[file].snapshot)
}
