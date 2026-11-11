import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { compileString } from 'sass'
import postcss from 'postcss'
import { documentationTokenSources } from './lib/documentation-token-sources.mjs'

const args = process.argv.slice(2)
if (args.some(arg => arg !== '--check')) throw new Error('Only --check is supported')
const pin = JSON.parse(await readFile('metadata/bootstrap6-reference.json', 'utf8'))
const components = {}
for (const [name, sources] of Object.entries(documentationTokenSources)) {
  const variables = new Map()
  const unemittedVariables = []
  const inputs = []
  for (const source of sources) {
    const bytes = await readFile(source)
    inputs.push({ path: source, sha256: createHash('sha256').update(bytes).digest('hex') })
    // Inspect the evaluated public Sass token maps, not textual token-name
    // guesses. Imports may emit component CSS; only our marker rules are read.
    const css = compileString(`@use 'sass:meta'; @use 'sass:string'; @use '${source}' as target;
      @each $map-name, $map in meta.module-variables('target') {
        @if meta.type-of($map) == 'map' and string.index($map-name, 'tokens') {
          .documentation-token-defaults-#{$map-name} {
            @each $property, $value in $map {
              @if string.index(meta.inspect($property), '--trm-') == 1 {
                #{$property}: #{$value};
              }
            }
          }
        }
      }`, { loadPaths: [process.cwd()] }).css
    const root = postcss.parse(css)
    const prefix = '.documentation-token-defaults-'
    const emitted = new Set()
    root.walkDecls(declaration => {
      let parent = declaration.parent
      while (parent) {
        if (parent.type === 'rule' && parent.selector.startsWith(prefix)) return
        parent = parent.parent
      }
      if (declaration.prop.startsWith('--trm-')) emitted.add(declaration.prop)
    })
    root.walkRules(rule => {
      if (!rule.selector.startsWith(prefix)) return
      const map = rule.selector.slice(prefix.length)
      rule.walkDecls(declaration => {
        if (!emitted.has(declaration.prop)) {
          unemittedVariables.push({ name: declaration.prop, map, source })
          return
        }
        if (!variables.has(declaration.prop)) variables.set(declaration.prop, { name: declaration.prop, defaultValue: declaration.value, map, source })
      })
    })
  }
  components[name] = { sources: inputs, variables: [...variables.values()], unemittedVariables }
}
const output = JSON.stringify({ format: 'tremplin-documentation-token-maps-v1', referenceCommit: pin.commit, definition: 'Evaluated public component Sass token maps, limited to properties actually emitted by that module. Declared but unemitted map entries are recorded separately, not advertised as runtime tokens. Not a compatibility API baseline or a claim that other documentation is current.', components }, null, 2) + '\n'
const target = 'metadata/documentation-tokens.json'
if (args.includes('--check')) {
  if (await readFile(target, 'utf8') !== output) throw new Error('Documentation token catalog is stale. Review the Sass changes and run npm run build:docs-tokens.')
} else await writeFile(target, output)
console.log(`${args.includes('--check') ? 'Verified' : 'Generated'} evaluated Sass token maps for ${Object.keys(components).length - 1} documented component topics plus root tokens.`)
