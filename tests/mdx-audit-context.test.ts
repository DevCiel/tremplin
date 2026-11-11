import { describe, expect, it } from 'vitest'
import { withinMdxAudit } from './tooling/lib/mdx-audit-context.mjs'

describe('synchronous MDX audit context', () => {
  it('shares completed nested validation only until its owning audit finishes', () => {
    let checks = 0
    const child = () => withinMdxAudit('child', () => ++checks)
    expect(withinMdxAudit('parent', () => [child(), child()])).toEqual([1, 1])
    expect(checks).toBe(1)
    expect(child()).toBe(2)
    expect(child()).toBe(3)
  })
  it('discards validation results after failure and does not cache a failed check', () => {
    let checks = 0
    const fail = () => withinMdxAudit('child', () => { checks++; throw new Error('invalid policy') })
    expect(() => withinMdxAudit('parent', fail)).toThrow('invalid policy')
    expect(() => fail()).toThrow('invalid policy')
    expect(checks).toBe(2)
    expect(withinMdxAudit('parent', () => 'fresh audit')).toBe('fresh audit')
  })
})
