import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { historicalFormsSource } from './forms-mdx.mjs'
const read = file => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
const sha = value => createHash('sha256').update(value).digest('hex')

/** Keep historical prose evidence immutable; verify the separate authored-source move. */
export function assertLayoutContentMdx() {
  const policy = JSON.parse(read('metadata/layout-content-mdx.json'))
  assert.equal(policy.phase, 'layout-content-authored-mdx')
  assert.deepEqual(policy.groups, { layout: 8, content: 5 })
  assert.deepEqual(Object.keys(policy.historicalSources).sort(), ['site/src/data/content-guides.ts', 'site/src/data/layout-guides.ts', 'site/src/libs/mdx-guides.ts'])
  for (const entry of Object.values(policy.historicalSources)) assert.equal(sha(read(entry.snapshot)), entry.sha256, 'Historical guide source changed')
  for (const [group, count] of Object.entries(policy.groups)) {
    const files = readdirSync('site/src/content/docs/' + group).filter(name => name.endsWith('.mdx') && name !== 'index.mdx').map(name => 'site/src/content/docs/' + group + '/' + name).sort()
    assert.equal(files.length, count)
    assert.deepEqual(Object.keys(policy.sources).filter(file => file.startsWith('site/src/content/docs/' + group + '/')).sort(), files)
  }
  for (const [file, expected] of Object.entries(policy.sources)) assert.equal(sha(historicalFormsSource(file) ?? read(file)), expected, 'Unrecorded guide migration change: ' + file)
  return policy
}

export function historicalLayoutContentSource(file) {
  if (!['site/src/data/layout-guides.ts', 'site/src/data/content-guides.ts', 'site/src/libs/mdx-guides.ts'].includes(file)) return undefined
  const policy = assertLayoutContentMdx()
  return read(policy.historicalSources[file].snapshot)
}
