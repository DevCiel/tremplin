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
import { historicalUtilitiesSource } from './utilities-mdx.mjs'
import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { assertComponentDisclosureMdx, historicalComponentDisclosureSource } from './component-disclosure-mdx.mjs'
import { assertComponentCollectionMdx } from './component-collection-mdx.mjs'
import { assertComponentNavigationMdx } from './component-navigation-mdx.mjs'
import { assertComponentInteractionMdx } from './component-interaction-mdx.mjs'
const read = file => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
const sha = value => createHash('sha256').update(value).digest('hex')
const names = ['alert', 'button']
const historical = ['site/src/data/component-docs.ts', 'site/src/data/foundation-component-docs.ts', 'site/src/libs/component-mdx.ts', 'site/src/pages/components/[slug].astro', 'site/src/content.config.ts']

export function assertComponentActionsMdx() {
  return withinMdxAudit('component-actions', () => {
    const policy = JSON.parse(read('metadata/component-actions-mdx.json'))
    assert.equal(policy.phase, 'component-actions-authored-mdx')
    assert.deepEqual(policy.names, names)
    assert.equal(policy.remaining, 38)
    assert.deepEqual(Object.keys(policy.historicalSources).sort(), historical.toSorted())
    assert.equal(policy.previousPolicy.file, 'metadata/component-presentation-mdx.json')
    assert.equal(sha(read(policy.previousPolicy.file)), policy.previousPolicy.sha256, 'Earlier component policy was refreshed')
    for (const entry of [...Object.values(policy.historicalSources), policy.expectation]) assert.equal(sha(read(entry.snapshot)), entry.sha256, 'Original action-component evidence changed')
    const prior = JSON.parse(read(policy.previousPolicy.file))
    const files = readdirSync('site/src/content/docs/components').filter(name => name.endsWith('.mdx')).sort()
    assert.deepEqual(files, [...prior.names, ...names, ...assertComponentDisclosureMdx().names, ...assertComponentCollectionMdx().names, ...assertComponentNavigationMdx().names, ...assertComponentInteractionMdx().names, ...assertComponentFeedbackMdx().names, ...assertComponentOverlayMdx().names, ...assertComponentFloatingMdx().names, ...assertComponentAdaptiveMdx().names, ...assertComponentMediaMdx().names, ...assertComponentChoiceMdx().names, ...assertComponentAdvancedMdx().names, ...assertComponentCompletionMdx().names].map(name => name + '.mdx').sort())
    assert.deepEqual(Object.keys(policy.sources).filter(file => file.endsWith('.mdx')).sort(), names.map(name => 'site/src/content/docs/components/' + name + '.mdx'))
    for (const [file, expected] of Object.entries(policy.sources)) assert.equal(sha(historicalComponentDisclosureSource(file) ?? historicalUtilitiesSource(file) ?? read(file)), expected, 'Unrecorded action-component migration change: ' + file)
    return policy
  })
}

export function historicalComponentActionsSource(file) {
  if (!historical.includes(file)) return undefined
  const policy = assertComponentActionsMdx()
  return read(policy.historicalSources[file].snapshot)
}
