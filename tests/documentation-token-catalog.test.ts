/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import catalog from '../metadata/documentation-tokens.json'
import reference from '../metadata/bootstrap6-reference.json'
import { componentDetails } from '../site/src/data/component-docs'
import { additionalComponentDetails } from '../site/src/data/component-reference'
import { documentedTokenNames } from '../site/src/data/documented-tokens'

describe('Evaluated documentation token catalog', () => {
  it('records the pinned reference and source hashes for every documented topic', () => {
    expect(catalog.referenceCommit).toBe(reference.commit)
    expect(catalog.format).toBe('tremplin-documentation-token-maps-v1')
    for (const name of [...Object.keys(componentDetails), ...Object.keys(additionalComponentDetails)]) expect(Object.keys(catalog.components)).toContain(name)
    for (const component of Object.values(catalog.components)) {
      for (const source of component.sources) expect(createHash('sha256').update(readFileSync(source.path)).digest('hex'), source.path).toBe(source.sha256)
      expect(new Set(component.variables.map(variable => variable.name)).size).toBe(component.variables.length)
    }
  })

  it('rejects invented documentation names instead of accepting arbitrary var() references', () => {
    for (const name of Object.keys(componentDetails)) expect(documentedTokenNames(name).has('--trm-made-up-token')).toBe(false)
    expect(documentedTokenNames('close-button').has('--trm-btn-close-icon')).toBe(true)
    expect(documentedTokenNames('close-button').has('--trm-focus-color')).toBe(false)
    expect(documentedTokenNames('forms').has('--trm-control-border-radius')).toBe(true)
    expect(documentedTokenNames('drawer').has('--trm-drawer-backdrop-opacity')).toBe(false)
    expect(catalog.components.drawer.unemittedVariables.map(variable => variable.name)).toContain('--trm-drawer-backdrop-opacity')
  })

  it('recompiles Sass and checks the catalog without refreshing it', () => {
    const before = readFileSync('metadata/documentation-tokens.json', 'utf8')
    expect(execFileSync(process.execPath, ['tests/tooling/generate-documentation-tokens.mjs', '--check'], { encoding: 'utf8', windowsHide: true })).toContain('Verified evaluated Sass token maps')
    expect(readFileSync('metadata/documentation-tokens.json', 'utf8')).toBe(before)
  }, 15_000)
})
