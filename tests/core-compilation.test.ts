import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { assertDocumentationPackage } from './helpers/documentation-scope'

const read = (file: string) => readFileSync(file, 'utf8')
const json = (file: string) => JSON.parse(read(file))
const node = (source: string) => execFileSync(process.execPath, ['--input-type=module', '-e', source], { encoding: 'utf8' }).trim()
const gitBlob = (bytes: Buffer) => createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex')
const files = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(directory + '/' + entry.name) : [directory + '/' + entry.name]).sort()
const policy = json('metadata/core-delivery-reference.json')
const tooling = json('metadata/core-delivery-tooling.json')
const base = 'artifacts/bootstrap6-reference/' + policy.reference.commit + '/'

describe('source-derived compilation tooling', () => {
  it('pins compiler dependencies to the Git-verified upstream lock rather than floating tool versions', () => {
    const bytes = readFileSync(base + 'package-lock.json')
    const source = json(base + 'reference-manifest.json').files.find((file: { path: string }) => file.path === 'package-lock.json')
    expect(gitBlob(bytes)).toBe(source.sha)
    expect(gitBlob(bytes)).toBe(tooling.upstreamLockGitBlob)
    const upstream = JSON.parse(bytes.toString())
    const product = json('package.json'), lock = json('package-lock.json')
    for (const [name, version] of Object.entries(tooling.dependencyAdditions)) {
      expect(version).toBe(upstream.packages['node_modules/' + name].version)
      expect(product.devDependencies[name]).toBe(version)
      expect(lock.packages[''].devDependencies[name]).toBe(version)
      expect(lock.packages['node_modules/' + name].version).toBe(version)
    }
  })

  it('retains the pinned browser floors and their actual upstream target resolver', () => {
    const original = readFileSync(base + '.browserslistrc')
    expect(gitBlob(original)).toBe(policy.reference.files.find((file: { path: string }) => file.path === '.browserslistrc').gitBlob)
    expect(read('.browserslistrc').replaceAll('\r\n', '\n')).toBe(original.toString().replaceAll('data-bs-theme', 'data-trm-theme').replaceAll('\r\n', '\n'))
    expect(read('build/browser-targets.mjs').replaceAll('\r\n', '\n')).toBe(read(base + 'build/browser-targets.mjs').replaceAll('\r\n', '\n'))
    const targets = JSON.parse(node("import targets from './build/browser-targets.mjs'; console.log(JSON.stringify(targets));"))
    expect(targets).toEqual(expect.arrayContaining(['chrome138', 'edge138', 'firefox147', 'safari26', 'ios26']))
  })

  it('preserves all 35 modules despite the upstream tracked ScrollLock output omission', () => {
    const expected = policy.reference.files.filter((file: { path: string }) => file.path.startsWith('js/dist/')).map((file: { path: string }) => file.path)
    expect(policy.sourceDerivedModuleOutputs).toHaveLength(1)
    const scroll = policy.sourceDerivedModuleOutputs[0]
    expect(scroll.source).toBe('js/src/util/scroll-lock.ts')
    expect(gitBlob(readFileSync(base + scroll.source))).toBe(scroll.sourceGitBlob)
    expected.push(...scroll.outputs)
    expect(expected).toHaveLength(140)
    expect(files('js/dist')).toEqual(expected.sort())
    for (const path of files('js/dist')) expect(path).not.toMatch(/(?:chunk-|\/extensions\/|\/adapters\/|\/runtime\/)/)
  })

  it('emits strict declarations only for the selected core source roots', () => {
    const config = json('build/tsconfig.dts.json')
    expect(config.extends).toBe('../tsconfig.core.json')
    expect(config.compilerOptions).toMatchObject({ emitDeclarationOnly: true, declaration: true, declarationMap: true, noEmitOnError: true, rootDir: '../src/js', outDir: '../js/dist', newLine: 'lf' })
    expect(config.include).toEqual(['../src/js/**/*.ts'])
    expect(config.exclude).toEqual(['../src/js/extensions/**'])
    expect(read('.gitattributes')).toContain('/js/dist/** text eol=lf')
  })

  it('keeps module maps portable and linked to actual source instead of machine-local paths', () => {
    for (const file of files('js/dist').filter(file => file.endsWith('.map'))) {
      const map = json(file) as { sources: string[]; sourceRoot?: string; sourcesContent?: string[] }
      if (file === 'js/dist/index.js.map') {
        // Upstream also publishes an empty-source map for this pure re-export
        // entry. Only this exact file may omit executable source mappings.
        expect(map.sources).toEqual([])
        expect(json(file).mappings).toMatch(/^;*$/)
        expect(json(file).names).toEqual([])
        const original = readFileSync(base + 'js/dist/index.js.map')
        expect(gitBlob(original)).toBe(policy.reference.files.find((entry: { path: string }) => entry.path === 'js/dist/index.js.map').gitBlob)
        expect(JSON.parse(original.toString()).sources).toEqual([])
      } else expect(map.sources.length, file).toBeGreaterThan(0)
      for (const source of map.sources) {
        expect(source, file).not.toMatch(/^(?:[a-z]:[\\/]|\/|file:)/i)
        expect(existsSync(resolve(dirname(file), map.sourceRoot ?? '', source)), file).toBe(true)
      }
      if (file.endsWith('.js.map')) expect(map.sourcesContent?.length, file).toBe(map.sources.length)
    }
  })

  it('uses external sibling modules without hidden split chunks or TypeScript runtime imports', () => {
    for (const file of files('js/dist').filter(file => file.endsWith('.js'))) {
      const source = read(file)
      expect(source, file).not.toContain('__tremplinAssertRuntime')
      expect(source, file).toContain('The Bootstrap Authors')
      for (const match of source.matchAll(/(?:from|import)\s*["']([^"']+)["']/g)) {
        if (match[1]!.startsWith('.')) {
          expect(match[1], file).toMatch(/\.js$/)
          expect(existsSync(resolve(dirname(file), match[1]!)), file).toBe(true)
        }
      }
    }
  })

  it('shares class and instance identity between canonical root and individual modules', () => {
    expect(node(`
      import assert from 'node:assert/strict'; import { JSDOM } from 'jsdom';
      const dom=new JSDOM('<!doctype html><button id="probe">Toggle</button>',{url:'https://example.test/'});
      for(const key of ['window','document','Node','Element','HTMLElement','Event','CustomEvent'])globalThis[key]=key==='window'?dom.window:dom.window[key];
      const root=await import('./js/dist/index.js');const {default:Button}=await import('./js/dist/button.js');
      assert.equal(root.Button,Button);const instance=Button.getOrCreateInstance('#probe');
      assert.equal(root.Button.getInstance('#probe'),instance);instance.toggle();
      assert.equal(document.querySelector('#probe').getAttribute('aria-pressed'),'true');instance.dispose();dom.window.close();console.log('shared');
    `)).toBe('shared')
  })

  it('prefixes authored properties once while preserving Calendar Pro namespaces', () => {
    const result = node(`
      import postcss from 'postcss';import config from './build/postcss.config.mjs';
      const result=await postcss(config().plugins).process('.probe{--foreground:red;--trm-existing:blue;--vc-accent:green;color:var(--foreground);transition:opacity .2s;-webkit-transition:opacity .2s}',{from:undefined,map:false});console.log(result.css);
    `)
    expect(result).toContain('--trm-foreground:red')
    expect(result).toContain('var(--trm-foreground)')
    expect(result).toContain('--trm-existing:blue')
    expect(result).toContain('--vc-accent:green')
    expect(result).not.toMatch(/--trm-(?:trm|vc)-|-webkit-transition/)
  })

  it('compiles the exact 25-file core preview without switching active package exports', () => {
    const preview = json('artifacts/core-delivery-preview-report.json')
    expect(preview.coreFiles).toBe(25)
    expect(preview.files.filter((file: string) => file.startsWith('css/'))).toHaveLength(17)
    expect(preview.files.filter((file: string) => file.startsWith('js/'))).toHaveLength(8)
    expect(preview.packageExportsChanged).toBe(false)
    expect(preview.activeBrowserDistributionChanged).toBe(false)
    expect(preview.releaseBlocked).toBe(true)
    const css = read('artifacts/core-delivery-preview/css/tremplin.min.css')
    expect(css).toContain('light-dark(')
    expect(css).toMatch(/url\(["']?\.\.\/icons\/datepicker-chevron\.svg/)
  })

  it('retains twenty exports and the correct external versus bundled dependency graphs', () => {
    const preview = json('artifacts/core-delivery-preview-report.json')
    const expected = json('metadata/public-api.json').javascriptModules.find((module: { specifier: string }) => module.specifier === '.').runtimeExports.slice().sort()
    for (const build of preview.builds) {
      expect(build.exports.slice().sort()).toEqual(expected)
      expect(build.exports).toHaveLength(20)
      expect(build.imports).toEqual(build.file.includes('.bundle.') ? [] : ['@floating-ui/dom', 'vanilla-calendar-pro'])
      expect(build.inputs.some((file: string) => /src\/(?:adapters|runtime|js\/extensions)\//.test(file))).toBe(false)
    }
  })

  it('reports real preview sizes against unchanged approved budgets rather than concealing oversize builds', () => {
    const preview = json('artifacts/core-delivery-preview-report.json')
    const budgets = JSON.parse(node("import {budgets} from './tests/tooling/check-size.mjs';console.log(JSON.stringify(budgets));"))
    for (const entry of preview.budgets) {
      expect(entry.maximum).toBe(budgets.find(([file]: [string]) => file === entry.file)[1])
      expect(entry.bytes).toBe(gzipSync(readFileSync(entry.file.replace(/^dist\//, 'artifacts/core-delivery-preview/')), { level: 9 }).byteLength)
      expect(entry.passed).toBe(entry.bytes <= entry.maximum)
    }
    expect(preview.budgetReady).toBe(preview.budgets.every((entry: { passed: boolean }) => entry.passed))
  })

  it('refuses a preview destination outside the explicitly scoped generated directories', () => {
    expect(node(`
      import assert from 'node:assert/strict';process.env.TREMPLIN_BUILD_OUTPUT='../unrelated';
      await assert.rejects(import('./build/rolldown.config.mjs'),/Unsupported build output directory/);console.log('rejected');
    `)).toBe('rejected')
  })

  it('preserves historical package fixtures and rejects unrelated export, release and dependency changes', () => {
    const originalHash = createHash('sha256').update(read('tests/fixtures/documentation-scope/package.initial.json').replaceAll('\r\n', '\n')).digest('hex')
    const product = json('package.json')
    expect(() => assertDocumentationPackage(JSON.stringify(product), originalHash)).not.toThrow()
    for (const change of [
      { ...product, exports: { ...product.exports, './unapproved': './unapproved.js' } },
      { ...product, tremplinMigration: { ...product.tremplinMigration, releaseBlocked: false } },
      { ...product, devDependencies: { ...product.devDependencies, unapproved: '1.0.0' } }
    ]) expect(() => assertDocumentationPackage(JSON.stringify(change), originalHash)).toThrow()
  })
})
