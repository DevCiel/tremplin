import { expect } from 'vitest'
import { ast, cssTree, sass } from './pinned-sass'

export const familySource = (config = '', theme = '', utilities = '') =>
  (config ? "@use 'src/scss/config' with (" + config + ');' : '') +
  (theme ? "@use 'src/scss/theme' with (" + theme + ');' : '') +
  "@use 'src/scss/tremplin-utilities'" + (utilities ? ' with ($utilities: (' + utilities + '))' : '') + ';'

export function prepareFamilies(sources: Record<string, string>) {
  for (const source of Object.values(sources)) { sass(source); sass(source, true) }
}

export function checkedFamily(source: string) {
  const output = sass(source)
  expect(cssTree(output)).toBe(cssTree(sass(source, true)))
  return ast(output)
}
