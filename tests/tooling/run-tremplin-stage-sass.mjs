import { describe, it } from 'node:test'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { runSass } = require('sass-true')
const root = fileURLToPath(new URL('../../', import.meta.url))
const settings = JSON.parse(await readFile(path.join(root, 'metadata/bootstrap6-reference.json'), 'utf8'))
if (!/^[a-f0-9]{40}$/.test(settings.commit)) throw new Error('Invalid reference commit')
const stage = path.join(root, 'artifacts/bootstrap6-strict', settings.commit)
const search = async directory => {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) result.push(...await search(file))
    else if (entry.name.endsWith('.test.scss')) result.push(file)
  }
  return result.sort()
}

// Mirror the pinned upstream runner's selected fixture list exactly. The tree
// also retains old, unselected fixtures (one imports a now-absent mixin). Report
// those separately; do not silently rewrite or count them as passing tests.
const upstreamRunner = require(path.join(stage, 'scss/tests/jasmine.cjs'))
const glob = pattern => new RegExp('^' + pattern.split('**/').map(part => part.split('*').map(value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')).join('(?:.*/)?') + '$')
const patterns = upstreamRunner.spec_files.map(glob)
const all = await search(path.join(stage, 'scss/tests'))
const selected = all.filter(file => patterns.some(pattern => pattern.test(path.relative(path.join(stage, 'scss'), file).replace(/\\/g, '/'))))
if (!selected.length) throw new Error('No upstream Sass fixtures selected')
await writeFile(path.join(root, 'artifacts/bootstrap-stage-sass-inventory.json'), JSON.stringify({ commit: settings.commit, configuredFixtures: selected.map(file => path.relative(stage, file).replace(/\\/g, '/')), notSelectedByUpstreamConfig: all.filter(file => !selected.includes(file)).map(file => path.relative(stage, file).replace(/\\/g, '/')) }, null, 2) + '\n')
// sass-true is runner-independent: Node describe/it keep the original Sass
// assertions without introducing the Jasmine CLI's vulnerable glob dependency.
for (const file of selected) {
  let source = await readFile(file, 'utf8')
  if (process.env.TREMPLIN_TEST_CORE === 'production') {
    // Redirect only module URLs, never assertions or expected values.
    source = source.replace(/(@(?:use|forward|import)\s+)(['"])([^'"]+)\2/g, (match, directive, quote, specifier) => {
      if (!specifier.startsWith('.')) return match
      const resolved = path.resolve(path.dirname(file), specifier)
      const prefix = path.join(stage, 'scss') + path.sep
      if (!resolved.startsWith(prefix) || resolved.includes(path.sep + 'tests' + path.sep)) return match
      const target = path.join('src/scss', path.relative(prefix, resolved)).replaceAll('\\', '/')
      return `${directive}${quote}${target}${quote}`
    })
  }
  runSass({ describe, it, sourceType: 'string' }, '@use "true" as *;' + source, { loadPaths: process.env.TREMPLIN_TEST_CORE === 'production' ? [root, path.dirname(file)] : [path.dirname(file)] })
}
