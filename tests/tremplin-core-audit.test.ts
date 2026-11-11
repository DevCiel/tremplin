import { describe, expect, it } from 'vitest'
// @ts-expect-error The audit helpers are runtime JavaScript with their own tests.
import { brandedPath, brandSource, compareSource, gitBlobHash, moduleKind, productionPath, safeReferencePath } from '../build/lib/tremplin-core.mjs'

const identity = { version: '0.8.0-beta.0', upstreamVersion: '6.0.0-alpha.1' }

describe('Strict Bootstrap 6 migration audit', () => {
  it('maps all core subdirectories but excludes upstream tests and documentation', () => {
    expect(moduleKind('scss/forms/_check.scss')).toBe('scss')
    expect(moduleKind('js/src/dom/manipulator.ts')).toBe('javascript')
    expect(moduleKind('scss/tests/tokens.spec.js')).toBeNull()
    expect(moduleKind('scss/tests/_fixture.scss')).toBeNull()
    expect(moduleKind('js/tests/unit/alert.spec.ts')).toBeNull()
    expect(productionPath('scss/bootstrap-grid.scss')).toBe('src/scss/tremplin-grid.scss')
    expect(productionPath('js/src/dialog-base.ts')).toBe('src/js/dialog-base.ts')
    expect(brandedPath('scss/bootstrap.scss')).toBe('scss/tremplin.scss')
  })

  it('preserves licenses, copyright and URLs while branding the product header', () => {
    const source = '// Bootstrap menu.ts\n// Copyright The Bootstrap Authors\n// Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)\n'
    const branded = brandSource(source, identity)
    expect(branded).toContain('// Tremplin menu.ts')
    expect(branded).toContain('// Copyright The Bootstrap Authors')
    expect(branded).toContain('https://github.com/twbs/bootstrap/blob/main/LICENSE')
  })
  it('changes the product homepage only in the precise Sass banner comment',()=>{
    const line='  * Bootstrap #{$file} v6.0.0-alpha.1 (https://getbootstrap.com/)'
    expect(brandSource(line,identity)).toContain('(https://gettremplin.com)')
    expect(brandSource('const homepage = "https://getbootstrap.com/"',identity)).toBe('const homepage = "https://getbootstrap.com/"')
  })

  it('rewrites framework custom properties without touching negative classes or vendor properties', () => {
    expect(brandSource('.m--2{--gap:1rem;--bs-color:red;--trm-existing:0;--#{$name}:0;-webkit-appearance:none;gap:var(--gap)}', identity)).toBe('.m--2{--trm-gap:1rem;--trm-color:red;--trm-existing:0;--trm-#{$name}:0;-webkit-appearance:none;gap:var(--trm-gap)}')
  })

  it('keeps data attributes, dataset filtering, regex stripping and event keys consistent', () => {
    const branded = brandSource("const bsKeys = key.startsWith('bs') && !key.startsWith('bsConfig'); key.replace(/^bs/, ''); element.dataset.bsTheme; 'data-bs-toggle'; `bs.${this.NAME}`; 'shown.bs.dialog'", identity)
    expect(branded).toContain("const trmKeys = key.startsWith('trm') && !key.startsWith('trmConfig')")
    expect(branded).toContain('key.replace(/^trm/')
    expect(branded).toContain('dataset.trmTheme')
    expect(branded).toContain('data-trm-toggle')
    expect(branded).toContain('`trm.${this.NAME}`')
    expect(branded).toContain('shown.trm.dialog')
  })

  it('preserves third-party calendar custom properties used by the external dependency', () => {
    expect(brandSource('[data-vc="months"]{--vc-columns:5;grid-template-columns:repeat(var(--vc-columns),1fr);color:var(--datepicker-color)}', identity)).toBe('[data-vc="months"]{--vc-columns:5;grid-template-columns:repeat(var(--vc-columns),1fr);color:var(--trm-datepicker-color)}')
  })

  it('changes product version only in the banner and VERSION declaration', () => {
    const source = "const VERSION = '6.0.0-alpha.1'; const dependency = '6.0.0-alpha.1'; // Bootstrap v6.0.0-alpha.1"
    const actual = brandSource(source, identity)
    expect(actual).toContain("const VERSION = '0.8.0-beta.0'")
    expect(actual).toContain("const dependency = '6.0.0-alpha.1'")
    expect(actual).toContain('Tremplin v0.8.0-beta.0')
  })

  it('never hides code, comment, formatting, palette or geometry differences', () => {
    const remote = '// Bootstrap\n.a { width: 10px; --gap: 1rem; }\n'
    const branded = brandSource(remote, identity)
    expect(compareSource(branded.replace(/\n/g, '\r\n'), remote, identity)).toBe('matched')
    for (const changed of [branded.replace('10px', '11px'), branded.replace('1rem', '2rem'), branded.replace('// Tremplin', '// Changed'), branded.replace('width:', 'width: ')]) expect(compareSource(changed, remote, identity)).toBe('implementation-differs')
    expect(compareSource(undefined, remote, identity)).toBe('missing')
  })

  it('verifies Git blob hashing and rejects unsafe paths', () => {
    expect(gitBlobHash('hello\n')).toBe('ce013625030ba8dba906f756967f9e9ca394464a')
    for (const file of ['../x', '/x', 'C:/x', 'scss/../x', 'scss\\x', 'scss//x']) expect(() => safeReferencePath(file)).toThrow()
    expect(safeReferencePath('scss/forms/index.scss')).toBe('scss/forms/index.scss')
  })
})
