import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Collapse } from '../src/js/index'
import Data from '../src/js/dom/data.js'
import EventHandler, { type TremplinEvent } from '../src/js/dom/event-handler.js'
import SelectorEngine from '../src/js/dom/selector-engine.js'
import * as TremplinEntry from '../src/js/index'

beforeEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks() })

describe('Bootstrap 6-style DOM contracts', () => {
  test('delegates namespaced events and removes the namespace', () => {
    document.body.innerHTML = '<div id="root"><button class="action"><span>Run</span></button></div>'
    const root = document.querySelector('#root')!
    let delegateTarget: Element | undefined
    const handler = vi.fn((event: TremplinEvent) => { delegateTarget = event.delegateTarget })
    EventHandler.on(root, 'click.trm.test', '.action', handler)
    document.querySelector('span')!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(handler).toHaveBeenCalledOnce()
    expect(delegateTarget).toBe(document.querySelector('.action'))
    EventHandler.off(root, '.trm.test')
    document.querySelector('span')!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(handler).toHaveBeenCalledOnce()
  })

  test('supports one-time handlers, duplicate suppression, and hydrated events', () => {
    const element = document.createElement('button')
    const once = vi.fn()
    const duplicate = vi.fn()
    EventHandler.one(element, 'click.trm.once', once)
    EventHandler.on(element, 'click.trm.duplicate', duplicate)
    EventHandler.on(element, 'click.trm.duplicate', duplicate)
    element.click(); element.click()
    expect(once).toHaveBeenCalledOnce()
    expect(duplicate).toHaveBeenCalledTimes(2)
    const event = EventHandler.trigger(element, 'custom.trm.test', { answer: 42 })
    expect(event?.answer).toBe(42)
  })

  test('uses an export-only main entry with component-owned data APIs', () => {
    expect('Tremplin' in TremplinEntry).toBe(false)
    document.body.innerHTML = '<button id="button" data-trm-toggle="button" aria-pressed="false"></button>'
    const button = document.querySelector<HTMLButtonElement>('#button')!
    button.click()
    expect(button.classList.contains('active')).toBe(true)
  })

  test('resolves full URL fragments, class targets, siblings, and multiple targets', () => {
    document.body.innerHTML = '<a id="trigger" href="https://example.test/page#panel"></a><div id="panel" class="target"></div><div class="target"></div>'
    const trigger = document.querySelector('#trigger')!
    trigger.setAttribute('data-trm-target', '.target')
    expect(SelectorEngine.getMultipleElementsFromSelector(trigger)).toHaveLength(2)
    expect(SelectorEngine.next(trigger, '.target')).toHaveLength(1)
    trigger.removeAttribute('data-trm-target')
    expect(SelectorEngine.getElementFromSelector(trigger)?.id).toBe('panel')
  })

  test('exposes static defaults and replaces an existing instance cleanly', () => {
    document.body.innerHTML = '<div id="panel" class="collapse"></div>'
    const first = new Collapse('#panel')
    const second = new Collapse('#panel')
    expect(Collapse.Default).toEqual({ parent: null })
    expect(Collapse.getInstance('#panel')).toBe(second)
    expect(Data.get(document.querySelector('#panel'), Collapse.DATA_KEY)).toBe(second)
    expect(first).not.toBe(second)
  })

  test('keeps different component keys on one element and removes only the requested owner', () => {
    const element = document.createElement('div')
    const first = {}, second = {}
    Data.set(element, 'trm.first', first)
    Data.set(element, 'trm.second', second)
    expect(Data.get(element, 'trm.first')).toBe(first)
    expect(Data.get(element, 'trm.second')).toBe(second)
    Data.remove(element, 'trm.first')
    expect(Data.get(element, 'trm.first')).toBeNull()
    expect(Data.get(element, 'trm.second')).toBe(second)
    Data.remove(element, 'trm.second')
    expect(Data.get(element, 'trm.second')).toBeNull()
    expect('getAny' in Data).toBe(false)
  })

  test('returns promises from transition lifecycle methods', async () => {
    document.body.innerHTML = '<div id="panel" class="collapse"></div>'
    const collapse = new Collapse('#panel')
    await expect(collapse.show()).resolves.toBeUndefined()
    await expect(collapse.hide()).resolves.toBeUndefined()
  })
})

