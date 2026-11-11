import { useEffect, useRef, type RefObject } from 'react'
import type { TremplinInstance as BaseComponent, ElementLike } from './types.js'
export type { TremplinInstance } from './types.js'

export interface TremplinConstructor<T extends BaseComponent, O> {
  new (element: ElementLike, options?: O): T
}

export interface TremplinReactBinding<E extends HTMLElement, T extends BaseComponent> {
  ref: RefObject<E | null>
  instance: RefObject<T | null>
}

/** Mounts one Tremplin component and disposes it with the React component. */
export function useTremplin<E extends HTMLElement, T extends BaseComponent, O>(
  Component: TremplinConstructor<T, O>,
  options?: O
): TremplinReactBinding<E, T> {
  const ref = useRef<E>(null)
  const instance = useRef<T>(null)

  useEffect(() => {
    if (!ref.current) return
    const mounted = new Component(ref.current, options)
    instance.current = mounted
    return () => {
      mounted.dispose()
      if (instance.current === mounted) instance.current = null
    }
  }, [Component])

  return { ref, instance }
}
