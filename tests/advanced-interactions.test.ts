import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Carousel, Menu, ScrollSpy } from '../src/js/index'

beforeEach(() => {
  document.body.innerHTML = ''
  document.documentElement.style.removeProperty('overflow')
  document.documentElement.removeAttribute('dir')
  vi.useRealTimers()
})

describe('Carousel', () => {
  test('moves through slides, wraps, updates indicators, and emits lifecycle metadata', () => {
    document.body.innerHTML = '<div id="carousel" class="carousel carousel-fade"><div class="carousel-inner"><div class="carousel-item active">One</div><div class="carousel-item">Two</div><div class="carousel-item">Three</div></div><div class="carousel-indicators"><button class="active" data-trm-slide-to="0"></button><button data-trm-slide-to="1"></button><button data-trm-slide-to="2"></button></div></div>'
    const root = document.querySelector<HTMLElement>('#carousel')!
    let destination = -1
    root.addEventListener('slid.trm.carousel', event => { destination = (event as Event & { to: number }).to })
    const carousel = new Carousel(root)
    carousel.next()
    expect(root.querySelectorAll('.carousel-item')[1]?.classList.contains('active')).toBe(true)
    expect(root.querySelectorAll('[data-trm-slide-to]')[1]?.getAttribute('aria-current')).toBe('true')
    expect(destination).toBe(1)
    carousel.to(0)
    carousel.prev()
    expect(root.querySelectorAll('.carousel-item')[2]?.classList.contains('active')).toBe(true)
  })

  test('supports keyboard navigation and timed cycling', () => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="carousel" class="carousel carousel-fade"><div class="carousel-inner"><div class="carousel-item active">One</div><div class="carousel-item">Two</div></div></div>'
    const root = document.querySelector<HTMLElement>('#carousel')!
    root.getClientRects = () => [{ width: 10, height: 10 }] as unknown as DOMRectList
    const carousel = new Carousel(root, { interval: 100 })
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(root.querySelectorAll('.carousel-item')[1]?.classList.contains('active')).toBe(true)
    carousel.cycle()
    vi.advanceTimersByTime(101)
    expect(root.querySelectorAll('.carousel-item')[0]?.classList.contains('active')).toBe(true)
    carousel.dispose()
  })

  test('supports Bootstrap 6 ends, per-slide timing, and play/pause state', () => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="carousel" class="carousel carousel-fade"><div class="carousel-inner"><div class="carousel-item active" data-trm-interval="25">One</div><div class="carousel-item">Two</div></div><button class="carousel-control-prev" data-trm-slide="prev"></button><button class="carousel-control-next" data-trm-slide="next"></button><button class="carousel-control-play-pause" data-trm-pause-label="Pause slides" data-trm-play-label="Play slides"><span class="carousel-icon-pause"></span><span class="carousel-icon-play"></span></button></div>'
    const root = document.querySelector<HTMLElement>('#carousel')!
    root.getClientRects = () => [{ width: 10, height: 10 }] as unknown as DOMRectList
    const carousel = new Carousel(root, { autoplay: true, ends: 'stop', interval: 100 })
    const previous = root.querySelector<HTMLButtonElement>('.carousel-control-prev')!
    const next = root.querySelector<HTMLButtonElement>('.carousel-control-next')!
    const playPause = root.querySelector<HTMLElement>('.carousel-control-play-pause')!

    expect(previous.disabled).toBe(true)
    expect(next.disabled).toBe(false)
    expect(root.style.getPropertyValue('--trm-carousel-interval')).toBe('25ms')
    expect(root.classList.contains('carousel-playing')).toBe(true)
    expect(playPause.getAttribute('aria-label')).toBe('Pause slides')

    carousel.to(1)
    expect(next.disabled).toBe(true)
    carousel.next()
    expect(root.querySelectorAll('.carousel-item')[1]?.classList.contains('active')).toBe(true)

    carousel._togglePlayPause()
    expect(root.classList.contains('carousel-playing')).toBe(false)
    expect(playPause.classList.contains('paused')).toBe(true)
    expect(playPause.getAttribute('aria-label')).toBe('Play slides')
    carousel.dispose()
  })
})

