import { beforeAll, describe, expect, it } from 'vitest'
import { layoutGuides } from './helpers/layout-content-contract'
import { ancestors, ast, cssTree, rules, sass, sassPin, sheet, topology, values } from './helpers/pinned-sass'

let css: string
let root: ReturnType<typeof ast>
const configured = (config = '', utilities = '') => (config ? "@use 'src/scss/config' with (" + config + ');' : '') +
  "@use 'src/scss/tremplin-grid'" + (utilities ? ' with ($utilities: (' + utilities + '))' : '') + ';'
const parity = (source: string) => {
  const output = sass(source)
  expect(cssTree(output)).toBe(cssTree(sass(source, true)))
  return ast(output)
}
const normal = (selector: string, property: string, value: string, source = root) => {
  expect(values(selector, property, source), selector).toEqual([value])
  for (const rule of rules(selector, source)) rule.walkDecls(property, declaration => {
    expect(Boolean(declaration.important), selector).toBe(false)
  })
}

beforeAll(() => {
  css = sheet('tremplin-grid')
  root = ast(css)
  // Compile CPU-heavy entry combinations once without relaxing assertion timeouts.
  sheet('mixins')
  sheet('mixins', true)
  sheet('tremplin')
  const source = "@use 'src/scss/tremplin-grid'; @use 'src/scss/tremplin';"
  sass(source)
  sass(source, true)
}, 90_000)

