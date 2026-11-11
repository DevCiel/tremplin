import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { compile } from 'sass'
import postcss from 'postcss'
import postcssConfig from '../../build/postcss.config.mjs'
import browserslist from 'browserslist'
import { transform, browserslistToTargets, Features } from 'lightningcss'
import { brandSource, gitBlobHash, moduleKind, productionPath, safeReferencePath } from '../../build/lib/tremplin-core.mjs'
import { loadSecurityRegistry, approvedSecuritySource } from '../../build/lib/tremplin-security.mjs'

const pin = JSON.parse(await readFile('metadata/bootstrap6-reference.json', 'utf8'))
const product = JSON.parse(await readFile('package.json', 'utf8'))
const registry = await loadSecurityRegistry(process.cwd(), pin.commit)
const cache = `artifacts/bootstrap6-reference/${pin.commit}`
const manifest = JSON.parse(await readFile(`${cache}/reference-manifest.json`, 'utf8'))
if (manifest.commit !== pin.commit) throw new Error('Stale CSS reference manifest')
const assembly = `artifacts/bootstrap6-css-check/${pin.commit}`
const sources = manifest.files.filter(entry => moduleKind(entry.path) === 'scss')
if (sources.length !== pin.expectedCoreModules.scss) throw new Error('Incomplete CSS reference')
const securityPatches = []
// Build expected CSS from a separate, verified reference assembly. Never edit
// the pristine cache or normalize away an arbitrary declaration difference.
for (const entry of sources) {
  safeReferencePath(entry.path)
  const bytes = await readFile(`${cache}/${entry.path}`)
  if (gitBlobHash(bytes) !== entry.sha) throw new Error(`Modified CSS reference: ${entry.path}`)
  const local = productionPath(entry.path)
  const accepted = approvedSecuritySource(local, brandSource(bytes.toString('utf8'), { version: product.version, upstreamVersion: pin.upstreamVersion }), registry)
  const target = path.join(assembly, local)
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, accepted.source)
  if (accepted.patch) securityPatches.push({ file: local, ...accepted.patch })
}
const tree = css => {
  const visit = node => {
    if (node.type === 'comment') return null
    const result = { type: node.type }
    for (const field of ['selector', 'name', 'params', 'prop', 'value', 'important']) if (node[field] !== undefined) result[field] = node[field]
    if (node.nodes) result.nodes = node.nodes.map(visit).filter(Boolean)
    return result
  }
  return JSON.stringify(visit(postcss.parse(css)))
}
const distributions = []
for (const suffix of ['', '-grid', '-reboot', '-utilities']) {
  const rawReference = compile(`${assembly}/src/scss/tremplin${suffix}.scss`).css
  const reference = (await postcss(postcssConfig().plugins).process(rawReference, { from: undefined, map: false })).css
  const actual = await readFile(`dist/css/tremplin${suffix}.css`, 'utf8')
  if (tree(actual) !== tree(reference)) throw new Error(`Production CSS differs beyond approved patches: ${suffix || 'full'}`)
  const minified=transform({filename:`tremplin${suffix}.css`,code:Buffer.from(reference),minify:true,targets:browserslistToTargets(browserslist()),exclude:Features.LightDark}).code.toString()
  if(tree(await readFile(`dist/css/tremplin${suffix}.min.css`,'utf8'))!==tree(minified)) throw new Error(`Minified production CSS differs from verified source and declared compiler: ${suffix || 'full'}`)
  const loaded = compile(`src/scss/tremplin${suffix}.scss`).loadedUrls
  if (loaded.some(url => url.href.includes('/extensions/'))) throw new Error('Default CSS imports extensions')
  distributions.push({ name: `tremplin${suffix}`, parity: true, minifiedParity: true })
}
for (const asset of registry.assets) {
  if (!(await readFile(asset.output)).equals(await readFile(asset.path))) throw new Error(`Built CSS asset differs: ${asset.output}`)
}
await writeFile('artifacts/bootstrap-production-css.json', JSON.stringify({ commit: pin.commit, distributions, securityPatches, comparison: 'Expanded and Lightning CSS-minified AST equality against independently reconstructed, hash-verified branded reference plus explicit security patches and declared PostCSS stages; no declaration filtering or optional imports.' }, null, 2) + '\n')
console.log('All four production CSS distributions match the verified pin plus explicit security patches; same-origin SVG verified, no optional imports.')
