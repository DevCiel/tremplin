/** Structural lifecycle contract for the current core and optional components. */
export interface TremplinInstance {
  dispose(): void
}

export type ElementLike = Element | string
