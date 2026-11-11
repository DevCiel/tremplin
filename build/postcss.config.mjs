import prefixCustomProperties from 'postcss-prefix-custom-properties'
import autoprefixer from 'autoprefixer'
import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'

// Same prefixing stages as the reference. Core sources already use --trm-*;
// dependency-owned Calendar Pro properties must retain their --vc-* namespace.
const removeRedundantPrefixes = {
  postcssPlugin: 'remove-redundant-prefixes',
  OnceExit(root) {
    root.walkDecls(declaration => {
      if (declaration.prop === '-webkit-transition' || declaration.prop === '-moz-transition') declaration.remove()
    })
  }
}

const configuration = () => ({
  map: { inline: false, annotation: true, sourcesContent: true },
  plugins: [
    prefixCustomProperties({ prefix: 'trm-', ignore: [/^--trm-/, /^--bd-/, /^--vc-/] }),
    autoprefixer({ cascade: false }),
    removeRedundantPrefixes
  ]
})
export default configuration

// Executable prefix stage after the real Sass CLI. Strip only Sass's trailing
// map annotation so serialization matches the qualified PostCSS API output.
export async function prefixCoreCss() {
  const root = fileURLToPath(new URL('../', import.meta.url))
  const destination = path.resolve(root, process.env.TREMPLIN_BUILD_OUTPUT ?? 'dist')
  assert([path.join(root,'dist'),path.join(root,'artifacts/core-delivery-preview')].includes(destination), 'Unsupported CSS output directory')
  const directory = path.join(destination, 'css')
  for (const basename of ['tremplin','tremplin-grid','tremplin-reboot','tremplin-utilities']) {
    const filename = path.join(directory, basename + '.css')
    const input = await readFile(filename, 'utf8')
    assert(/\n*\/\*# sourceMappingURL=[^\n]*\*\/\s*$/.test(input), 'Missing Sass CLI map annotation')
    const source = input.replace(/\n*\/\*# sourceMappingURL=[^\n]*\*\/\s*$/, '')
    const previous = JSON.parse(await readFile(filename + '.map', 'utf8'))
    assert.equal(previous.file, basename + '.css')
    assert(previous.sourcesContent?.length === previous.sources.length, 'Sass maps must embed sources')
    const config = configuration()
    const result = await postcss(config.plugins).process(source, { from: filename, to: filename, map: { ...config.map, prev: previous, annotation: basename + '.css.map' } })
    assert(result.map, 'PostCSS stage did not produce a map')
    await writeFile(filename, result.css)
    await writeFile(filename + '.map', result.map.toString())
  }
}
// No top-level await: native Node require(ESM) consumers inspect this config.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.deepEqual(process.argv.slice(2), ['--prefix'], 'Usage: postcss.config.mjs --prefix')
  prefixCoreCss().catch(error => { console.error(error); process.exitCode = 1 })
}
