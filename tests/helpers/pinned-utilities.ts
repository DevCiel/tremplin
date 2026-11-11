import { ast, sass } from './pinned-sass'

// Exercise the upstream loop itself, not a test-side reconstruction. Small
// custom maps keep API cases isolated; entry integration is checked separately.
export function utilitySource(definition: string, breakpoints = '(xs: 0, md: 768px, 2xl: 1536px)') {
  return "@use 'src/scss/mixins/utilities' as utility; $definitions: (" + definition + '); ' +
    '@include utility.generate-utility-at-properties($definitions); ' +
    '@layer utilities { @include utility.generate-utilities-loop($definitions, ' + breakpoints + '); }'
}

export const utilityCss = (definition: string, reference = false, breakpoints?: string) => sass(utilitySource(definition, breakpoints), reference)
export const utilityRoot = (definition: string, reference = false, breakpoints?: string) => ast(utilityCss(definition, reference, breakpoints))

export function registrations(source: string | ReturnType<typeof ast>): string[] {
  const names: string[] = []
  const root = typeof source === 'string' ? ast(source) : source
  root.walkAtRules('property', node => { names.push(node.params) })
  return names
}

export function utilityError(definition: string, reference = false) {
  try {
    utilityCss(definition, reference)
    return null
  } catch (error) {
    return (error as Error & { sassMessage?: string }).sassMessage ?? (error as Error).message.split('\n')[0]
  }
}