describe('Menu', () => {
  test('uses Bootstrap keyboard and submenu navigation', async () => {
    document.body.innerHTML = '<button id="toggle" data-trm-toggle="menu">Open</button><div class="menu"><button class="menu-item">Alpha</button><div class="submenu"><button class="menu-item">More</button><div class="menu"><button class="menu-item">Nested</button></div></div><button class="menu-item">Zulu</button></div>'
    const menu = new Menu('#toggle')
    document.querySelectorAll<HTMLElement>('.menu-item').forEach(item => {
      item.getClientRects = () => [{ width: 10, height: 10 }] as unknown as DOMRectList
    })
    menu.show()
    expect(document.querySelector(':scope .menu')?.classList.contains('show')).toBe(true)
    expect(document.querySelector('#toggle')?.getAttribute('aria-expanded')).toBe('true')
    document.querySelector('#toggle')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
    expect(document.activeElement?.textContent).toBe('Zulu')
    document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
    expect(document.activeElement?.textContent).toBe('Alpha')
    document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await new Promise(resolve => requestAnimationFrame(resolve))
    expect(document.querySelector('.submenu > .menu')?.classList.contains('show')).toBe(true)
    expect(document.activeElement?.textContent).toBe('Nested')
    document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    expect(document.querySelector('.submenu > .menu')?.classList.contains('show')).toBe(false)
    menu.hide()
    expect(document.querySelector('#toggle')?.getAttribute('aria-expanded')).toBe('false')
  })

  test('supports Bootstrap-style auto-close without forcing ARIA menu roles', () => {
    document.body.innerHTML = '<button id="toggle" data-trm-toggle="menu" data-trm-auto-close="outside">Open</button><div class="menu"><button class="menu-item">Keep open</button></div><button id="outside">Outside</button>'
    const menu = new Menu('#toggle')
    menu.show()
    document.querySelector<HTMLElement>('.menu-item')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(document.querySelector('.menu')?.classList.contains('show')).toBe(true)
    document.querySelector<HTMLElement>('#outside')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(document.querySelector('.menu')?.classList.contains('show')).toBe(false)
    expect(document.querySelector('.menu')?.hasAttribute('role')).toBe(false)
  })

  test('supports static display, containers, and lifecycle relatedTarget metadata', async () => {
    document.body.innerHTML = '<div id="portal"></div><div class="wrapper"><button id="toggle">Open</button><div class="menu"><button class="menu-item">Action</button></div></div>'
    const toggle = document.querySelector<HTMLElement>('#toggle')!
    let relatedTarget: Element | null = null
    toggle.addEventListener('shown.trm.menu', event => { relatedTarget = (event as Event & { relatedTarget: Element }).relatedTarget })
    const menu = new Menu(toggle, { container: '#portal', display: 'static' })
    await menu.show()
    expect(document.querySelector('#portal > .menu')?.getAttribute('data-trm-display')).toBe('static')
    expect(toggle.classList.contains('show')).toBe(true)
    expect(toggle.parentElement?.classList.contains('show')).toBe(true)
    expect(relatedTarget).toBe(toggle)
    await menu.hide()
    expect(document.querySelector('.wrapper > .menu')).not.toBeNull()
  })

  test('keeps a menu open while interacting with an embedded form', async () => {
    document.body.innerHTML = '<button id="toggle">Open</button><div class="menu"><form><label>Name<input id="name"></label><button type="submit">Save</button></form></div><button id="outside">Outside</button>'
    const menu = new Menu('#toggle')
    await menu.show()
    document.querySelector<HTMLElement>('#name')!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(document.querySelector('.menu')?.classList.contains('show')).toBe(true)
    document.querySelector<HTMLElement>('#outside')!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(document.querySelector('.menu')?.classList.contains('show')).toBe(false)
  })
})

describe('ScrollSpy', () => {
  function mockIntersectionObservers(): Array<{ callback: IntersectionObserverCallback; observed: Element[] }> {
    const observers: Array<{ callback: IntersectionObserverCallback; observed: Element[] }> = []
    vi.stubGlobal('IntersectionObserver', class {
      readonly root = null
      readonly rootMargin = '0px'
      readonly thresholds = [0]
      readonly observed: Element[] = []
      readonly callback: IntersectionObserverCallback

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback
        observers.push(this)
      }

      observe = (element: Element): void => { this.observed.push(element) }
      unobserve = vi.fn()
      disconnect = vi.fn()
      takeRecords = (): IntersectionObserverEntry[] => []
    })
    return observers
  }

  test('activates the current section and synchronizes aria-current', () => {
    const observers = mockIntersectionObservers()
    document.body.innerHTML = '<nav id="spy-nav"><a href="#one">One</a><a href="#two">Two</a></nav><main id="content"><section id="one"></section><section id="two"></section></main>'
    const one = document.querySelector<HTMLElement>('#one')!
    const two = document.querySelector<HTMLElement>('#two')!
    one.getBoundingClientRect = () => ({ top: -10 } as DOMRect)
    two.getBoundingClientRect = () => ({ top: 100 } as DOMRect)
    one.getClientRects = () => [{ width: 10, height: 10 }] as unknown as DOMRectList
    two.getClientRects = () => [{ width: 10, height: 10 }] as unknown as DOMRectList
    const spy = new ScrollSpy('#content', { target: '#spy-nav' })
    observers[0]!.callback([{ target: one, isIntersecting: true } as unknown as IntersectionObserverEntry], observers[0] as unknown as IntersectionObserver)
    expect(document.querySelector('a[href="#one"]')?.classList.contains('active')).toBe(true)
    observers[0]!.callback([
      { target: one, isIntersecting: false } as unknown as IntersectionObserverEntry,
      { target: two, isIntersecting: true } as unknown as IntersectionObserverEntry
    ], observers[0] as unknown as IntersectionObserver)
    expect(document.querySelector('a[href="#two"]')?.classList.contains('active')).toBe(true)
    spy.dispose()
  })

  test('resolves special ids with getElementById and activates nested navigation parents', () => {
    const observers = mockIntersectionObservers()
    document.body.innerHTML = '<nav id="spy-nav"><a class="nav-link" href="#parent">Parent</a><div class="nav"><a class="nav-link" href="#section:overview">Overview</a></div></nav><main id="content"><section id="section:overview"></section></main>'
    const section = document.getElementById('section:overview')!
    section.getBoundingClientRect = () => ({ top: 0, width: 10, height: 10 } as DOMRect)
    section.getClientRects = () => [{ width: 10, height: 10 }] as unknown as DOMRectList
    const spy = new ScrollSpy('#content', { target: '#spy-nav', topMargin: '12%' })
    observers[0]!.callback([{ target: section, isIntersecting: true } as unknown as IntersectionObserverEntry], observers[0] as unknown as IntersectionObserver)
    expect(document.querySelector('a[href="#section:overview"]')?.classList.contains('active')).toBe(true)
    expect(document.querySelector('a[href="#parent"]')?.classList.contains('active')).toBe(true)
    spy.dispose()
  })
})

