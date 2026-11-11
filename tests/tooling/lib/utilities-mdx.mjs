import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { withinMdxAudit } from './mdx-audit-context.mjs'
const read = file => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
const sha = text => createHash('sha256').update(text).digest('hex')
export function assertUtilitiesMdx() {
  return withinMdxAudit('utilities-mdx', () => {
    const policy = JSON.parse(read('metadata/utilities-mdx.json'))
    assert.equal(policy.phase, 'utilities-authored-mdx'); assert.equal(policy.guides, 48); assert.equal(policy.remaining, 0)
    assert.equal(policy.previousPolicy.file, 'metadata/helpers-mdx.json')
    assert.equal(sha(read(policy.previousPolicy.file)), policy.previousPolicy.sha256, 'Earlier Helpers policy changed')
    for (const entry of [...Object.values(policy.historicalSources), ...Object.values(policy.expectations)]) assert.equal(sha(read(entry.snapshot)), entry.sha256, 'Historical Utilities evidence changed')
    const files = readdirSync('site/src/content/docs/utilities').filter(file => file.endsWith('.mdx')).map(file => 'site/src/content/docs/utilities/' + file).sort()
    assert.equal(files.length, 49)
    assert.deepEqual(Object.keys(policy.sources).filter(file => file.endsWith('.mdx')).sort(), files)
    for (const file of policy.removed) assert.equal(existsSync(file), false, 'Retired structured renderer restored')
    for (const [file, expected] of Object.entries(policy.sources)) assert.equal(sha(read(file)), expected, 'Unrecorded Utilities migration change: ' + file)
    return policy
  })
}
export function historicalUtilitiesSource(file) {
  const policy = JSON.parse(read('metadata/utilities-mdx.json'))
  if (!Object.hasOwn(policy.historicalSources, file)) return undefined
  return read(assertUtilitiesMdx().historicalSources[file].snapshot)
}
