import { afterEach, describe, expect, it, vi } from 'vitest'
import { DefaultAllowlist, sanitizeHtml, sanitizeHtmlForSink, setElementHtml } from '../src/js/util/sanitizer.js'

afterEach(() => { vi.unstubAllGlobals() })

const factory = () => {
  const createHTML = vi.fn((value: string) => ({ toString: () => value }))
  return { createHTML, createPolicy: vi.fn((_name: string, _rules: { createHTML(input: string): string }) => ({ createHTML })) }
}

describe('SEC-001 sanitizer hardening', () => {
  it('keeps the existing string API even when Trusted Types is available', () => {
    const types = factory()
    vi.stubGlobal('trustedTypes', types)
    const result = sanitizeHtml('<strong onclick="bad()">Safe</strong>', DefaultAllowlist)
    expect(typeof result).toBe('string')
    expect(result).toBe('<strong>Safe</strong>')
    expect(types.createPolicy).toHaveBeenCalledWith('tremplin', expect.any(Object))
  })

  it('mints live-sink tokens only after removing disallowed markup', () => {
    const types = factory()
    vi.stubGlobal('trustedTypes', types)
    const result = sanitizeHtmlForSink('<img onerror="bad()"><script>bad()</script><strong>Safe</strong>', DefaultAllowlist)
    expect(String(result)).toContain('<strong>Safe</strong>')
    expect(String(result)).not.toMatch(/onerror|<script/)
    expect(types.createHTML.mock.calls.at(-1)?.[0]).toBe(String(result))
    expect(types.createPolicy).toHaveBeenCalledTimes(1)
    expect((globalThis as any)[Symbol.for('tremplin.trusted-types-policy')]).toBeUndefined()
  })

  it('caches policy capabilities per factory, never in a global default policy', () => {
    const first = factory(), second = factory()
    vi.stubGlobal('trustedTypes', first)
    sanitizeHtmlForSink('<b>One</b>', DefaultAllowlist)
    sanitizeHtmlForSink('<b>Two</b>', DefaultAllowlist)
    vi.stubGlobal('trustedTypes', second)
    sanitizeHtmlForSink('<b>Three</b>', DefaultAllowlist)
    expect(first.createPolicy).toHaveBeenCalledTimes(1)
    expect(second.createPolicy).toHaveBeenCalledTimes(1)
    expect(first.createPolicy.mock.calls[0]?.[0]).toBe('tremplin')
    expect(second.createPolicy.mock.calls[0]?.[0]).toBe('tremplin')
  })

  it('does not retry with a permissive fallback when named-policy creation fails', () => {
    const createPolicy = vi.fn(() => { throw new TypeError('Policy denied') })
    vi.stubGlobal('trustedTypes', { createPolicy })
    expect(() => sanitizeHtmlForSink('<b>Safe</b>', DefaultAllowlist)).toThrow('Policy denied')
    expect(createPolicy).toHaveBeenCalledTimes(1)
  })

  it('does not turn a raw sink assignment into a trusted token', () => {
    const types = factory()
    vi.stubGlobal('trustedTypes', types)
    setElementHtml(document.createElement('div'), '<b>Raw</b>')
    // jsdom does not enforce Trusted Types, but the helper must never call the
    // policy to bless this input. Actual enforcement is checked in Chromium.
    expect(types.createPolicy).not.toHaveBeenCalled()
  })

  it('checks every srcset candidate while retaining safe relative and HTTP URLs', () => {
    expect(sanitizeHtml('<img srcset="a.png 1x, https://example.test/b.png 2x">', DefaultAllowlist)).toContain('srcset=')
    for (const value of ['a.png 1x, javascript:alert(1) 2x', 'data:image/png;base64,AAAA 1x', 'a.png 1x, vbscript:bad 2x', 'a.png 1x,']) {
      expect(sanitizeHtml(`<img srcset="${value}">`, DefaultAllowlist)).not.toContain('srcset=')
    }
    expect(sanitizeHtml('<img src="data:image/png;base64,AAAA">', DefaultAllowlist)).toContain('src=')
  })

  it('applies URL protection even when a custom regex permits the attribute', () => {
    const allowlist = { ...DefaultAllowlist, a: [/^href$/, 'target'], img: [/^srcset$/] }
    expect(sanitizeHtml('<a href="javascript:bad">Bad</a><img srcset="a.png 1x, javascript:bad 2x">', allowlist)).not.toMatch(/href=|srcset=/)
  })

  it('preserves useful rel tokens, removes opener, and handles mixed-case targets', () => {
    const html = sanitizeHtml('<a href="/safe" target="_BLANK" rel="OPENER NoFollow NOOPENER">Safe</a>', DefaultAllowlist)
    expect(html).toContain('rel="nofollow noopener noreferrer"')
    const link = new DOMParser().parseFromString(html, 'text/html').querySelector('a')!
    expect(link.rel.split(' ')).not.toContain('opener')
  })
})
