import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')

describe('Current optional ecosystem sources', () => {
  test('keeps optional products out of the core package while retaining authored local sources', () => {
    const pkg = JSON.parse(read('package.json'))

    expect(pkg.version).toBe('0.8.0-beta.0')
    for (const specifier of ['./icons', './icons/sprite', './themes/*', './react', './vue', './extensions/*', './css/extensions', './css/extensions/min']) expect(pkg.exports[specifier]).toBeUndefined()
    expect(pkg.exports['./bundle']).toBe('./dist/js/tremplin.bundle.min.js')
    expect(pkg.exports['./css/grid']).toBe('./dist/css/tremplin-grid.css')
    for (const directory of ['icons', 'themes', 'starters', 'src', 'docs']) expect(pkg.files).not.toContain(directory)
    expect(pkg.files).toContain('dist')
    expect(pkg.files).toContain('!src/js/extensions/**')
    expect(pkg.files).toContain('!src/scss/extensions/**')
    expect(pkg.peerDependencies.react).toBeUndefined()
    expect(pkg.peerDependencies.vue).toBeUndefined()
    for (const file of ['src/adapters/react.ts', 'src/adapters/vue.ts', 'src/js/extensions/command-palette.ts', 'starters/react/package.json', 'icons/tremplin-icons.svg']) expect(read(file).length).toBeGreaterThan(0)
  })

  test('ships an accessible SVG sprite with stable symbols', () => {
    const sprite = read('icons/tremplin-icons.svg')

    expect(sprite).toContain('<symbol id="check"')
    expect(sprite).toContain('<symbol id="calendar"')
    expect(sprite).toContain('<symbol id="globe"')
    expect(sprite.match(/<symbol /g)).toHaveLength(32)
    expect(sprite).toContain('aria-hidden="true"')
  })

  test('theme presets only override namespaced tokens', () => {
    for (const file of ['themes/tremplin-ocean.css', 'themes/tremplin-forest.css']) {
      const css = read(file)
      expect(css).toMatch(/\[data-trm-theme=/)
      expect(css).toMatch(/--trm-primary-base:/)
      expect(css).toMatch(/--trm-primary-contrast:/)
      expect(css).toMatch(/--trm-bg-body:/)
      expect(css).not.toMatch(/--trm-primary\s*:|--trm-body-(?:bg|color)\s*:/)
      expect(css).not.toMatch(/\.trm-/)
    }
  })

  test('publishes generated API metadata for every TypeScript component', () => {
    const api = JSON.parse(read('metadata/api.json'))
    expect(api.components).toHaveLength(21)
    expect(api.components.find((component: { name: string }) => component.name === 'drawer')).toMatchObject({
      className: 'Drawer',
      methods: expect.arrayContaining([
        'show(relatedTarget?: HTMLElement): Promise<void>',
        'toggle(relatedTarget?: HTMLElement): Promise<void>'
      ]),
      events: expect.arrayContaining(['show.trm.drawer', 'hidden.trm.drawer'])
    })
  })

  test('ships HTML, Vite, React, and Vue starters pinned to the beta', () => {
    const classes = new Set(JSON.parse(read('metadata/public-api.json')).css.componentClasses)
    for (const file of ['starters/html/index.html', 'starters/vite/src/main.js', 'starters/react/src/main.jsx', 'starters/vue/src/main.js']) {
      const source = read(file)
      expect(source).not.toMatch(/btn-primary|text-muted/)
      expect(source).toContain('btn-solid theme-primary')
      for (const match of source.matchAll(/class(?:Name)?="([^"]+)"/g)) for (const name of match[1]!.split(/\s+/)) expect(classes.has(name), file + ': ' + name).toBe(true)
    }
    expect(read('starters/html/index.html')).toContain('tremplin@0.8.0-beta.0')
    for (const starter of ['vite', 'react', 'vue']) {
      const pkg = JSON.parse(read(`starters/${starter}/package.json`))
      expect(pkg.dependencies.tremplin).toBe('^0.8.0-beta.0')
    }
  })
})
