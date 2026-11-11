import { existsSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import BaseComponent from '../src/js/base-component.js'
import { DefaultAllowlist, DefaultIconAllowlist, sanitizeHtml } from '../src/js/util/sanitizer'
import Swipe from '../src/js/util/swipe.js'
import TemplateFactory from '../src/js/util/template-factory'

beforeEach(() => { document.body.innerHTML = '' })
afterEach(() => { vi.unstubAllGlobals() })

describe('Bootstrap 6 utility structure', () => {
  test('uses root BaseComponent and has no transitional core directory', () => {
    expect(BaseComponent.VERSION).toBe('0.8.0-beta.0')
    expect(existsSync('src/js/core')).toBe(false)
    expect(existsSync('src/js/util/overlay-manager.ts')).toBe(false)
    for (const file of ['index.ts', 'sanitizer.ts', 'swipe.ts', 'template-factory.ts']) expect(existsSync(`src/js/util/${file}`)).toBe(true)
  })

  test('sanitizes dangerous markup and URLs', () => {
    const result = String(sanitizeHtml('<a href="javascript:alert(1)" onclick="alert(1)"><strong>Safe</strong></a><script>bad()</script>', DefaultAllowlist))
    expect(result).toContain('<strong>Safe</strong>')
    expect(result).not.toContain('javascript:')
    expect(result).not.toContain('onclick')
    expect(result).not.toContain('<script')
  })

  test('preserves safe inline icons while rejecting unsafe SVG content', () => {
    const result = String(sanitizeHtml('<svg viewBox="0 0 16 16" onload="alert(1)"><path d="M1 1h14v14z"></path><use href="external.svg#icon"></use></svg>', DefaultIconAllowlist))
    expect(result).toContain('<svg')
    expect(result).toContain('viewBox="0 0 16 16"')
    expect(result).toContain('<path')
    expect(result).not.toContain('onload')
    expect(result).not.toContain('<use')
  })

  test('validates srcset candidates', () => {
    const result = String(sanitizeHtml('<img srcset="safe.png 1x, javascript:alert(1) 2x">', DefaultAllowlist))
    expect(result).not.toContain('srcset')
  })

  test('hardens new-window links', () => {
    const result = String(sanitizeHtml('<a href="/safe" target="_blank">Safe</a>', DefaultAllowlist))
    expect(result).toContain('rel="noopener noreferrer"')
  })

  test('creates trusted HTML for template assignments when the platform requires it', () => {
    const createHTML = vi.fn((value: string) => ({ value, toString: () => value }))
    vi.stubGlobal('trustedTypes', { createPolicy: vi.fn(() => ({ createHTML })) })

    const template = new TemplateFactory({
      template: '<div><span class="value"></span></div>',
      content: { '.value': '<strong>Trusted</strong>' },
      html: true
    }).toHtml()

    expect(template.querySelector('strong')?.textContent).toBe('Trusted')
    expect(createHTML).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  test('builds sanitized component templates', () => {
    const template = new TemplateFactory({
      template: '<div class="tooltip"><div class="tooltip-inner"></div></div>',
      content: { '.tooltip-inner': '<img src=x onerror=alert(1)><strong>Hello</strong>' },
      html: true
    }).toHtml()
    expect(template.classList.contains('tooltip')).toBe(true)
    expect(template.querySelector('.tooltip-inner')?.innerHTML).toContain('<strong>Hello</strong>')
    expect(template.querySelector('.tooltip-inner')?.innerHTML).not.toContain('onerror')
  })

  test('updates template content with Bootstrap content validation', () => {
    const factory = new TemplateFactory({
      template: '<div><span class="value"></span></div>',
      content: { '.value': 'First' }
    })
    factory.changeContent({ '.value': () => 'Second' })
    expect(factory.toHtml().querySelector('.value')?.textContent).toBe('Second')
  })

  test('normalizes pointer swipes', () => {
    vi.stubGlobal('PointerEvent', MouseEvent)
    const maxTouchPoints = Object.getOwnPropertyDescriptor(navigator, 'maxTouchPoints')
    Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 1 })
    const element = document.createElement('div')
    const left = vi.fn()
    const swipe = new Swipe(element, { leftCallback: left })
    const start = new MouseEvent('pointerdown', { clientX: 100, clientY: 0, bubbles: true })
    const end = new MouseEvent('pointerup', { clientX: 20, clientY: 0, bubbles: true })
    Object.defineProperty(start, 'pointerType', { value: 'touch' })
    Object.defineProperty(end, 'pointerType', { value: 'touch' })
    element.dispatchEvent(start)
    element.dispatchEvent(end)
    expect(left).toHaveBeenCalledOnce()
    swipe.dispose()
    if (maxTouchPoints) Object.defineProperty(navigator, 'maxTouchPoints', maxTouchPoints)
    else Reflect.deleteProperty(navigator, 'maxTouchPoints')
    vi.unstubAllGlobals()
  })
})
