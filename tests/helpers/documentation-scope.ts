import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import ts from 'typescript-bootstrap'
import { createRequire } from 'node:module'
import { compile } from 'sass'
import postcss from 'postcss'
import { relocateToolPaths, restoreToolPaths } from '../tooling/lib/tool-paths.mjs'
import {brandTooling,restoreBrandedTooling,toolingRename} from '../tooling/lib/tremplin-tooling.mjs'
import { assertDocumentationStylesheet, projectSiteScripts } from '../tooling/lib/site-architecture.mjs'
import { historicalDocumentationSource } from '../tooling/lib/getting-started-mdx.mjs'

const read=(file:string)=>readFileSync(file,'utf8')
const json=(file:string)=>JSON.parse(read(file))
const approvedCompilerCss=new Map<string,{raw:string;expected:string}>()
const assertSyntax=(source:string,file:string)=>assert.deepEqual(ts.transpileModule(source,{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).diagnostics,[],'Invalid JavaScript: '+file)
const parse=(file:string)=>{
  const source=ts.createSourceFile(file,read(file),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS)
  assertSyntax(read(file),file)
  assert(ts.isExternalModule(source),'Expected ES module: '+file)
  return source
}

/** Compare the entire manifest with the original committed package, allowing
 * only the approved repository URL and explicit clean-checkout prerequisites.
 * Do not omit fields or refresh historical hashes to accept future changes. */
export function assertDocumentationPackage(source:string,expectedHash:string):void {
  const original=read('tests/fixtures/documentation-scope/package.initial.json').replaceAll('\r\n','\n')
  assert.equal(createHash('sha256').update(original).digest('hex'),expectedHash,'Historical package baseline changed')
  const expected=JSON.parse(original)
  expected.repository.url='https://github.com/DevCiel/tremplin.git'
  // User-approved tooling relocation: change only command paths, not script
  // names, arguments, dependencies, exports, or the immutable baseline itself.
  for(const name of Object.keys(expected.scripts))expected.scripts[name]=expected.scripts[name].replaceAll('scripts/','build/')
  const steps:string[]=expected.scripts.check.split(' && ')
  assert.deepEqual(steps.slice(0,3),['npm run typecheck','npm run test:typecheck-boundaries','npm run build'])
  steps.splice(1,2,'npm run build','npm run test:typecheck-boundaries')
  // Unit scope checks inspect the documentation-owned ESM graph. Generate it
  // before npm test instead of depending on a previous local site build.
  steps.splice(steps.indexOf('npm test'),0,'npm run site:prepare')
  expected.scripts.check=steps.join(' && ')
  // Reviewed local compilation batch: retain the immutable historical package
  // and apply only explicit additions/replacements, not a whole-file refresh.
  const tooling=json('metadata/core-delivery-tooling.json')
  assert.equal(tooling.phase,'compilation-tooling-and-canonical-modules')
  assert.deepEqual(Object.keys(tooling.dependencyAdditions).sort(),['autoprefixer','browserslist','globby','lightningcss','postcss-prefix-custom-properties','rolldown','terser'])
  assert.deepEqual(Object.keys(tooling.scriptAdditions).sort(),['build:core-preview','js-compile-plugins','js-emit-types'])
  assert.deepEqual(Object.keys(tooling.scriptReplacements),['build:js','build'])
  assert.equal(tooling.publicExportChanges,false)
  assert.equal(tooling.defaultBrowserCompilerChanged,false)
  for(const [name,version]of Object.entries(tooling.dependencyAdditions)) {
    assert.equal(expected.devDependencies[name],undefined,'Dependency is not a reviewed addition: '+name)
    expected.devDependencies[name]=version
  }
  for(const [name,command]of Object.entries(tooling.scriptAdditions)) {
    assert.equal(expected.scripts[name],undefined,'Script is not a reviewed addition: '+name)
    expected.scripts[name]=command
  }
  for(const [name,change]of Object.entries(tooling.scriptReplacements) as [string,{before:string;after:string}][]) {
    assert.equal(expected.scripts[name],change.before,'Script replacement origin differs: '+name)
    expected.scripts[name]=change.after
  }
  const entry=json('metadata/core-entrypoint-transition.json')
  assert.equal(entry.phase,'canonical-esm-entrypoints')
  assert.deepEqual(entry.removedFields,['main','module','types'])
  assert.deepEqual(Object.keys(entry.before).sort(),['exports','files','main','module','sideEffects','types'])
  assert.deepEqual(Object.keys(entry.after).sort(),['exports','files','sideEffects'])
  for(const [field,value]of Object.entries(entry.before))assert.deepEqual(expected[field],value,'Entry transition origin changed: '+field)
  const files=expected.files.slice()
  assert(!files.includes('js/dist'))
  files.splice(files.indexOf('dist')+1,0,'js/dist')
  assert.deepEqual(entry.after.files,files)
  const sideEffects=expected.sideEffects.slice()
  assert(!sideEffects.includes('./js/dist/**/*.js'))
  sideEffects.splice(sideEffects.indexOf('./src/js/**/*.ts')+1,0,'./js/dist/**/*.js')
  assert.deepEqual(entry.after.sideEffects,sideEffects)
  const projected=JSON.parse(JSON.stringify(expected.exports))
  projected['.']={types:'./js/dist/index.d.ts',default:'./js/dist/index.js'}
  projected['./*']={types:'./js/dist/*.d.ts',default:'./js/dist/*.js'}
  projected['./js/dist/*']='./js/dist/*'
  assert.deepEqual(entry.after.exports,projected,'Unexpected entry-point projection')
  Object.assign(expected,entry.after)
  for(const field of entry.removedFields)delete expected[field]
  const scope=json('metadata/core-package-scope.json')
  assert.equal(scope.phase,'core-package-optional-product-separation')
  assert.deepEqual(scope.removedExports,['./css/extensions','./css/extensions/min','./icons','./icons/sprite','./themes/*','./react','./vue','./extensions/*'])
  for(const specifier of scope.removedExports){assert(specifier in expected.exports);delete expected.exports[specifier]}
  assert.deepEqual(scope.removedOptionalPeers,['react','vue'])
  assert.deepEqual(Object.keys(expected.peerDependenciesMeta).sort(),['react','vue'])
  for(const peer of scope.removedOptionalPeers){assert.equal(expected.peerDependenciesMeta[peer].optional,true);delete expected.peerDependencies[peer]}
  delete expected.peerDependenciesMeta
  expected.files=scope.files.slice()
  expected.sideEffects=expected.sideEffects.filter((pattern:string)=>!['./src/runtime/*.ts','./dist/js/**/*.cjs','./dist/cjs/**/*.js'].includes(pattern))
  const cutover=json('metadata/compiler-cutover.json')
  assert.equal(cutover.phase,'default-core-compiler-cutover')
  assert.deepEqual(Object.keys(cutover.scriptReplacements).sort(),['build','build:core-preview','build:css','build:js','build:js:browser','build:manifest','site:prepare'])
  assert.deepEqual(Object.keys(cutover.scriptRemovals),['build:css:extensions'])
  for(const [name,change]of Object.entries(cutover.scriptReplacements) as [string,{before:string;after:string}][]){assert.equal(expected.scripts[name],change.before);expected.scripts[name]=change.after}
  for(const [name,before]of Object.entries(cutover.scriptRemovals)){assert.equal(expected.scripts[name],before);delete expected.scripts[name]}
  for(const name of Object.keys(expected.scripts))expected.scripts[name]=relocateToolPaths(expected.scripts[name])
  const maintenance=json('metadata/core-maintenance-tools.json')
  assert.equal(maintenance.phase,'safe-local-maintenance-tools')
  assert.deepEqual(maintenance.dependencyAdditions,{'html-validate':'11.17.0'})
  assert.deepEqual(maintenance.scriptAdditions,{
    bundlewatch:'node build/bundlewatch-table.mjs','bundlewatch:fix':'node build/bundlewatch-fix.mjs',
    'change-version':'node build/change-version.mjs','check:unused-imports':'node build/check-unused-imports.mjs src/scss',
    'clean:astro':'node build/clean-astro.mjs','docs:prep':'node tests/tooling/prepare-docs-review.mjs',
    'validate:html':'node build/html-validate.mjs'
  })
  for(const [name,version]of Object.entries(maintenance.dependencyAdditions)){assert.equal(expected.devDependencies[name],undefined);expected.devDependencies[name]=version}
  for(const [name,command]of Object.entries(maintenance.scriptAdditions)){assert.equal(expected.scripts[name],undefined);expected.scripts[name]=command}
  const stages=json('metadata/npm-build-stages.json')
  assert.equal(stages.phase,'npm-build-stages-and-example-tools')
  assert.deepEqual(stages.dependencyAdditions,{sharp:'0.35.5',fflate:'0.8.3'})
  assert.deepEqual(Object.keys(stages.scriptReplacements).sort(),['build:core-preview','build:css','build:css:assets','build:js','build:js:browser','build:manifest','clean','site:prepare'])
  assert.deepEqual(Object.keys(stages.scriptAdditions).sort(),['css','css-compile','css-docs','css-minify','css-prefix','dist','js','js-build','js-compile','js-compile-bundle','js-compile-standalone','js-minify','js-minify-bundle','js-minify-standalone','release-zip-examples','screenshots'])
  assert.equal(stages.publicExportsChanged,false)
  assert.equal(stages.coreSourceChanged,false)
  for(const [name,change]of Object.entries(stages.scriptReplacements) as [string,{before:string;after:string}][]){assert.equal(expected.scripts[name],change.before);expected.scripts[name]=change.after}
  for(const [name,command]of Object.entries(stages.scriptAdditions)){assert.equal(expected.scripts[name],undefined);expected.scripts[name]=command}
  for(const [name,version]of Object.entries(stages.dependencyAdditions)){assert.equal(expected.devDependencies[name],undefined);expected.devDependencies[name]=version}
  expected.scripts=Object.fromEntries(Object.entries(expected.scripts).map(([name,command])=>[toolingRename.commandRenames[name]??name,brandTooling(command as string)]))
  const branding=json('metadata/tremplin-branding.json')
  assert.equal(branding.phase,'tremplin-branding-and-notice-packaging')
  assert.deepEqual(branding.consumerMetadata,['metadata/api.json','metadata/public-api.json'])
  const packagedFiles=expected.files.flatMap((file:string)=>file==='metadata'?branding.consumerMetadata:file==='LICENSE.bootstrap'?['THIRD_PARTY_NOTICES.txt']:[file])
  assert.deepEqual(branding.filesAfter,packagedFiles,'Unreviewed package inventory change')
  expected.files=packagedFiles
  expected.scripts=projectSiteScripts(expected.scripts)
  assert.deepEqual(JSON.parse(source),expected,'Package changes exceed the reviewed repository, CI-order, compilation-tooling and entry-point changes')
}

/** Allow only the server-command relocation; screenshot settings, ports,
 * worker count, baselines and tolerances remain protected by the old hash. */
export function assertDocumentationVisualConfig(source:string,expectedHash:string):void {
  const current=source.replaceAll('\r\n','\n')
  const command="command: 'node tests/tooling/serve.mjs site-dist'"
  assert.equal(current.split(command).length,2,'Expected exactly one relocated server command')
  const historical=current.replace(command,"command: 'node scripts/serve.mjs site-dist'")
  assert.equal(createHash('sha256').update(historical).digest('hex'),expectedHash,'Visual settings changed beyond the approved tooling path')
}

/** Preserve the old fixture hashes. Only these eight reviewed source/derived
 * inputs may advance to their exact recorded target bytes for this pin update.
 * Source gates independently check the Git-verified upstream plus patch policy. */
export function assertReviewedUpstreamInput(file:string,before:string,bytes:Uint8Array):void {
  const allowed=new Set(['metadata/strict-api-baseline.json','metadata/bootstrap6-security-patches.json','metadata/bootstrap6-reference.json','metadata/documentation-tokens.json','dist/css/tremplin.css','src/js/dialog-base.ts','src/scss/forms/_switch.scss','src/scss/_root.scss'])
  assert(allowed.has(file),'Unreviewed historical scope change: '+file)
  const transition=json('metadata/upstream-transition-9062790.json')
  assert.equal(transition.from,'3b7f32318876bbd3c9cc14d3f891d744f39cd538')
  assert.equal(transition.to,'9062790fdb2379593a2973416dc5a3bfb203e4e3')
  assert.equal(transition.to,json('metadata/bootstrap6-reference.json').commit)
  const record=transition.historicalScopeUpdates.find((entry:{file:string})=>entry.file===file)
  assert(record,'Missing reviewed transition: '+file)
  assert.equal(record.before,before,'Historical input hash does not match the reviewed origin')
  if(file==='dist/css/tremplin.css') {
    // The reviewed compiler adds only the configured prefixing stage. Verify
    // every independent source before comparing full ASTs; never filter rules.
    const require=createRequire(import.meta.url),core=require('../../build/lib/tremplin-core.mjs'),security=require('../../build/lib/tremplin-security.mjs')
    const pin=json('metadata/bootstrap6-reference.json'),product=json('package.json'),registry=json('metadata/bootstrap6-security-patches.json')
    const base='artifacts/bootstrap6-reference/'+pin.commit+'/',assembly='artifacts/bootstrap6-css-check/'+pin.commit+'/'
    const manifest=json(base+'reference-manifest.json')
    const fingerprint=createHash('sha256').update(read('build/postcss.config.mjs')).update(read('.browserslistrc'))
    for(const entry of manifest.files.filter((entry:{path:string})=>core.moduleKind(entry.path)==='scss')) {
      const raw=readFileSync(base+entry.path)
      assert.equal(core.gitBlobHash(raw),entry.sha)
      const local=core.productionPath(entry.path),expected=security.approvedSecuritySource(local,core.brandSource(raw.toString(),{version:product.version,upstreamVersion:pin.upstreamVersion}),registry).source
      assert.equal(read(assembly+local),expected,'Modified independent CSS assembly')
      fingerprint.update(expected)
    }
    const config=require('../../build/postcss.config.mjs').default
    // Revalidate every source on each call, but avoid recompiling the identical
    // verified assembly for each negative probe inside a five-second test.
    const key=fingerprint.digest('hex')
    if(!approvedCompilerCss.has(key)) {
      const raw=compile(assembly+'src/scss/tremplin.scss').css
      approvedCompilerCss.set(key,{raw,expected:postcss(config().plugins).process(raw,{from:undefined,map:false}).css+'\n/*# sourceMappingURL=tremplin.css.map */'})
    }
    const cached=approvedCompilerCss.get(key)!
    const rawCss=cached.raw
    assert.equal(rawCss.split('(https://gettremplin.com)').length,2,'Expected one reviewed banner homepage')
    const historical=Buffer.from(rawCss.replace('(https://gettremplin.com)','(https://getbootstrap.com/)')+'\n\n/*# sourceMappingURL=tremplin.css.map */\n')
    assert.equal(createHash('sha256').update(historical).digest('hex'),record.after,'Historical Sass CLI hash relationship changed')
    assert.equal(Buffer.from(bytes).toString(),cached.expected,'Production CSS differs from verified sources and exact declared compiler serialization')
  } else assert.equal(createHash('sha256').update(bytes).digest('hex'),record.after,'Input differs from the reviewed upstream transition: '+file)
}

/** Historical batches predate approved ESM delivery and tooling changes.
 * Keep original hashes; verify each narrowly defined follow-up contract. */
export function assertDocumentationScope(inputs:Record<string,string>):void {
  for(const [file,hash]of Object.entries(inputs)) {
    if(file==='package.json') {
      assertDocumentationPackage(read(file),hash)
    } else if(file==='playwright.docs-visual.config.ts') {
      assertDocumentationVisualConfig(read(file),hash)
    } else if(file==='dist/js/tremplin.js') {
      parse(file)
      const graph=json('artifacts/core-build-graph.json')
      assert.equal(graph.commit,json('metadata/bootstrap6-reference.json').commit)
      const imports=Object.values(graph.defaultGraph.outputs as Record<string,{imports:{external?:boolean;path:string}[]}>).flatMap(output=>output.imports.filter(item=>item.external).map(item=>item.path))
      assert.deepEqual([...new Set(imports)].sort(),['@floating-ui/dom','vanilla-calendar-pro'])
      assert(!read(file).includes('TremplinFramework'),'Public root must not create a global')
    } else if(file==='site/public/js/tremplin-command-palette.min.js') {
      const palette=parse(file),core=parse('site/public/js/tremplin-docs.min.js')
      const dependencies=(source:ts.SourceFile)=>source.statements.filter(ts.isImportDeclaration).map(statement=>(statement.moduleSpecifier as ts.StringLiteral).text)
      assert(dependencies(palette).some(name=>dependencies(core).includes(name)&&/^\.\/docs-chunk-/.test(name)),'Documentation entries must share the same core chunk')
      assert(read(file).includes('CommandPalette'),'Missing optional palette export')
    } else if(/^\.github\/workflows\/(?:ci|docs|release)\.yml$/.test(file)) {
      assert.equal(createHash('sha256').update(restoreBrandedTooling(read(file)).replaceAll('\r\n','\n')).digest('hex'),hash,'Workflow changed beyond the approved tool identity')
    } else if(/^playwright\..*\.config\.ts$/.test(file)) {
      assert.equal(createHash('sha256').update(restoreToolPaths(read(file)).replaceAll('\r\n','\n')).digest('hex'),hash,'Playwright settings changed beyond tool paths: '+file)
    } else if(file.startsWith('site/src/data/')) {
      const source=historicalDocumentationSource(file).replaceAll('\r\n','\n'),actual=createHash('sha256').update(source).digest('hex')
      if(actual===hash)continue
      const branding=json('metadata/tremplin-documentation-branding.json')
      assert.equal(branding.phase,'tremplin-documentation-branding')
      const record=branding.changes.find((entry:{file:string})=>entry.file===file)
      assert(record,'Unreviewed documentation branding input: '+file)
      assert.equal(record.before,hash,'Unexpected historical documentation origin: '+file)
      assert.equal(actual,record.after,'Documentation changed beyond its reviewed branding patch: '+file)
    } else {
      if(file==='src/scss/_banner.scss') {
        const source=read(file)
        assert.equal(source.split('(https://gettremplin.com)').length,2,'Expected exactly one reviewed banner homepage')
        const historical=source.replace('(https://gettremplin.com)','(https://getbootstrap.com/)')
        assert.equal(createHash('sha256').update(historical).digest('hex'),hash,'Banner changed beyond its product homepage comment')
        continue
      }
      const current=file==='LICENSE.bootstrap'?'licenses/third-party-code.txt':file.startsWith('dist/css/tremplin-extensions')?'artifacts/documentation-assets/'+file:file
      const bytes=readFileSync(current)
      if(file==='site/public/docs.css') { assertDocumentationStylesheet(bytes,hash); continue }
      if(createHash('sha256').update(bytes).digest('hex')!==hash)assertReviewedUpstreamInput(file,hash,bytes)
    }
  }
}

export function assertDemoModule(source:string,specifier:string):void {
  const module=ts.createSourceFile('demo.mjs',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS)
  assertSyntax(source,'demo.mjs')
  assert(ts.isExternalModule(module))
  assert(module.statements.some(statement=>ts.isImportDeclaration(statement)&&(statement.moduleSpecifier as ts.StringLiteral).text===specifier))
  assert(!source.includes('TremplinFramework'),'Copied module must use imports, not a global')
}
