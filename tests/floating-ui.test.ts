import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  BREAKPOINTS,
  createBreakpointListeners,
  disposeBreakpointListeners,
  getDefaultPlacement,
  getResponsivePlacement,
  parseResponsivePlacement,
  toFloatingOffset
} from '../src/js/util/floating-ui'

beforeEach(() => {
  document.documentElement.removeAttribute('dir')
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Bootstrap 6 Floating UI helpers', () => {
  test('uses the Bootstrap breakpoints', () => {
    expect(BREAKPOINTS).toEqual({ sm: 576, md: 768, lg: 1024, xl: 1280, '2xl': 1536 })
  })

  test('flips logical alignment in RTL', () => {
    expect(getDefaultPlacement('bottom-start')).toBe('bottom-start')
    document.documentElement.dir = 'rtl'
    expect(getDefaultPlacement('bottom-start')).toBe('bottom-end')
    expect(getDefaultPlacement('left')).toBe('left')
  })

  test('parses and resolves responsive placements', () => {
    const placements = parseResponsivePlacement('bottom-start md:top-end lg:right')
    expect(placements).toEqual({ xs: 'bottom-start', md: 'top-end', lg: 'right' })
    expect(parseResponsivePlacement('bottom-start')).toBeNull()

    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1100)
    expect(getResponsivePlacement(placements)).toBe('right')
    expect(getResponsivePlacement(null, 'top')).toBe('top')
  })

  test('creates and disposes one listener per breakpoint', () => {
    const addEventListener = vi.fn()
    const removeEventListener = vi.fn()
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener,
      removeEventListener,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    })))
    const callback = vi.fn()
    const listeners = createBreakpointListeners(callback)
    expect(listeners).toHaveLength(Object.keys(BREAKPOINTS).length)
    expect(addEventListener).toHaveBeenCalledTimes(Object.keys(BREAKPOINTS).length)
    disposeBreakpointListeners(listeners)
    expect(removeEventListener).toHaveBeenCalledTimes(Object.keys(BREAKPOINTS).length)
  })

  test('converts tuple offsets to Floating UI axes', () => {
    expect(toFloatingOffset([4, 8])).toEqual({ mainAxis: 8, crossAxis: 4 })
    expect(toFloatingOffset(6)).toBe(6)
    expect(toFloatingOffset({ mainAxis: 3 })).toEqual({ mainAxis: 3 })
  })
})
