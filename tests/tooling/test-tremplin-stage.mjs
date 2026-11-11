import { readFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { safeReferencePath, sha256, productionPath } from '../../build/lib/tremplin-core.mjs'
import { loadSecurityRegistry, approvedSecuritySource } from '../../build/lib/tremplin-security.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const settings = JSON.parse(await readFile(path.join(root, 'metadata/bootstrap6-reference.json'), 'utf8'))
if (!/^[a-f0-9]{40}$/.test(settings.commit)) throw new Error('Invalid reference commit')
const stage = path.join(root, 'artifacts/bootstrap6-strict', settings.commit)
const marker = JSON.parse(await readFile(path.join(stage, 'stage-manifest.json'), 'utf8'))
if (marker.commit !== settings.commit) throw new Error('Stale stage manifest')
if (!Array.isArray(marker.testFixtures) || !marker.testFixtures.length) throw new Error('Missing verified test fixture inventory')
for (const entry of [...marker.modules, ...marker.testFixtures]) {
  safeReferencePath(entry.path)
  if (sha256(await readFile(path.join(stage, entry.path))) !== entry.sha256) throw new Error(`Modified stage fixture/module: ${entry.path}`)
}
const args = process.argv.slice(2)
if (args.some(arg => !['--sass', '--javascript', '--production'].includes(arg))) throw new Error('Supported options: --sass, --javascript, --production')
const production = args.includes('--production')
const suites = args.filter(arg => arg !== '--production')
const selected = suites.length ? new Set(suites) : new Set(['--sass', '--javascript'])
if (production) {
  const registry = await loadSecurityRegistry(root, settings.commit)
  for (const entry of marker.modules) {
    const local = productionPath(entry.path)
    const accepted = approvedSecuritySource(local, await readFile(path.join(stage, entry.path), 'utf8'), registry)
    if ((await readFile(path.join(root, local), 'utf8')).replaceAll('\r\n', '\n') !== accepted.source) throw new Error(`Production source differs beyond approved patches: ${entry.path}`)
  }
}
const run = (cli, args) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [path.join(root, 'node_modules', cli), ...args], { cwd: production ? root : stage, stdio: 'inherit', windowsHide: true })
  child.on('error', reject)
  child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${cli} exited with ${code}`)))
})
if (selected.has('--sass')) {
  const child = spawn(process.execPath, ['--test', path.join(root, 'tests/tooling/run-tremplin-stage-sass.mjs')], { cwd: root, stdio: 'inherit', windowsHide: true, env: { ...process.env, TREMPLIN_TEST_CORE: production ? 'production' : 'stage' } })
  await new Promise((resolve, reject) => { child.on('error', reject); child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Upstream Sass tests exited with ${code}`))) })
}
if (selected.has('--javascript')) await run('vitest/vitest.mjs', ['run', '--config', production ? 'vitest.strict.config.mts' : 'js/tests/vitest.config.mts', '--maxWorkers=1', '--reporter=json', '--outputFile', path.join(root, production ? 'artifacts/bootstrap-production-browser-tests.json' : 'artifacts/bootstrap-stage-browser-tests.json')])
