import { afterEach, describe, expect, it } from 'vitest'
import { act, createElement, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { createApp, h, nextTick, withDirectives } from 'vue'
import { useTremplin } from '../src/adapters/react.js'
import { createTremplinDirective } from '../src/adapters/vue.js'
import type { ElementLike } from '../src/adapters/types.js'

afterEach(() => { document.body.innerHTML = '' })

describe('Core-independent component adapters', () => {
  it('React StrictMode owns each created instance and releases its ref', async () => {
    const created: Component[] = []
    class Component {
      disposed = 0
      constructor(readonly element: ElementLike, readonly options?: { enabled?: boolean }) { created.push(this) }
      dispose() { this.disposed++ }
    }
    let binding: ReturnType<typeof useTremplin<HTMLElement, Component, { enabled?: boolean }>>
    function App() { binding = useTremplin(Component, { enabled: false }); return createElement('div', { ref: binding.ref }) }
    ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)
    await act(async () => root.render(createElement(StrictMode, null, createElement(App))))
    expect(created).toHaveLength(2)
    expect(created[0]!.disposed).toBe(1)
    expect(created[1]!.options).toEqual({ enabled: false })
    expect(binding!.instance.current).toBe(created[1])
    await act(async () => root.unmount())
    expect(created.map(instance => instance.disposed)).toEqual([1, 1])
    expect(binding!.instance.current).toBeNull()
  })

  it('React does not recreate a component on an options-only rerender', async () => {
    let mounts = 0, disposes = 0
    class Component {
      constructor(_element: ElementLike, readonly options?: { enabled?: boolean }) { mounts++ }
      dispose() { disposes++ }
    }
    function App({ enabled }: { enabled: boolean }) { const binding = useTremplin(Component, { enabled }); return createElement('div', { ref: binding.ref }) }
    ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)
    await act(async () => root.render(createElement(App, { enabled: true })))
    await act(async () => root.render(createElement(App, { enabled: false })))
    expect(mounts).toBe(1)
    await act(async () => root.unmount())
    expect(disposes).toBe(1)
  })

  it('server rendering never constructs a browser component', () => {
    let mounts = 0
    class Component { constructor(_element: ElementLike) { mounts++ } dispose() {} }
    function App() { const binding = useTremplin(Component); return createElement('div', { ref: binding.ref }, 'Server') }
    expect(renderToString(createElement(App))).toContain('Server')
    expect(mounts).toBe(0)
  })

  it('Vue directives keep independent lifecycle storage on the same element', async () => {
    const counts = { first: 0, second: 0 }
    class First { constructor(_element: ElementLike) {} dispose() { counts.first++ } }
    class Second { constructor(_element: ElementLike) {} dispose() { counts.second++ } }
    const first = createTremplinDirective(First)
    const second = createTremplinDirective(Second)
    const container = document.createElement('div')
    document.body.append(container)
    const app = createApp({ render: () => withDirectives(h('div'), [[first], [second]]) })
    app.mount(container)
    await nextTick()
    app.unmount()
    expect(counts).toEqual({ first: 1, second: 1 })
  })
})
