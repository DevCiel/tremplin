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
import { assertComponentActionsMdx, historicalComponentActionsSource } from './component-actions-mdx.mjs'
import { assertComponentDisclosureMdx } from './component-disclosure-mdx.mjs'
import { assertComponentCollectionMdx } from './component-collection-mdx.mjs'
import { assertComponentNavigationMdx, historicalComponentNavigationSource } from './component-navigation-mdx.mjs'
import { assertComponentInteractionMdx } from './component-interaction-mdx.mjs'
const read = file => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
const sha = value => createHash('sha256').update(value).digest('hex')
const names = ['avatar', 'badge', 'card', 'placeholder', 'progress', 'skeleton', 'spinner']
const historical = ['site/src/data/component-docs.ts', 'site/src/data/component-reference.ts', 'site/src/data/loading-identity-docs.ts', 'site/src/data/foundation-component-docs.ts', 'site/src/pages/components/[slug].astro', 'site/src/pages/[...guide].astro', 'site/src/content.config.ts']

export function assertComponentPresentationMdx() {
  return withinMdxAudit('component-presentation', () => {
    const policy = JSON.parse(read('metadata/component-presentation-mdx.json'))
    assert.equal(policy.phase, 'component-presentation-authored-mdx')
    assert.deepEqual(policy.names, names)
    assert.equal(policy.remaining, 40)
    assert.deepEqual(Object.keys(policy.historicalSources).sort(), historical.toSorted())
    for (const entry of [...Object.values(policy.historicalSources), policy.expectation]) assert.equal(sha(read(entry.snapshot)), entry.sha256, 'Original component evidence changed')
    const files = readdirSync('site/src/content/docs/components').filter(name => name.endsWith('.mdx')).map(name => 'site/src/content/docs/components/' + name).sort()
    const added = [...assertComponentActionsMdx().names, ...assertComponentDisclosureMdx().names, ...assertComponentCollectionMdx().names, ...assertComponentNavigationMdx().names, ...assertComponentInteractionMdx().names, ...assertComponentFeedbackMdx().names, ...assertComponentOverlayMdx().names, ...assertComponentFloatingMdx().names, ...assertComponentAdaptiveMdx().names, ...assertComponentMediaMdx().names, ...assertComponentChoiceMdx().names, ...assertComponentAdvancedMdx().names, ...assertComponentCompletionMdx().names].map(name => 'site/src/content/docs/components/' + name + '.mdx')
    assert.deepEqual(files, [...names.map(name => 'site/src/content/docs/components/' + name + '.mdx'), ...added].sort())
    assert.deepEqual(Object.keys(policy.sources).filter(file => file.endsWith('.mdx')).sort(), names.map(name => 'site/src/content/docs/components/' + name + '.mdx'))
    for (const [file, expected] of Object.entries(policy.sources)) assert.equal(sha(historicalComponentActionsSource(file) ?? historicalComponentNavigationSource(file) ?? historicalUtilitiesSource(file) ?? read(file)), expected, 'Unrecorded component migration change: ' + file)
    return policy
  })
}

export function historicalComponentPresentationSource(file) {
  if (!historical.includes(file)) return undefined
  const policy = assertComponentPresentationMdx()
  return read(policy.historicalSources[file].snapshot)
}
