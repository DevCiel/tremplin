import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

type Component = { name: string; classes: string[]; accessibility: string }
type Manifest = { framework: string; version: string; components: Component[] }

const manifest = JSON.parse(readFileSync('metadata/components.json', 'utf8')) as Manifest
const api = JSON.parse(readFileSync('metadata/api.json', 'utf8')) as { components: Array<{ name: string }> }
const publicApi = JSON.parse(readFileSync('metadata/public-api.json', 'utf8')) as {
  packageExports: Array<{ specifier: string }>
  javascriptModules: Array<{ specifier: string; runtimeExports: string[]; typeExports: string[]; declarations: string[] }>
  css: { componentClasses: string[]; customProperties: string[] }
  sass: { entrypoints: string[]; variables: string[]; functions: string[]; mixins: string[] }
}
const deprecations = JSON.parse(readFileSync('metadata/deprecations.json', 'utf8')) as { deprecations: unknown[] }

describe('component metadata', () => {
  test('retains the exact Git-verified upstream license in the product package', () => {
    const pin=JSON.parse(readFileSync('metadata/bootstrap6-reference.json','utf8'))
    const base='artifacts/bootstrap6-reference/'+pin.commit+'/'
    const bytes=readFileSync(base+'LICENSE')
    const reference=JSON.parse(readFileSync(base+'reference-manifest.json','utf8')) as {files:{path:string;sha:string}[]}
    expect(createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex')).toBe(reference.files.find(file=>file.path==='LICENSE')!.sha)
    expect(readFileSync('licenses/third-party-code.txt').equals(bytes)).toBe(true)
    expect(readFileSync('THIRD_PARTY_NOTICES.txt','utf8')).toContain(bytes.toString())
    expect(JSON.parse(readFileSync('package.json','utf8')).files).toContain('THIRD_PARTY_NOTICES.txt')
  })
  test('is versioned and uniquely names every component', () => {
    expect(manifest.framework).toBe('Tremplin')
    expect(manifest.version).toBe('0.8.0-beta.0')
    expect(new Set(manifest.components.map(component => component.name)).size).toBe(manifest.components.length)
  })

  test('publishes only unprefixed classes with accessibility guidance', () => {
    for (const component of manifest.components) {
      // Datepicker styles Calendar Pro data attributes, not the retired local classes.
      if (component.name === 'toggler' || component.name === 'datepicker') expect(component.classes).toEqual([])
      else expect(component.classes.length).toBeGreaterThan(0)
      expect(component.classes.every(className => !className.startsWith('trm-'))).toBe(true)
      expect(component.accessibility.length).toBeGreaterThan(20)
    }
    expect(readFileSync('src/scss/_datepicker.scss', 'utf8')).toContain('[data-vc="calendar"]')
  })

  test('documents every generated JavaScript component', () => {
    const documented = new Set(manifest.components.map(component => component.name))
    for (const component of api.components) expect(documented.has(component.name)).toBe(true)
  })

  test('freezes the complete public package, CSS, JavaScript, and Sass surfaces', () => {
    expect(publicApi.packageExports.map(entry => entry.specifier)).not.toContain('./extensions/*')
    expect(publicApi.javascriptModules.find(module => module.specifier === '.')?.runtimeExports).toContain('Dialog')
    expect(publicApi.javascriptModules.find(module => module.specifier === './dialog')?.runtimeExports).toContain('default')
    expect(publicApi.javascriptModules.find(module => module.specifier === './react')?.declarations.some(declaration => declaration.includes('useTremplin<'))).toBe(true)
    expect(publicApi.javascriptModules.find(module => module.specifier === './react')?.typeExports).not.toBeUndefined()
    expect(publicApi.css.componentClasses).toContain('dialog')
    expect(publicApi.css.componentClasses).not.toContain('bottom-sheet')
    expect(publicApi.css.customProperties).toContain('--trm-primary-base')
    expect(publicApi.sass.entrypoints).toContain('./scss/tremplin-grid')
    expect(publicApi.sass.variables).toContain('blue')
    expect(publicApi.sass.variables).toContain('gradient')
    for (const name of ['hover-lift-tokens', 'icon-link-tokens', 'stretched-link-tokens', 'stretched-link-pseudo-element']) expect(publicApi.sass.variables).toContain(name)
    expect(publicApi.sass.functions).toContain('defaults($defaults, $overrides)')
    for (const name of ['theme-colors', 'theme-fgs', 'theme-bgs', 'theme-borders', 'util-opacity']) expect(publicApi.sass.variables).toContain(name)
    for (const signature of ['theme-color-values($key)', 'theme-color-refs($key)', 'theme-token-refs($map, $prefix)', 'theme-opacity-values($color-var, $fallback: null, $opacities: $util-opacity)']) expect(publicApi.sass.functions).toContain(signature)
    expect(publicApi.sass.mixins).toContain('focus-ring($offset: false, $color: null)')
    for (const signature of ['set-container($type: inline-size, $name: null)', 'container-breakpoint-up($name, $container-name: null, $breakpoints: $breakpoints)', 'loop-breakpoints-up($breakpoints: $breakpoints)']) expect(publicApi.sass.mixins).toContain(signature)
    for (const signature of ['breakpoint-next($name, $breakpoints: $breakpoints, $breakpoint-names: map.keys($breakpoints))', 'breakpoint-min($name, $breakpoints: $breakpoints)', 'breakpoint-max($name, $breakpoints: $breakpoints)']) expect(publicApi.sass.functions).toContain(signature)
    for (const name of ['up', 'down', 'only']) expect(publicApi.sass.mixins).toContain(`media-breakpoint-${name}($name, $breakpoints: $breakpoints)`)
    expect(publicApi.sass.mixins).toContain('media-breakpoint-between($lower, $upper, $breakpoints: $breakpoints)')
    for (const name of ['down', 'only']) expect(publicApi.sass.mixins).toContain(`container-breakpoint-${name}($name, $container-name: null, $breakpoints: $breakpoints)`)
    expect(publicApi.sass.mixins).toContain('container-breakpoint-between($lower, $upper, $container-name: null, $breakpoints: $breakpoints)')
    for (const name of ['loop-breakpoints-down', 'loop-breakpoints']) expect(publicApi.sass.mixins).toContain(`${name}($breakpoints: $breakpoints)`)
    expect(publicApi.sass.mixins).toContain('make-cssgrid($columns: $grid-columns, $breakpoints: $breakpoints)')
    // The frozen generator inventories mixins/ and breakpoints, not every
    // module-owned mixin. Keep the actual containers export covered without
    // refreshing the production baseline to hide that catalog limitation.
    expect(readFileSync('src/scss/layout/_containers.scss', 'utf8')).toContain('@mixin make-container($gutter: $container-padding-x)')
    expect(publicApi.sass.mixins).toContain('make-grid-columns($columns: $grid-columns, $gutter: $grid-gutter-x, $breakpoints: $breakpoints)')
    for (const name of ['container-padding-x', 'grid-row-columns', 'gutters']) expect(publicApi.sass.variables).toContain(name)
    for (const name of ['--trm-columns', '--trm-rows', '--trm-gap']) expect(publicApi.css.customProperties).toContain(name)
    for (const signature of ['generate-theme-classes()', 'generate-theme-reset()']) expect(publicApi.sass.mixins).toContain(signature)
    expect(publicApi.sass.mixins.some(signature => signature.startsWith('gradient-x-three-colors('))).toBe(true)
    expect(publicApi.sass.mixins.some(signature => signature.startsWith('gradient-y-three-colors('))).toBe(true)
    const baseline = JSON.parse(readFileSync('metadata/strict-api-baseline.json', 'utf8')) as { commit: string; apiSha256: string; publicApiSha256: string; packageExports: unknown[] }
    const pin = JSON.parse(readFileSync('metadata/bootstrap6-reference.json', 'utf8')) as { commit: string }
    expect(baseline.commit).toBe(pin.commit)
    const digest = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex')
    expect(digest(api)).toBe(baseline.apiSha256)
    // Only delivery paths change; reconstructing the frozen export list must
    // retain the complete original methods/classes/CSS/Sass contract digest.
    expect(digest({ ...publicApi, packageExports: baseline.packageExports })).toBe(baseline.publicApiSha256)
    expect(deprecations.deprecations).toEqual([])
  })
})
