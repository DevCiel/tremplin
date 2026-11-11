import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { withinMdxAudit } from './mdx-audit-context.mjs'
import { historicalUtilitiesSource } from './utilities-mdx.mjs'
const read = file => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
const sha = value => createHash('sha256').update(value).digest('hex')
const historical = ['site/src/data/helpers-guides.ts', 'site/src/libs/mdx-guides.ts', 'site/src/components/GuideScripts.astro']

export function assertHelpersMdx() {
  return withinMdxAudit('helpers-mdx', () => {
    const policy = JSON.parse(read('metadata/helpers-mdx.json'))
    assert.equal(policy.phase, 'helpers-authored-mdx')
    assert.equal(policy.guides, 9)
    assert.equal(policy.remaining, 48)
    assert.equal(sha(read(policy.previousPolicy.file)), policy.previousPolicy.sha256, 'Previous component policy changed')
    assert.deepEqual(Object.keys(policy.historicalSources).sort(), historical.toSorted())
    for (const entry of [...Object.values(policy.historicalSources), policy.expectation]) assert.equal(sha(read(entry.snapshot)), entry.sha256, 'Historical Helpers evidence changed')
    const files = readdirSync('site/src/content/docs/helpers').filter(file => file.endsWith('.mdx')).map(file => 'site/src/content/docs/helpers/' + file).sort()
    assert.equal(files.length, 9)
    assert.deepEqual(Object.keys(policy.sources).filter(file => file.endsWith('.mdx')).sort(), files)
    for (const [file, expected] of Object.entries(policy.sources)) assert.equal(sha(historicalUtilitiesSource(file) ?? read(file)), expected, 'Unrecorded Helpers migration change: ' + file)
    return policy
  })
}

export function historicalHelpersSource(file) {
  if (!historical.includes(file)) return undefined
  return read(assertHelpersMdx().historicalSources[file].snapshot)
}
