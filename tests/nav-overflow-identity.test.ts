import { afterEach, describe, expect, it, vi } from 'vitest'
import NavOverflow from '../src/js/nav-overflow.js'

const instances: NavOverflow[] = []
afterEach(() => {
  for (const instance of instances.splice(0)) instance.dispose()
  document.body.replaceChildren()
})

function create(submenu = false) {
  const host = document.createElement('nav')
  host.innerHTML = `<ul class="nav"><li class="nav-item"><a id="original-link" class="nav-link" href="#outside" aria-labelledby="label.one label:two outside" aria-describedby="description" ${submenu ? 'data-trm-toggle="menu"' : ''}>
    <span id="label.one">Project</span><span id="label:two">settings</span><span id="description">Description</span>
    <svg aria-labelledby="icon-title"><title id="icon-title">Settings icon</title><defs><linearGradient id="paint"><stop offset="0"/></linearGradient><clipPath id="clip"><path/></clipPath></defs><path fill="url(#paint)" clip-path="url('#clip')" style="filter: url( &quot;#clip&quot; );stroke:url(#external-paint)"/><use href="#paint" xlink:href="#clip" xmlns:xlink="http://www.w3.org/1999/xlink"/></svg>
  </a>${submenu ? '<div id="original-menu" class="menu"><a class="menu-item" href="#outside">Nested</a></div>' : ''}</li></ul>`
  document.body.append(host)
  const original = host.querySelector<HTMLElement>('.nav-link')!
  const before = original.innerHTML
  const instance = new NavOverflow(host, { collapseBelow: 2000 })
  instances.push(instance)
  const clone = () => host.querySelector<HTMLElement>('.nav-overflow-menu .menu-item')!
  return { host, original, before, instance, clone }
}

describe('A11Y-001: NavOverflow clone identity', () => {
  it('remaps descendant IDs and multi-token ARIA references without changing originals', () => {
    const { original, before, clone } = create()
    const copy = clone()
    expect(copy.hasAttribute('id')).toBe(false)
    expect(original.innerHTML).toBe(before)
    const ids = [...document.querySelectorAll('[id]')].map(node => node.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(copy.getAttribute('aria-labelledby')?.split(' ')).toEqual([copy.querySelectorAll('span')[0]!.id, copy.querySelectorAll('span')[1]!.id, 'outside'])
    expect(copy.getAttribute('aria-describedby')).toBe(copy.querySelectorAll('span')[2]!.id)
    expect(copy.querySelector('svg')?.getAttribute('aria-labelledby')).toBe(copy.querySelector('title')!.id)
    expect(copy.getAttribute('href')).toBe('#outside')
  })

  it('rewrites local SVG fragment and CSS URL references, leaving external targets alone', () => {
    const { clone } = create()
    const copy = clone(), paint = copy.querySelector('linearGradient')!.id, clip = copy.querySelector('clipPath')!.id
    const path = copy.querySelector('svg > path')!
    expect(path.getAttribute('fill')).toBe(`url(#${paint})`)
    expect(path.getAttribute('clip-path')).toBe(`url('#${clip}')`)
    expect(path.getAttribute('style')).toBe(`filter: url( "#${clip}" );stroke:url(#external-paint)`)
    expect(copy.querySelector('use')?.getAttribute('href')).toBe(`#${paint}`)
    expect(copy.querySelector('use')?.getAttribute('xlink:href')).toBe(`#${clip}`)
  })

  it('handles HTML ID references and preserves full URLs and unrelated attribute text', () => {
    const { original, instance, clone } = create()
    const refs = 'aria-controls aria-owns aria-flowto aria-activedescendant aria-details aria-errormessage for headers list form popovertarget commandfor'
    for (const name of refs.split(' ')) original.setAttribute(name, 'label.one outside')
    original.setAttribute('href', '/page#label.one')
    original.setAttribute('data-example', 'label.one url(#paint)')
    instance.update()
    const copy = clone()
    for (const name of refs.split(' ')) expect(copy.getAttribute(name)).toBe(`${copy.querySelector('span')!.id} outside`)
    expect(copy.getAttribute('href')).toBe('/page#label.one')
    expect(copy.getAttribute('data-example')).toBe('label.one url(#paint)')
  })

  it('handles repeated updates and deterministic random values without duplicate IDs', () => {
    const { instance, clone, original } = create()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    for (let i = 0; i < 3; i++) {
      instance.update()
      const ids = [...document.querySelectorAll('[id]')].map(node => node.id)
      expect(new Set(ids).size).toBe(ids.length)
      expect(clone().getAttribute('aria-describedby')).toBe(clone().querySelectorAll('span')[2]!.id)
      expect(original.querySelector('span')!.id).toBe('label.one')
    }
  })

  it('preserves relocated submenu nodes and original IDs on disposal', () => {
    const { instance, original, before, host, clone } = create(true)
    const menu = document.getElementById('original-menu')!
    expect(clone().hasAttribute('href')).toBe(false)
    expect(clone().getAttribute('aria-labelledby')).not.toContain('label.one')
    expect(host.querySelector('.submenu > .menu')).toBe(menu)
    instances.splice(instances.indexOf(instance), 1)
    instance.dispose()
    expect(original.innerHTML).toBe(before)
    expect(original.nextElementSibling).toBe(menu)
    expect(host.querySelector('.nav-overflow-menu')).toBeNull()
  })

  it('keeps IDs unique across separate instances and an existing generated-ID collision', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    document.body.innerHTML = '<span id="trm-nav-0-0"></span>'
    for (const prefix of ['first', 'second']) {
      const host = document.createElement('nav')
      host.innerHTML = `<ul class="nav"><li class="nav-item"><a class="nav-link" aria-labelledby="${prefix}" href="#${prefix}"><span id="${prefix}">${prefix}</span></a></li></ul>`
      document.body.append(host)
      instances.push(new NavOverflow(host, { collapseBelow: 2000 }))
      const copy = host.querySelector('.menu-item')!
      expect(copy.getAttribute('aria-labelledby')).toBe(copy.querySelector('span')!.id)
      expect(copy.getAttribute('href')).toBe(`#${copy.querySelector('span')!.id}`)
    }
    const ids = [...document.querySelectorAll('[id]')].map(node => node.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
