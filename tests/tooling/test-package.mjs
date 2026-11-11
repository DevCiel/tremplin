import { execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { isAbsolute, join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { compileString } from 'sass'
import { JSDOM } from 'jsdom'
import { build } from 'esbuild'
import ts from 'typescript-bootstrap'
import { isCoreArchivePath } from './lib/core-package-scope.mjs'
import { createHash } from 'node:crypto'

const root = process.cwd()
const npmCli = process.env.npm_execpath
if (!npmCli) throw new Error('npm_execpath is required to validate the package')
const temporaryParent = resolve(tmpdir())
const temporary = await mkdtemp(join(temporaryParent, 'tremplin-consumer-'))
const runNpm = (arguments_, options = {}) => execFileSync(process.execPath, [npmCli, ...arguments_], {timeout:120_000,maxBuffer:8*1024*1024,...options})

try {
  const packed = JSON.parse(runNpm(['pack', '--json', '--pack-destination', temporary], { cwd: root, encoding: 'utf8' }))
  const archive = join(temporary, packed[0].filename)
  const consumer = join(temporary, 'consumer')
  runNpm(['install', '--ignore-scripts', '--no-audit', '--no-fund', '--fetch-retries=0', '--fetch-timeout=30000', '--prefix', consumer, archive], {
    cwd: root,
    stdio: 'pipe'
  })

  const installed = join(consumer, 'node_modules', 'tremplin')
  const manifest = JSON.parse(await readFile(join(installed, 'package.json'), 'utf8'))
  const sourceManifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
  if (manifest.version !== sourceManifest.version) throw new Error(`Installed unexpected version ${manifest.version}`)
  assert.deepEqual(manifest.exports, sourceManifest.exports, 'Tarball changed public package exports')
  const pin = JSON.parse(await readFile(join(root,'metadata/bootstrap6-reference.json'),'utf8'))
  const license = await readFile(join(root,'artifacts/bootstrap6-reference',pin.commit,'LICENSE'))
  assert((await readFile(join(installed,'THIRD_PARTY_NOTICES.txt'),'utf8')).includes(license.toString()), 'Tarball lost pinned upstream attribution')
  assert((await readFile(join(installed,'dist/THIRD_PARTY_NOTICES.txt'),'utf8')).includes(license.toString()), 'Distribution lost pinned upstream attribution')
  assert(!existsSync(join(installed,'LICENSE.bootstrap'))&&!existsSync(join(installed,'dist/LICENSE.bootstrap')),'Retired duplicate notice was packaged')
  for(const file of ['dist/LICENSE','dist/THIRD_PARTY_NOTICES.txt']) assert(existsSync(join(installed,file)),'Missing notice: '+file)
  assert(!existsSync(join(installed,'dist/vendor')), 'Private demo dependencies must not enter the core distribution')
  for (const file of ['CHANGELOG.md', 'dist/js/tremplin.js', 'dist/js/tremplin.bundle.min.js', 'js/dist/button.js', 'js/dist/chips.js', 'js/dist/nav-overflow.js', 'js/dist/otp-input.js', 'js/dist/range.js', 'js/dist/strength.js', 'js/dist/menu.js', 'js/dist/scrollspy.js', 'dist/css/tremplin-grid.min.css', 'src/scss/tremplin.scss', 'src/scss/_config.scss', 'src/scss/_menu.scss', 'src/scss/buttons/_button.scss', 'src/scss/content/_reboot.scss', 'src/scss/forms/_form-control.scss', 'src/scss/layout/_grid.scss']) {
    if (!existsSync(join(installed, file))) throw new Error(`Published package is missing ${file}`)
  }
  const coreScope = JSON.parse(await readFile(join(root, 'metadata/core-package-scope.json'), 'utf8'))
  const coreAudit = JSON.parse(await readFile(join(root, 'artifacts/bootstrap-core-audit.json'), 'utf8'))
  assert.equal(coreAudit.modules.length, 137)
  for (const entry of coreAudit.modules) assert((await readFile(join(installed, entry.local))).equals(await readFile(join(root, entry.local))), 'Core source missing or changed in archive: ' + entry.local)
  assert.equal(packed[0].files.filter(({path: file}) => file.startsWith('js/dist/')).length, 140, 'Core archive must include all canonical modules, declarations and maps')
  for (const {path: file} of packed[0].files) {
    assert(isCoreArchivePath(file), 'Core tarball contains optional or obsolete output: ' + file)
  }
  const integrity = JSON.parse(await readFile(join(installed, 'dist/integrity.json'), 'utf8'))
  assert.equal(integrity.algorithm, 'sha384')
  assert.equal(integrity.version, manifest.version)
  for (const [file, expected] of Object.entries(integrity.assets)) {
    assert(isCoreArchivePath('dist/' + file), 'Integrity manifest advertises excluded output: ' + file)
    const bytes = await readFile(join(installed, 'dist', file))
    assert.equal(bytes.length, expected.bytes)
    assert.equal('sha384-' + createHash('sha384').update(bytes).digest('base64'), expected.integrity)
  }
  for (const {path: file} of packed[0].files.filter(({path: file}) => /^dist\/.*\.(?:css|js|cjs|svg)$/.test(file))) assert(file.slice(5) in integrity.assets, 'Core asset lacks integrity metadata: ' + file)
  for (const peer of coreScope.removedOptionalPeers) assert(!(peer in (manifest.peerDependencies ?? {})), 'Optional peer remains: ' + peer)
  for (const obsolete of ['src/scss/_maps.scss', 'src/scss/_variables.scss']) {
    if (existsSync(join(installed, obsolete))) throw new Error(`Published package contains obsolete ${obsolete}`)
  }
  // Retirement records belong to the QA host, not the consumer archive.
  const retirement = JSON.parse(await readFile(join(root, 'metadata/asset-retirement.json'), 'utf8'))
  assert.deepEqual(packed[0].files.filter(({path: file}) => file.startsWith('metadata/')).map(({path: file}) => file).sort(), ['metadata/api.json','metadata/public-api.json'])
  for (const obsolete of retirement.sourceTargets) {
    if (existsSync(join(installed, obsolete))) throw new Error(`Published package contains retired ${obsolete}`)
  }
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://example.test/' })
  const css = await readFile(join(installed, 'dist/css/tremplin.css'), 'utf8')
  const icon = await readFile(join(installed, 'dist/icons/datepicker-chevron.svg'), 'utf8')
  if (!css.includes('url("../icons/datepicker-chevron.svg")') || !icon.includes('viewBox="0 0 24 24"')) throw new Error('Installed CSS lost its same-origin calendar SVG dependency')
  if (icon !== await readFile(join(root, 'icons/ui/datepicker-chevron.svg'), 'utf8')) throw new Error('Installed calendar SVG differs from its verified source')
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    Document: dom.window.Document,
    Node: dom.window.Node,
    Element: dom.window.Element,
    HTMLElement: dom.window.HTMLElement,
    Event: dom.window.Event,
    CustomEvent: dom.window.CustomEvent
  })
  const module = await import(pathToFileURL(join(installed, 'js/dist/index.js')).href)
  if (module.Dialog.VERSION !== manifest.version) throw new Error('Installed JavaScript version does not match package metadata')
  const installedApi = JSON.parse(await readFile(join(installed,'metadata/api.json'),'utf8'))
  const coreNames = installedApi.components.filter(component=>component.name!=='command-palette').map(component=>component.className).sort()
  const coreComponents = installedApi.components.filter(component=>component.name!=='command-palette').map(({name,className})=>({name,className}))
  assert.equal(coreNames.length,20)
  assert.deepEqual(Object.keys(module).sort(),coreNames,'Installed root exports do not match the twenty core plugins')
  for(const component of coreComponents) {
    const focused=await import(pathToFileURL(join(installed,'js/dist',component.name+'.js')).href)
    assert.equal(module[component.className],focused.default,'ESM component identity differs: '+component.name)
  }
  const esmButton = await import(pathToFileURL(join(installed,'js/dist/button.js')).href)
  assert.equal(module.Button,esmButton.default,'Installed ESM root/component class identity differs')
  document.body.innerHTML='<button id="esm-button" type="button">Toggle</button>'
  const esmInstance=module.Button.getOrCreateInstance('#esm-button')
  assert.equal(esmButton.default.getInstance('#esm-button'),esmInstance,'Installed ESM instance cache is duplicated')
  esmInstance.dispose()
  // Resolve bare ESM package imports from a real consumer entry, not the host repo.
  const probe=await readFile(join(root,'tests/package/esm-consumer.mjs'),'utf8')
  await writeFile(join(consumer,'esm-probe.mjs'),probe.replace("'__DOM_HOST__'",JSON.stringify(pathToFileURL(join(root,'node_modules/jsdom/lib/api.js')).href)).replace("'__COMPONENTS__'",JSON.stringify(JSON.stringify(coreComponents))))
  const esmProbe=JSON.parse(execFileSync(process.execPath,[join(consumer,'esm-probe.mjs')],{cwd:consumer,encoding:'utf8',timeout:30_000}))
  assert.equal(esmProbe.plugins,20)
  assert.equal(esmProbe.version,manifest.version)
  const bundledDom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://example.test/bundle/'})
  Object.assign(globalThis,{window:bundledDom.window,document:bundledDom.window.document,Document:bundledDom.window.Document,Node:bundledDom.window.Node,Element:bundledDom.window.Element,HTMLElement:bundledDom.window.HTMLElement,Event:bundledDom.window.Event,CustomEvent:bundledDom.window.CustomEvent})
  const bundled=await import(pathToFileURL(join(installed,'dist/js/tremplin.bundle.min.js')).href)
  assert.deepEqual(Object.keys(bundled).sort(),coreNames,'Installed bundle lost ES module exports')
  assert.equal(bundled.Dialog.VERSION,manifest.version)
  assert.equal(Object.hasOwn(window,'TremplinFramework'),false,'Public ESM bundle created a global')
  bundledDom.window.close()
  const requireFromConsumer = createRequire(join(consumer, 'package.json'))
  const strictCjsDom = new JSDOM('<!doctype html><html><body><button id="strict-button"></button></body></html>', { url: 'https://example.test/strict-cjs/' })
  Object.assign(globalThis, { window: strictCjsDom.window, document: strictCjsDom.window.document, Document: strictCjsDom.window.Document, Node: strictCjsDom.window.Node, Element: strictCjsDom.window.Element, HTMLElement: strictCjsDom.window.HTMLElement, Event: strictCjsDom.window.Event, CustomEvent: strictCjsDom.window.CustomEvent })
  const strictCjs = requireFromConsumer('tremplin')
  for(const component of coreComponents) assert.equal(strictCjs[component.className],requireFromConsumer('tremplin/'+component.name).default,'CJS component identity differs: '+component.name)
  const buttonModule = requireFromConsumer('tremplin/button')
  if (typeof buttonModule.default !== 'function' || strictCjs.Button !== buttonModule.default) throw new Error('Node require(ESM) root/component identity does not match')
  const strictButton = strictCjs.Button.getOrCreateInstance('#strict-button')
  if (buttonModule.default.getInstance('#strict-button') !== strictButton) throw new Error('Strict CommonJS instance cache is duplicated')
  strictButton.dispose()
  for (const specifier of ['tremplin/react', 'tremplin/vue', 'tremplin/icons', 'tremplin/icons/sprite', 'tremplin/themes/tremplin-ocean.css', 'tremplin/extensions/command-palette', 'tremplin/css/extensions', 'tremplin/css/extensions/min', 'tremplin/scss/extensions/index.scss', 'tremplin/js/dist/extensions/command-palette.js']) {
    assert.throws(() => requireFromConsumer.resolve(specifier), error => ['MODULE_NOT_FOUND', 'ERR_PACKAGE_PATH_NOT_EXPORTED'].includes(error.code), 'Optional package path still resolves: ' + specifier)
  }

  const result = compileString('@use "tremplin/src/scss/tremplin" as framework with ($spacer: 2rem); .consumer { --configured-spacer: #{framework.$spacer}; }', {
    loadPaths: [join(consumer, 'node_modules')]
  })
  if (!result.css.includes('--configured-spacer: 2rem') || result.css.includes('.command-palette')) throw new Error('Installed strict Sass configuration or optional-code isolation failed')
  assert(!existsSync(join(installed, 'dist/css/tremplin-extensions.css')), 'Optional CSS must not be installed with core')
  const compiled=await build({stdin:{contents:"import 'tremplin/css'; import Collapse from 'tremplin/collapse'; window.ConsumerCollapse=Collapse;",resolveDir:consumer},bundle:true,write:false,outfile:join(consumer,'output/app.js'),loader:{'.svg':'file'},format:'esm',platform:'browser',metafile:true,logLevel:'silent'})
  for(const extension of ['.js','.css','.svg']) assert(compiled.outputFiles.some(file=>file.path.endsWith(extension)),`Installed consumer lost ${extension} output`)
  const packageInputs=Object.keys(compiled.metafile.inputs).filter(file=>/node_modules[\\/]tremplin[\\/]/.test(file))
  assert(packageInputs.length>0,'Consumer compilation did not use the installed package')
  assert(!Object.keys(compiled.metafile.inputs).some(file=>file.startsWith('src/js/')),'Consumer fell back to host source')
  // No named export is consumed: production tree shaking must retain Data API
  // registration for both the root and focused native module entry points.
  for (const specifier of ['tremplin', 'tremplin/button']) {
    const registration = await build({stdin:{contents:`import ${JSON.stringify(specifier)};`,resolveDir:consumer},bundle:true,write:false,format:'iife',platform:'browser',minify:true,treeShaking:true,logLevel:'silent'})
    assert.equal(registration.warnings.length, 0, 'Side-effect import was discarded: ' + specifier)
    const dataDom = new JSDOM('<!doctype html><html><body><button data-trm-toggle="button" aria-pressed="false">Toggle</button></body></html>',{url:'https://consumer.test/',runScripts:'outside-only'})
    try {
      dataDom.window.eval(registration.outputFiles[0].text)
      const button = dataDom.window.document.querySelector('button')
      button.click()
      assert.equal(button.getAttribute('aria-pressed'), 'true', 'Bundled data API registration was lost: ' + specifier)
      button.click()
      assert.equal(button.getAttribute('aria-pressed'), 'false')
    } finally { dataDom.window.close() }
  }
  const typeRoots=[]
  for(const extension of ['mts','cts']) {
    const file=join(consumer,'types-consumer.'+extension)
    await writeFile(file,await readFile(join(root,'tests/package/types-consumer.'+extension),'utf8'))
    typeRoots.push(file)
  }
  const typeProgram=ts.createProgram(typeRoots,{noEmit:true,strict:true,noUncheckedIndexedAccess:true,skipLibCheck:false,types:[],target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,lib:['lib.es2022.d.ts','lib.dom.d.ts','lib.dom.iterable.d.ts']})
  const typeDiagnostics=ts.getPreEmitDiagnostics(typeProgram)
  if(typeDiagnostics.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(typeDiagnostics,{getCanonicalFileName:file=>file,getCurrentDirectory:()=>consumer,getNewLine:()=> '\n'}))
  if (packed[0].files.some(({ path }) => /(?:^|\/)(?:compat|legacy)(?:\/|\.)/.test(path))) throw new Error('Tarball contains a retired implementation')
  for (const specifier of ['tremplin/compat/legacy', 'tremplin/compat/legacy/button', 'tremplin/compat/legacy/scss']) {
    let resolved = false
    try { requireFromConsumer.resolve(specifier); resolved = true } catch (error) { if (!['MODULE_NOT_FOUND', 'ERR_PACKAGE_PATH_NOT_EXPORTED'].includes(error.code)) throw error }
    if (resolved) throw new Error('Retired package path still resolves: ' + specifier)
  }
  strictCjsDom.window.close()
  dom.window.close()
  await writeFile(join(root,'artifacts/package-qualification-report.json'),JSON.stringify({
    version:manifest.version, commit:pin.commit, archiveFiles:packed[0].files.length,
    corePlugins:coreNames.length, upstreamLicenseMatches:true,
    esm:{bareSpecifierProbe:esmProbe,rootComponentIdentity:true,componentsChecked:coreComponents.length,sharedInstanceCache:true},
    nodeRequireEsm:{bareSpecifierResolution:true,rootComponentIdentity:true,componentsChecked:coreComponents.length,sharedInstanceCache:true},
    optionalSeparation:{archivePathsRejected:true,packagePathsRejected:10,optionalPeersAbsent:true,requiredAssetException:coreScope.requiredAssetException,coreSourceFilesVerified:137,canonicalFilesVerified:140,integrityAssetsVerified:Object.keys(integrity.assets).length},
    types:{compiler:ts.version,nodeNextEsm:true,nodeNextCjs:true,skipLibCheck:false,negativeProbes:true,optionalImportsRejected:true,diagnostics:typeDiagnostics.length},
    sass:{customization:true,coreExcludesOptional:true},css:{sameOriginCalendarAsset:true,sourceSvgIdentity:true},
    consumerCompilation:{outputs:compiled.outputFiles.map(file=>relative(consumer,file.path).replaceAll('\\','/')),installedPackageInputs:packageInputs.length,hostSourceFallback:false,treeShakenDataApis:['tremplin','tremplin/button']},
    legacyPathsAbsent:true,published:false,releaseBlocked:sourceManifest.tremplinMigration.releaseBlocked
  },null,2)+'\n')
  console.log(`Installed and verified ${manifest.name}@${manifest.version} from its npm tarball.`)
} finally {
  const cleanupTarget=resolve(temporary), cleanupRelative=relative(temporaryParent,cleanupTarget)
  if (!cleanupRelative || cleanupRelative.startsWith('..') || isAbsolute(cleanupRelative) || !cleanupRelative.startsWith('tremplin-consumer-')) throw new Error('Refusing unsafe consumer cleanup')
  await rm(temporary, { recursive: true, force: true })
}
