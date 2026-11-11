import { readFileSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import postcss from 'postcss'
import policy from '../metadata/asset-retirement.json'

const read = (file: string) => readFileSync(file, 'utf8')
const core = read('dist/css/tremplin.css')
const extensions = read('artifacts/documentation-assets/dist/css/tremplin-extensions.css')
const definitions = (css: string) => {
  const result = new Set<string>()
  postcss.parse(css).walkDecls(declaration => { if (declaration.prop.startsWith('--trm-')) result.add(declaration.prop) })
  return result
}
const coreTokens = definitions(core)

describe('First-party strict asset cleanup', () => {
  it('removes the obsolete runtime, palette shim, build configurations and standalone page', () => {
    for (const file of [...policy.sourceTargets, ...policy.generatedTargets]) expect(existsSync(file), file).toBe(false)
  })
  it('retains all pinned core tokens and removes only non-core legacy fallbacks', () => {
    for (const token of policy.retiredCssTokens) {
      expect(coreTokens.has(token), token).toBe(false)
      expect(extensions).not.toMatch(new RegExp(token + '(?=\\s*[,):;])'))
    }
    expect(coreTokens.has('--trm-secondary-base')).toBe(true)
    expect(coreTokens.has('--trm-secondary-contrast')).toBe(true)
    const api = JSON.parse(read('metadata/public-api.json'))
    for (const token of coreTokens) expect(api.css.customProperties, token).toContain(token)
  })
  it('resolves default optional styles entirely through current core or component tokens', () => {
    const known = new Set([...coreTokens, ...definitions(extensions)])
    for (const match of extensions.matchAll(/var\((--trm-[\w-]+)/g)) {
      if (known.has(match[1]!)) continue
      // Ratio intentionally exposes an optional caller input with a literal
      // default; it is not a missing legacy global or a compatibility alias.
      expect(match[1]).toBe('--trm-aspect-ratio')
      expect(extensions).toContain('var(--trm-aspect-ratio, 56.25%)')
    }
  })
  it.each(['ocean', 'forest'])('keeps the %s preset on current declared tokens', preset => {
    const css = read('themes/tremplin-' + preset + '.css')
    for (const token of definitions(css)) expect(coreTokens.has(token), token).toBe(true)
    for (const token of policy.retiredCssTokens) expect(css).not.toMatch(new RegExp(token + '(?=\\s*[,):;])'))
  })
  it('documents the exact legacy retirement without changing JS or Sass APIs', () => {
    const record = JSON.parse(read('metadata/retired-css-contract.json'))
    expect(record.removedCssCustomProperties).toHaveLength(15)
    expect(record.addedRuntimeFeatures).toEqual([])
    for (const token of record.existingGeneratedCorePropertiesAddedToInventory) expect(coreTokens.has(token), token).toBe(true)
    expect(JSON.parse(read('package.json')).tremplinMigration.releaseBlocked).toBe(true)
  })
})
