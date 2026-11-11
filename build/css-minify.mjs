#!/usr/bin/env node

// Pinned pipeline: Lightning CSS with native light-dark() retained. Resolve
// browser targets explicitly; a missing target configuration must not silently
// turn into an unqualified fallback build.
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import browserslist from 'browserslist'
import { transform, browserslistToTargets, Features } from 'lightningcss'
import { buildOutputRoot } from './rolldown.config.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
export const coreCssBasenames = ['tremplin', 'tremplin-grid', 'tremplin-reboot', 'tremplin-utilities']

export async function minifyCss(directory = path.join(buildOutputRoot(), 'css')) {
  const targets = browserslistToTargets(browserslist(undefined, { path: root }))
  for (const basename of coreCssBasenames) {
    const input = path.join(directory, basename + '.css')
    const result = transform({
      filename: basename + '.css',
      code: await readFile(input),
      minify: true,
      sourceMap: true,
      inputSourceMap: await readFile(input + '.map', 'utf8'),
      targets,
      exclude: Features.LightDark
    })
    if (!result.map) throw new Error('Missing minified CSS source map: ' + basename)
    await writeFile(path.join(directory, basename + '.min.css'), result.code.toString() + `\n/*# sourceMappingURL=${basename}.min.css.map */`)
    await writeFile(path.join(directory, basename + '.min.css.map'), result.map)
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await minifyCss()
