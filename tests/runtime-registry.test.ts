import { describe, expect, it, vi } from 'vitest'
import { claimRuntime } from '../src/runtime/registry'

describe('Single current distribution per document', () => {
  it('permits idempotent claims by the same module and seals its ownership', () => {
    const root = document.implementation.createHTMLDocument()
    const owner = Symbol('current-module')
    claimRuntime('strict-6', 'test', owner, root)
    expect(() => claimRuntime('strict-6', 'test', owner, root)).not.toThrow()
    expect(Object.getOwnPropertyDescriptor(root, Symbol.for('tremplin.framework.runtime'))?.configurable).toBe(false)
  })
  it('rejects duplicate module copies and different versions', () => {
    const root = document.implementation.createHTMLDocument()
    const owner = Symbol('first')
    claimRuntime('strict-6', 'test', owner, root)
    expect(() => claimRuntime('strict-6', 'test', Symbol('second'), root)).toThrow(/duplicate bundles/)
    expect(() => claimRuntime('strict-6', 'other', owner, root)).toThrow(/runtime conflict/)
  })
  it('isolates documents and allows SSR without a document', () => {
    for (let index = 0; index < 2; index++) expect(() => claimRuntime('strict-6', 'test', Symbol(), document.implementation.createHTMLDocument())).not.toThrow()
    vi.stubGlobal('document', undefined)
    try { expect(() => claimRuntime('strict-6', 'test', Symbol())).not.toThrow() }
    finally { vi.unstubAllGlobals() }
  })
})
