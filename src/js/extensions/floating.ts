/**
 * --------------------------------------------------------------------------
 * Tremplin extensions/floating.ts
 * Licensed under MIT (https://github.com/tremplin-framework/tremplin/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import { arrow, autoUpdate, computePosition, flip, offset, shift, type Placement } from '@floating-ui/dom'

export type FloatingPlacement = Placement

export interface FloatingOptions {
  placement?: Placement
  offset?: number
  arrow?: HTMLElement | null
  autoUpdate?: boolean
}

export async function updateFloating(reference: HTMLElement, floating: HTMLElement, options: FloatingOptions = {}): Promise<void> {
  const middleware = [offset(options.offset ?? 8), flip(), shift({ padding: 8 })]
  if (options.arrow) middleware.push(arrow({ element: options.arrow }))
  const result = await computePosition(reference, floating, { placement: options.placement ?? 'bottom', middleware })
  Object.assign(floating.style, { position: result.strategy, left: `${result.x}px`, top: `${result.y}px` })
  floating.dataset.placement = result.placement
  const arrowData = result.middlewareData.arrow
  if (options.arrow && arrowData) Object.assign(options.arrow.style, { left: arrowData.x == null ? '' : `${arrowData.x}px`, top: arrowData.y == null ? '' : `${arrowData.y}px` })
}

export function observeFloating(reference: HTMLElement, floating: HTMLElement, options: FloatingOptions = {}): () => void {
  return autoUpdate(reference, floating, () => { void updateFloating(reference, floating, options) })
}

export function positionFloating(reference: HTMLElement, floating: HTMLElement, placement: Placement = 'bottom', distance = 8): void {
  void updateFloating(reference, floating, { placement, offset: distance })
}

export type { Placement }
