import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { historicalLayoutContentSource } from './layout-content-mdx.mjs'
const read = file => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
const sha = value => createHash('sha256').update(value).digest('hex')

/** Keep historical prose evidence immutable; verify the separate authored-source move. */
export function assertGuidesCustomizeMdx() {
  const policy = JSON.parse(read('metadata/guides-customize-mdx.json'))
  assert.equal(policy.phase, 'guides-customize-authored-mdx')
  assert.deepEqual(policy.groups, { guides: 7, customize: 11 })
  assert.deepEqual(Object.keys(policy.historicalSources).sort(), ['site/src/data/customize-guides.ts', 'site/src/data/workflow-guides.ts'])
  for (const entry of Object.values(policy.historicalSources)) assert.equal(sha(read(entry.snapshot)), entry.sha256, 'Historical guide source changed')
  for (const [group, count] of Object.entries(policy.groups)) {
    const files = readdirSync('site/src/content/docs/' + group).filter(name => name.endsWith('.mdx') && name !== 'index.mdx').map(name => 'site/src/content/docs/' + group + '/' + name).sort()
    assert.equal(files.length, count)
    assert.deepEqual(Object.keys(policy.sources).filter(file => file.startsWith('site/src/content/docs/' + group + '/')).sort(), files)
  }
  for (const [file, expected] of Object.entries(policy.sources)) assert.equal(sha(historicalLayoutContentSource(file) ?? read(file)), expected, 'Unrecorded guide migration change: ' + file)
  return policy
}

export function historicalGuidesCustomizeSource(file) {
  if (!['site/src/data/workflow-guides.ts', 'site/src/data/customize-guides.ts'].includes(file)) return undefined
  const policy = assertGuidesCustomizeMdx()
  return read(policy.historicalSources[file].snapshot)
}
