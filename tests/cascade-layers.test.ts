import { describe, expect, it } from 'vitest'
import reference from './bootstrap6-layers-reference.json'
import { sass, sheet, ast, rules, values, ancestors, topology, cssTree, sassPin } from './helpers/pinned-sass'

const entries = ['tremplin', 'tremplin-grid', 'tremplin-reboot', 'tremplin-utilities']
const styles = Object.fromEntries(entries.map(entry => [entry, sheet(entry)]))

describe('Pinned Bootstrap 6 cascade layer ownership', () => {
  it('binds the layer inventory to the active reference commit', () => {
    expect(reference.upstreamCommit).toBe(sassPin.commit)
  })

  for (const entry of entries) {
    it(entry + ' uses the pinned entry-specific layer declaration rather than inventing a grid root', () => {
      const root = ast(styles[entry]!)
      const orders: string[] = []
      root.walkAtRules('layer', layer => { if (!layer.nodes) orders.push(layer.params) })
      if (entry === 'tremplin-grid') expect(orders).toEqual([])
      else {
        expect(orders).toHaveLength(1)
        expect(orders[0]!.split(',').map(name => name.trim())).toEqual(reference.layerOrder)
        const orderIndex = root.nodes.findIndex(node => node.type === 'atrule' && node.name === 'layer' && !node.nodes)
        const blockIndex = root.nodes.findIndex(node => node.type === 'atrule' && node.name === 'layer' && node.nodes)
        expect(orderIndex).toBeLessThan(blockIndex)
      }
      root.walkAtRules('layer', layer => {
        if (layer.nodes) {
          expect(reference.layerOrder).toContain(layer.params)
          expect(ancestors(layer, 'layer')).toEqual([])
        }
      })
    })

    it(entry + ' matches all pinned rule contexts including palette, transition, drawer and keyframe exceptions', () => {
      expect(topology(styles[entry]!)).toEqual(topology(sheet(entry, true)))
      const unlayered = topology(styles[entry]!).filter(rule => !rule.context.some(context => context.startsWith('@layer ')))
      expect(unlayered.length).toBeGreaterThan(0)
      // Full value parity, including the approved SVG change, has its separate
      // check:production-css gate. Here no global rule is hidden from topology.
    })

    it(entry + ' registers composition properties globally with the pinned inventory', () => {
      const actual: string[] = []
      const expected: string[] = []
      ast(styles[entry]!).walkAtRules('property', property => {
        expect(property.parent?.type).toBe('root')
        actual.push(property.params)
      })
      ast(sheet(entry, true)).walkAtRules('property', property => { expected.push(property.params) })
      expect(actual).toEqual(expected)
      if (entry === 'tremplin' || entry === 'tremplin-utilities') expect(actual.length).toBeGreaterThan(0)
    })
  }

  for (const [module, owner] of Object.entries(reference.moduleLayers)) {
    it(module + ' retains its pinned layer and complete standalone output', () => {
      const source = sheet(module.replace(/\.scss$/, ''))
      const expected = sheet(module.replace(/\.scss$/, ''), true)
      let ownedRules = 0
      ast(source).walkRules(rule => { if (ancestors(rule, 'layer').includes(owner)) ownedRules++ })
      expect(ownedRules).toBeGreaterThan(0)
      expect(topology(source)).toEqual(topology(expected))
      // The sole Sass exception is the explicitly approved Datepicker SVG URL.
      if (module !== '_datepicker.scss') expect(cssTree(source)).toBe(cssTree(expected))
    })
  }

  for (const [module, owner] of Object.entries(reference.localModuleLayers)) {
    it(module + ' keeps optional presentation in its separate custom layer', () => {
      let ownedRules = 0
      ast(sheet(module.replace(/\.scss$/, ''))).walkRules(rule => {
        if (rule.selector.replace(/\s+/g, ' ') === ':root, :host') return // Imported upstream palette.
        expect(ancestors(rule, 'layer'), rule.selector).toEqual([owner])
        ownedRules++
      })
      expect(ownedRules).toBeGreaterThan(0)
    })
  }

  it('keeps the banner comment-only, not a nonexistent banner component', () => {
    for (const module of reference.commentOnlyModules) {
      expect(cssTree(sheet(module.replace(/\.scss$/, '')))).toBe('')
      expect(topology(sheet(module.replace(/\.scss$/, '')))).toEqual([])
    }
  })

  it('preserves actual configuration and palette side effects rather than promising every import is CSS-free', () => {
    for (const module of ['config', 'functions']) expect(sheet(module)).toBe('')
    for (const module of ['theme', 'mixins']) {
      const source = sheet(module)
      expect(cssTree(source)).toBe(cssTree(sheet(module, true)))
      ast(source).walkRules(rule => expect(rule.selector.replace(/\s+/g, ' ')).toBe(':root, :host'))
      expect(source).not.toContain('@layer')
    }
  })

  it('exposes token maps and canonical breakpoint/grid factories without retired aggregator mixins', () => {
    const source = "@use 'sass:map'; @use 'src/scss/alert' as alert with ($alert-tokens: (--trm-alert-gap: 7px)); @use 'src/scss/layout/breakpoints' as bp; @use 'src/scss/mixins/grid' as grid; .public-api { gap: map.get(alert.$alert-tokens, --trm-alert-gap); @include bp.set-container(); @include grid.make-col(1, 2); }"
    const output = sass(source)
    expect(cssTree(output)).toBe(cssTree(sass(source, true)))
    expect(values('.public-api', 'gap', output)).toEqual(['7px'])
    expect(values('.public-api', 'width', output)).toEqual(['50%'])
    expect(values('.public-api', 'container-type', output)).toEqual(['inline-size'])
    const inventory = "@use 'sass:meta'; @use 'src/scss/list-group' as list; @use 'src/scss/layout/grid' as grid; .api { list: meta.mixin-exists('list-group-horizontal', list); grid: meta.mixin-exists('grid-controls', grid); }"
    expect(values('.api', 'list', sass(inventory))).toEqual(['false'])
    expect(values('.api', 'grid', sass(inventory))).toEqual(['false'])
    expect(cssTree(sass(inventory))).toBe(cssTree(sass(inventory, true)))
  })

  it('keeps grid utilities layered and breakpoint tokens unlayered', () => {
    for (const rule of rules('.md\\:d-flex', styles['tremplin-grid']!)) expect(ancestors(rule, 'layer')).toEqual(['utilities'])
    for (const rule of rules(':host', styles['tremplin-grid']!)) expect(ancestors(rule, 'layer')).toEqual([])
    expect(values(':host', '--trm-breakpoint-md', styles['tremplin-grid']!)).toEqual(['768px'])
  })

  it('uses range queries and default non-important utilities instead of the retired global flag', () => {
    expect(values('.p-3', 'padding', styles.tremplin!)).toEqual(['0.5rem'])
    for (const rule of rules('.p-3', styles.tremplin!)) rule.walkDecls('padding', declaration => { expect(Boolean(declaration.important)).toBe(false) })
    expect(styles.tremplin).toContain('@media (width >= 768px)')
    expect(styles.tremplin).not.toContain('.col-md-6')
    for (const ref of [false, true]) expect(() => sass("@use 'src/scss/tremplin' with ($enable-important-utilities: false);", ref)).toThrow(/not declared with !default/)
  })
})
