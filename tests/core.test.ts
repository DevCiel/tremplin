import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Collapse, Toast } from '../src/js/index'
import EventHandler from '../src/js/dom/event-handler.js'
import Manipulator from '../src/js/dom/manipulator.js'
import Selector from '../src/js/dom/selector-engine.js'
import { executeAfterTransition } from '../src/js/util/index'

beforeEach(() => {
  document.body.innerHTML = ''
  vi.useRealTimers()
})

describe('runtime configuration', () => {
  test('coerces data attributes and lets programmatic configuration win', async () => {
    // This assertion covers configured autohide timing, not animation. Use the
    // strict component's instant class and await its public shown lifecycle.
    document.body.innerHTML = '<div id="toast" class="toast toast-instant" data-trm-config=\'{"delay":20,"autohide":true}\' data-trm-delay="30"></div>'
    vi.useFakeTimers()
    const toast = new Toast('#toast', { delay: 40 })
    await toast.show()
    vi.advanceTimersByTime(35)
    expect(document.querySelector('#toast')?.classList.contains('show')).toBe(true)
    vi.advanceTimersByTime(6)
    expect(document.querySelector('#toast')?.classList.contains('show')).toBe(false)
    toast.dispose()
  })

  test('rejects invalid configured option types', () => {
    document.body.innerHTML = '<div id="toast" data-trm-delay="slow"></div>'
    expect(() => new Toast('#toast')).toThrow(/expected type "number"/)
  })

  test('normalizes data attribute values', () => {
    document.body.innerHTML = '<div id="item" data-trm-enabled="true" data-trm-count="4" data-trm-value="null"></div>'
    const item = document.querySelector<HTMLElement>('#item')!
    expect(Manipulator.getDataAttributes(item)).toMatchObject({ enabled: true, count: 4, value: null })
  })
})

describe('base component lifecycle', () => {
  test('publishes Bootstrap-style static metadata', () => {
    expect(Collapse.VERSION).toBe('0.8.0-beta.0')
    expect(Collapse.DATA_KEY).toBe('trm.collapse')
    expect(Collapse.EVENT_KEY).toBe('.trm.collapse')
    expect(Collapse.eventName('shown')).toBe('shown.trm.collapse')
  })

  test('removes namespaced listeners during disposal', () => {
    document.body.innerHTML = '<div id="panel"></div>'
    const element = document.querySelector('#panel')!
    const callback = vi.fn()
    EventHandler.on(element, 'click.trm.collapse', callback)
    const collapse = new Collapse(element)
    collapse.dispose()
    element.dispatchEvent(new MouseEvent('click'))
    expect(callback).not.toHaveBeenCalled()
  })
})

describe('DOM runtime helpers', () => {
  test('finds elements and walks matching parents', () => {
    document.body.innerHTML = '<main class="shell"><section><button class="action"></button></section></main>'
    const button = Selector.findOne<HTMLButtonElement>('.action')!
    expect(Selector.find('.action')).toHaveLength(1)
    expect(Selector.parents(button, '.shell')).toHaveLength(1)
  })

  test('can execute callbacks without waiting for animation', () => {
    const callback = vi.fn()
    const element = document.createElement('div')
    executeAfterTransition(callback, element, false)
    expect(callback).toHaveBeenCalledOnce()
  })
})
