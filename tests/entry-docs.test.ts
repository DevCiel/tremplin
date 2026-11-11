import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { frameworkVersion, installationManagers, localPackage, requiredPeers, starterHtml } from '../site/src/data/installation-examples'
import { gettingStartedGuides as guideMetadata, installationGuide as installationMetadata, starterHtml as sharedStarter } from '../site/src/data/getting-started-guides'
import { gettingStartedGuides, installationGuide } from './helpers/getting-started-contract'
import { guides } from '../site/src/data/guide-docs'
import { sassPin, ast, sheet } from './helpers/pinned-sass'

const read = (file: string) => readFileSync(file, 'utf8')
const dom = (source: string) => new DOMParser().parseFromString(source, 'text/html')
describe('homepage and installation contract', () => {
  it('verifies the immutable upstream install reference and preserves its section hierarchy', () => {
    const base = 'artifacts/bootstrap6-reference/' + sassPin.commit + '/'
    const file = 'site/src/content/docs/getting-started/install.mdx'
    const bytes = readFileSync(base + file)
    const manifest = JSON.parse(read(base + 'reference-manifest.json')) as {files:{path:string;sha:string}[]}
    expect(createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex')).toBe(manifest.files.find(item => item.path === file)!.sha)
    const upstream = [...bytes.toString().matchAll(/^## (.+)$/gm)].map(match => match[1])
    expect(installationGuide.sections.filter(section => section.level !== 3).map(section => section.heading)).toEqual(upstream)
    const subheads = [...bytes.toString().matchAll(/^### (.+)$/gm)].map(match => match[1])
    expect(installationGuide.sections.filter(section => section.level === 3).map(section => section.heading).slice(0, subheads.length)).toEqual(subheads)
    expect(installationGuide.reference!.url).toBe('https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/getting-started/install.mdx')
  })
  it('uses one guide and shared starter without changing the search identity', () => {
    expect(gettingStartedGuides[0]).toBe(installationGuide)
    expect(guideMetadata[0]).toBe(installationMetadata)
    expect(guides.find(item => item.slug === installationGuide.slug)).toBe(installationMetadata)
    expect(sharedStarter).toBe(starterHtml)
    expect(installationGuide.description).toBe('Install Tremplin step by step with local assets, an npm tarball, or published packages.')
    expect(installationGuide.sections).toHaveLength(14)
  })
  for (const [manager, command] of installationManagers) it(manager + ' installs the local version and both real peers', () => {
    expect(command).toContain(localPackage)
    expect(localPackage).toBe(`./vendor/tremplin-${frameworkVersion}.tgz`)
    expect(command).toContain(requiredPeers)
    expect(command).not.toContain('tremplin@')
    expect(requiredPeers).toBe('@floating-ui/dom vanilla-calendar-pro')
  })
  it('uses canonical classes and one browser build with coherent relative paths', () => {
    const doc = dom(starterHtml)
    expect(doc.documentElement.lang).toBe('en')
    expect(doc.querySelector('meta[name="viewport"]')).not.toBeNull()
    expect(doc.querySelector('link')!.getAttribute('href')).toBe('./dist/css/tremplin.min.css')
    expect(doc.querySelectorAll('script')).toHaveLength(1)
    expect(doc.querySelector('script')!.getAttribute('src')).toBe('./dist/js/tremplin.bundle.min.js')
    expect(doc.querySelector('script')!.hasAttribute('defer')).toBe(false)
    expect(doc.querySelector('script')!.getAttribute('type')).toBe('module')
    expect(doc.querySelectorAll('.btn, .btn-primary, [data-bs-toggle]')).toHaveLength(0)
    const css: string[] = []
    ast(sheet('tremplin')).walkRules(rule => { css.push(...rule.selectors) })
    for (const element of doc.querySelectorAll('[class]')) for (const name of element.classList) expect(css.some(selector => selector.includes('.' + name)), name).toBe(true)
    const button = doc.querySelector('button')!
    expect(button.getAttribute('aria-controls')).toBe('welcome')
    expect(doc.querySelector(button.getAttribute('data-trm-target')!)!.id).toBe('welcome')
  }, 30_000)
  it('keeps real download paths, complete integrity values and honest format/publication status', () => {
    const text = JSON.stringify(installationGuide)
    expect(text).toContain('unreleased')
    expect(text).toContain('Vanilla Calendar Pro are included')
    expect(text).toContain('All browser downloads are ES modules')
    expect(text).not.toContain('does not require Vanilla Calendar Pro')
    const manifest = JSON.parse(read('dist/integrity.json'))
    const cdn = installationGuide.sections.find(section => section.heading === 'CDN')!.code![0]!.source
    const doc = dom(cdn)
    for (const asset of doc.querySelectorAll('[integrity]')) {
      const pathname = new URL(asset.getAttribute('href') ?? asset.getAttribute('src')!).pathname
      const file = pathname.slice(pathname.indexOf('/dist/') + 6)
      expect(asset.getAttribute('integrity')).toBe(manifest.assets[file].integrity)
      expect(asset.getAttribute('crossorigin')).toBe('anonymous')
    }
    expect(doc.querySelector('script')!.getAttribute('src')).toContain('/js/tremplin.bundle.min.js')
    expect(text).not.toMatch(/gem install|composer require|Install-Package/)
  })
  it('bundles every documented application import using real package exports', () => {
    for (const sample of installationGuide.sections.flatMap(section => section.code ?? []).filter(sample => sample.language === 'js')) {
      // esbuild needs Node's own Uint8Array realm, not jsdom's DOM realm.
      const result = execFileSync(process.execPath, ['--input-type=module', '-e', "import {build} from 'esbuild'; import {readFileSync} from 'node:fs'; const result=await build({stdin:{contents:readFileSync(0,'utf8'),resolveDir:process.cwd()},bundle:true,write:false,outfile:'artifacts/entry-docs-compile.js',loader:{'.svg':'file'},platform:'browser',format:'esm',logLevel:'silent'}); console.log(JSON.stringify({errors:result.errors,outputs:result.outputFiles.map(file=>file.path)}))"], { input: sample.source, encoding: 'utf8', timeout: 15_000 })
      const compiled = JSON.parse(result) as {errors:unknown[];outputs:string[]}
      expect(compiled.errors).toEqual([])
      expect(compiled.outputs.some(file=>file.endsWith('.js'))).toBe(true)
      if(sample.source.includes('tremplin/css')) {
        expect(compiled.outputs.some(file=>file.endsWith('.css'))).toBe(true)
        expect(compiled.outputs.some(file=>file.endsWith('.svg'))).toBe(true)
      }
    }
    expect(installationGuide.sections[1]!.code![2]!.source).toContain("import Collapse from 'tremplin/collapse'")
  })
  it('documents website startup without removing the publishing block', () => {
    const section = installationGuide.sections.find(section => section.heading === 'Build from source')!
    expect(section.code!.at(-1)!.source).toBe('npm run site:prepare\nnpx astro dev --host 127.0.0.1 --port 4321')
    expect(section.callout).toContain('npm.cmd')
    expect(section.callout).toContain('npx.cmd')
    const manifest = JSON.parse(read('package.json'))
    expect(manifest.tremplinMigration.releaseBlocked).toBe(true)
    const home = read('site/src/pages/index.astro')
    expect(home).toContain('Development preview')
    expect(home).toContain('Unreleased preview')
    expect(home).not.toContain('npm i tremplin@')
    expect(home).not.toContain('All releases')
    expect(home).toContain('.btn-solid')
  })
  it('checks standard external peers and the self-contained ESM bundle', () => {
    const graph = JSON.parse(read('artifacts/core-build-graph.json')) as {graphs:{format:string;name?:string;inputs:Record<string,unknown>}[]}
    for(const name of ['tremplin.min','tremplin.bundle.min']) {
      const build=graph.graphs.find(entry=>entry.name===name)!
      expect(build.format).toBe('esm')
      const inputs=Object.keys(build.inputs)
      expect(inputs.some(file=>file.includes('node_modules/@floating-ui/'))).toBe(name==='tremplin.bundle.min')
      expect(inputs.some(file=>file.includes('node_modules/vanilla-calendar-pro/'))).toBe(name==='tremplin.bundle.min')
      expect(inputs.some(file=>file.startsWith('src/compat/'))).toBe(false)
    }
  })
})
