import { withinMdxAudit } from './mdx-audit-context.mjs'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
const read = file => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
const sha = value => createHash('sha256').update(value).digest('hex')
const names = ['chip','command-palette','data-table','divider','empty-state','forms','status','table','timeline']
const historical = ['site/src/data/component-docs.ts','site/src/data/chip-table-docs.ts','site/src/data/local-pattern-docs.ts','site/src/data/forms-overview-docs.ts','site/src/data/sheet-command-docs.ts','site/src/data/component-api.ts','site/src/libs/component-mdx.ts','site/src/pages/components/[slug].astro']

export function assertComponentCompletionMdx() {
  return withinMdxAudit('component-completion', () => {
    const policy = JSON.parse(read('metadata/component-completion-mdx.json'))
    assert.equal(policy.phase, 'component-completion-authored-mdx')
    assert.deepEqual(policy.names, names)
    assert.deepEqual(policy.canonical, [])
    assert.deepEqual(policy.extensions, ['command-palette'])
    assert.equal(policy.remaining, 0)
    assert.deepEqual(Object.keys(policy.historicalSources).sort(), historical.toSorted())
    assert.equal(policy.previousPolicy.file, 'metadata/component-advanced-mdx.json')
    assert.equal(sha(read(policy.previousPolicy.file)), policy.previousPolicy.sha256, 'Earlier enhanced-input policy was refreshed')
    for (const entry of [...Object.values(policy.historicalSources), policy.expectation]) assert.equal(sha(read(entry.snapshot)), entry.sha256, 'Original completion evidence changed')
    const allNames = [...names], seen = new Set()
    let previous = policy.previousPolicy
    while (previous) {
      assert(!seen.has(previous.file), 'Cyclic component migration policy')
      seen.add(previous.file)
      const prior = JSON.parse(read(previous.file))
      allNames.push(...prior.names)
      previous = prior.previousPolicy
    }
    assert.equal(allNames.length, 47)
    assert.equal(new Set(allNames).size, 47)
    assert.deepEqual(readdirSync('site/src/content/docs/components').filter(file => file.endsWith('.mdx')).sort(), allNames.map(name => name + '.mdx').sort())
    assert.deepEqual(Object.keys(policy.sources).filter(file => file.endsWith('.mdx')).sort(), names.map(name => 'site/src/content/docs/components/' + name + '.mdx'))
    for (const [file, expected] of Object.entries(policy.sources)) assert.equal(sha(read(file)), expected, 'Unrecorded component completion change: ' + file)
    return policy
  })
}

export function historicalComponentCompletionSource(file) {
  if (!historical.includes(file)) return undefined
  const policy = assertComponentCompletionMdx()
  return read(policy.historicalSources[file].snapshot)
}