describe('pinned Bootstrap 6 focused Grid bundle', () => {
  it('matches the independently verified upstream Grid entry completely', () => {
    expect(cssTree(css)).toBe(cssTree(sheet('tremplin-grid', true)))
  })

  it('includes selected layout families without global importance', () => {
    for (const [selector, property, value] of [
      ['.d-flex', 'display', 'flex'], ['.order-last', 'order', '6'],
      ['.grid-cols-3', 'grid-template-columns', 'repeat(3, 1fr)'], ['.grid-cols-fill', 'grid-column', '1 / -1'],
      ['.grid-auto-flow-dense', 'grid-auto-flow', 'dense'],
      ['.gap-3', 'gap', '0.5rem'], ['.row-gap-3', 'row-gap', '0.5rem'], ['.column-gap-3', 'column-gap', '0.5rem'],
      ['.flex-fill', 'flex', '1 1 auto'], ['.flex-column', 'flex-direction', 'column'],
      ['.flex-wrap', 'flex-wrap', 'wrap'], ['.flex-grow-1', 'flex-grow', '1'], ['.flex-shrink-0', 'flex-shrink', '0'],
      ['.justify-content-between', 'justify-content', 'space-between'], ['.justify-items-center', 'justify-items', 'center'],
      ['.align-items-center', 'align-items', 'center'], ['.align-content-center', 'align-content', 'center'],
      ['.align-self-end', 'align-self', 'flex-end'], ['.place-items-center', 'place-items', 'center'],
      ['.p-3', 'padding', '0.5rem'], ['.px-3', 'padding-inline', '0.5rem'], ['.my-3', 'margin-block', '0.5rem'],
      ['.ms--1', 'margin-inline-start', '-0.25rem'], ['.me--2', 'margin-inline-end', '-0.5rem'],
      ['.ms-auto', 'margin-inline-start', 'auto']
    ] as const) normal(selector, property, value)
    for (const selector of ['.mx-n3', '.my-n3', '.mx--2', '.m--1']) expect(rules(selector, root)).toEqual([])
  })

  it('uses viewport prefixes without retired aliases or default print variants', () => {
    for (const [selector, property, value] of [
      ['.md\\:d-flex', 'display', 'flex'], ['.md\\:row-gap-3', 'row-gap', '0.5rem'],
      ['.md\\:ms-auto', 'margin-inline-start', 'auto']
    ] as const) {
      normal(selector, property, value)
      expect(ancestors(rules(selector, root)[0]!, 'media')).toEqual(['(width >= 768px)'])
    }
    for (const selector of ['.d-md-flex', '.row-gap-md-3', '.ms-md-auto', '.d-print-none', '.print\\:d-none', '.xxl\\:d-flex']) expect(rules(selector, root)).toEqual([])
    expect(rules('.\\32 xl\\:d-flex', root)).toHaveLength(1)
  })

  it('does not pull in non-layout utilities, palette, helpers, components or Reboot', () => {
    for (const selector of ['.fg-primary', '.bg-primary', '.w-100', '.animation-pop', '.shadow', '.border', '.hover-lift', '.hstack', '.ratio', '.btn', '[hidden]']) expect(rules(selector, root), selector).toEqual([])
    expect(css).not.toContain('@keyframes')
    for (const token of ['--trm-primary:', '--trm-bg-body:', '--trm-spacer-3:']) expect(css).not.toContain(token)
    // Focused layout assumes the application supplies a border-box reset.
    expect(values('.container', 'box-sizing', root)).toEqual([])
    normal('.row > *', 'width', '100%')
    expect(rules('*', root)).toEqual([])
  })

  it('configures the shared map before the entry and retains the fixed Tremplin namespace', () => {
    normal(':root', '--trm-breakpoint-xs', '0')
    normal(':host', '--trm-breakpoint-md', '768px')
    const output = parity(configured("$breakpoints: (base: 0, '2xl': 500px)"))
    normal(':root', '--trm-breakpoint-base', '0', output)
    normal(':root', '--trm-breakpoint-2xl', '500px', output)
    expect(values(':root', '--trm-breakpoint-md', output)).toEqual([])
    expect(ancestors(rules('.\\32 xl\\:d-flex', output)[0]!, 'media')).toEqual(['(width >= 500px)'])
    expect(() => sass("@use 'src/scss/tremplin-grid' with ($breakpoints: (base: 0));")).toThrow(/not declared with !default/)
    expect(() => sass(configured("$prefix: 'app-'"))).toThrow(/not declared with !default/)
  })

  it('honors selected-family replacement, disabling, omissions and configured spacing', () => {
    const output = parity(configured('$enable-grid-classes: false, $spacers: (3: 7px)',
      "'display': (property: display, class: d, responsive: true, print: true, state: enabled, dark: true, values: (block: null, custom: flex)), 'gap': null, 'order': (enabled: false), 'cursor': (property: cursor, class: cursor, values: (pointer: pointer))"))
    normal('.p-3', 'padding', '7px', output)
    normal('.d-custom', 'display', 'flex', output)
    for (const selector of ['.row', '.col-6', '.d-block', '.gap-3', '.order-last', '.cursor-pointer']) expect(rules(selector, output), selector).toEqual([])
    expect(rules('.grid', output)).toHaveLength(1) // independent CSS Grid switch
    for (const selector of ['.enabled\\:d-custom:enabled', '.md\\:enabled\\:d-custom:enabled', '.print\\:enabled\\:d-custom:enabled', '.dark\\:enabled\\:d-custom:enabled']) normal(selector, 'display', 'flex', output)
    expect(ancestors(rules('.dark\\:d-custom', output)[0]!, 'media')).toEqual(['(prefers-color-scheme: dark)'])
  })

  it('removes order without leaving a second handwritten ordering generator', () => {
    const output = parity(configured('', "'order': null"))
    for (const selector of ['.order-first', '.order-last', '.order-1', '.md\\:order-last']) expect(rules(selector, output)).toEqual([])
    normal('.d-flex', 'display', 'flex', output)
  })

  it('shares global property registration and opt-in per-family importance', () => {
    const output = parity(configured('', "'display': (property: ('--project-display': null, display: var(--project-display)), class: d, important: true, values: (custom: flex))"))
    const registrations: string[] = []
    output.walkAtRules('property', node => {
      if (node.params === '--project-display') {
        registrations.push(node.params)
        expect(ancestors(node)).toEqual([])
        expect(node.toString()).toContain('inherits: false')
      }
    })
    expect(registrations).toEqual(['--project-display'])
    expect(values('.d-custom', '--project-display', output)).toEqual(['flex'])
    expect(values('.d-custom', 'display', output)).toEqual(['var(--project-display)'])
    for (const rule of rules('.d-custom', output)) rule.walkDecls(declaration => { expect(declaration.important).toBe(true) })
    normal('.p-3', 'padding', '0.5rem', output)
  })

  it('preserves the pinned alternative-entry import-order limitation explicitly', () => {
    expect(sheet('mixins/grid')).toBe('')
    expect(cssTree(sheet('mixins'))).toBe(cssTree(sheet('mixins', true)))
    expect(sheet('mixins')).not.toBe('') // aggregator imports palette output
    const source = "@use 'src/scss/tremplin-grid'; @use 'src/scss/tremplin';"
    const output = sass(source)
    expect(topology(output)).toEqual(topology(sass(source, true)))
    expect(rules('.w-100', output)).toEqual([]) // Grid filters the shared utilities first
    expect(rules('.w-100', sheet('tremplin'))).toHaveLength(1)
    for (const reference of [false, true]) {
      expect(() => sass("@use 'src/scss/tremplin'; @use 'src/scss/tremplin-grid';", reference)).toThrow(/already loaded/)
    }
  })

  it('keeps the important hidden rule in Reboot, not in Grid', () => {
    for (const entry of ['tremplin', 'tremplin-reboot']) {
      const hidden = rules('[hidden]', sheet(entry))
      expect(hidden).toHaveLength(1)
      expect(ancestors(hidden[0]!, 'layer')).toEqual(['reboot'])
      hidden[0]!.walkDecls('display', declaration => {
        expect(declaration.value).toBe('none')
        expect(declaration.important).toBe(true)
      })
    }
    expect(rules('[hidden]', root)).toEqual([])
  })

  it('documents maintained source, standalone entry and CSS Grid contracts without compatibility promises', () => {
    const current = layoutGuides.find(item => item.slug === 'layout/css-grid')!
    const guide = JSON.stringify(current)
    expect(current.reference!.url).toBe('https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/layout/css-grid.mdx')
    expect(guide).toContain('enabled by default')
    expect(guide).toContain('tremplin/scss/config')
    expect(guide).toContain('tremplin/scss/tremplin-grid')
    for (const retired of ['span-12', 'cq-span-', '--trm-grid-columns', '--trm-grid-gap', '2871f2a', 'remain available']) expect(guide).not.toContain(retired)
  })

  it('compiles every documented CSS Grid Sass sample, including the focused entry', () => {
    const guide = layoutGuides.find(item => item.slug === 'layout/css-grid')!
    const samples = guide.sections.flatMap(section => section.code ?? []).filter(sample => sample.language === 'scss')
    expect(samples.length).toBeGreaterThanOrEqual(3)
    for (const sample of samples) {
      const source = sample.source.replaceAll("'tremplin/scss'", "'src/scss/tremplin'").replaceAll("'tremplin/scss/", "'src/scss/")
      const output = sass(source)
      expect(topology(output)).toEqual(topology(sass(source, true)))
    }
  })
})
