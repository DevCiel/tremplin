import { expect } from '@playwright/test'
import { sass, cssTree } from '../helpers/pinned-sass'
import { approvedSass, prepareApprovedSass } from '../helpers/approved-sass'

/** Compile at collection time so --list also detects invalid Sass. Every
 * complete output is compared with the separately hash-verified approved pin;
 * no selectors, declarations, layers or conditions are normalized away.
 * Arrays compose separate stylesheets, not conflicting Sass entry modules.
 */
export async function pinnedLayoutStyles<T extends Record<string, string | string[]>>(sources: T): Promise<Record<keyof T, string>> {
  await prepareApprovedSass()
  const styles = {} as Record<keyof T, string>
  for (const key of Object.keys(sources) as (keyof T)[]) {
    const source = sources[key]!
    const parts = Array.isArray(source) ? source : [source]
    const actual = parts.map(input => sass(input)).join('\n')
    const expected = parts.map(input => approvedSass(input)).join('\n')
    if (cssTree(actual) !== cssTree(expected)) throw new Error('Browser fixture CSS differs from approved pin: ' + String(key))
    styles[key] = actual
  }
  return styles
}

export function rejectsPinnedSass(source: string, message: RegExp) {
  expect(() => sass(source)).toThrow(message)
  expect(() => approvedSass(source)).toThrow(message)
}
