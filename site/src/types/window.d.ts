export {}

declare global {
  interface Window {
    /** Website-owned hook only; not a global exported by the framework package. */
    TremplinFramework?: typeof import('../../../src/js/index')
    PagefindUI?: new (options: { element: string; showSubResults?: boolean }) => unknown
  }
}
