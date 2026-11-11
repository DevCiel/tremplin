import { historicalComponentCompletionSource } from './component-completion-mdx.mjs'
import { historicalHelpersSource } from './helpers-mdx.mjs'
import { historicalUtilitiesSource } from './utilities-mdx.mjs'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { historicalGuidesCustomizeSource } from './guides-customize-mdx.mjs'
import { historicalLayoutContentSource } from './layout-content-mdx.mjs'
import { historicalFormsSource } from './forms-mdx.mjs'
import { historicalComponentPresentationSource } from './component-presentation-mdx.mjs'
import { historicalComponentOverlaySource } from './component-overlay-mdx.mjs'
import { historicalComponentAdaptiveSource } from './component-adaptive-mdx.mjs'
import { historicalComponentMediaSource } from './component-media-mdx.mjs'
const read = file => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
const sha = text => createHash('sha256').update(text).digest('hex')

/** Historical records remain immutable; active MDX sources have a separate transition. */
export function assertGettingStartedMdx() {
  const policy = JSON.parse(read('metadata/getting-started-mdx.json'))
  assert.equal(policy.phase, 'getting-started-authored-mdx')
  assert.equal(policy.guides, 11)
  assert.deepEqual(Object.keys(policy.historicalSources).sort(), ['site/src/data/getting-started-guides.ts', 'site/src/data/installation-guide.ts'])
  for (const entry of Object.values(policy.historicalSources)) assert.equal(sha(read(entry.snapshot)), entry.sha256, 'Historical MDX migration source changed')
  const mdxFiles = readdirSync('site/src/content/docs/getting-started').filter(name => name.endsWith('.mdx') && name !== 'index.mdx').map(name => 'site/src/content/docs/getting-started/' + name).sort()
  assert.equal(mdxFiles.length, 11)
  assert.deepEqual(Object.keys(policy.sources).filter(file => file.endsWith('.mdx')).sort(), mdxFiles)
  for (const [file, expected] of Object.entries(policy.sources)) assert.equal(sha(read(file)), expected, 'Unrecorded MDX transition change: ' + file)
  return policy
}

export function historicalDocumentationSource(file) {
  if (['site/src/data/getting-started-guides.ts', 'site/src/data/installation-guide.ts'].includes(file)) {
    const policy = assertGettingStartedMdx()
    return read(policy.historicalSources[file].snapshot)
  }
  return historicalComponentPresentationSource(file) ?? historicalFormsSource(file) ?? historicalLayoutContentSource(file) ?? historicalGuidesCustomizeSource(file) ?? historicalComponentOverlaySource(file) ?? historicalComponentAdaptiveSource(file) ?? historicalComponentMediaSource(file) ?? historicalComponentCompletionSource(file) ?? historicalHelpersSource(file) ?? historicalUtilitiesSource(file) ?? read(file)
}
