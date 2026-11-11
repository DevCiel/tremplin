#!/usr/bin/env node
/*!
 * Adapted from Bootstrap's change-version.mjs.
 * Copyright 2017-2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * Tremplin adaptation: explicit markers, dry-run default, release-block guard.
 * No Git commands, npm lifecycle execution, tagging, publication or baseline refresh.
 */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { lstat, readFile, writeFile, mkdir, mkdtemp } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const digest = value => createHash('sha256').update(value).digest('hex')
const validVersion = value => typeof value === 'string' && value.length <= 256 && /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(value)
async function safeFile(root, relative) {
  let current = root
  assert(!(await lstat(current)).isSymbolicLink(), 'Linked version root')
  for (const part of relative.split('/')) {
    current = path.join(current, part)
    assert(!(await lstat(current)).isSymbolicLink(), 'Linked version input: ' + relative)
  }
  return current
}
export async function planVersion(root, oldVersion, newVersion) {
  assert(validVersion(oldVersion) && validVersion(newVersion), 'Use exact SemVer without a v prefix')
  assert.notEqual(oldVersion, newVersion, 'Versions must differ')
  root = path.resolve(root)
  const changes = []
  for (const relative of ['package.json', 'package-lock.json', 'src/js/base-component.ts', 'src/scss/_banner.scss']) {
    const before = await readFile(await safeFile(root, relative), 'utf8')
    let after
    if (relative.endsWith('.json')) {
      const json = JSON.parse(before)
      assert.equal(json.version, oldVersion, 'Manifest version mismatch: ' + relative)
      json.version = newVersion
      if (relative === 'package-lock.json') {
        assert.equal(json.packages[''].version, oldVersion, 'Root lock version mismatch')
        json.packages[''].version = newVersion
      }
      after = JSON.stringify(json, null, 2) + '\n'
    } else {
      const marker = relative.endsWith('.ts') ? `const VERSION = '${oldVersion}'` : `Tremplin #{$file} v${oldVersion} (`
      assert.equal(before.split(marker).length, 2, 'Expected exactly one version marker: ' + relative)
      after = before.replace(marker, marker.replace(oldVersion, newVersion))
    }
    changes.push({ file: relative, before, after, sha256: digest(before) })
  }
  return { oldVersion, newVersion, changes }
}
export async function changeVersion(root, oldVersion, newVersion, apply = false) {
  const plan = await planVersion(root, oldVersion, newVersion)
  if (apply) {
    const pkg = JSON.parse(plan.changes[0].before)
    assert.equal(pkg.tremplinMigration?.releaseBlocked, false, 'Release is blocked; version files remain untouched')
    // Only explicit future release preparation can reach this block. Backups are
    // new files; dependency versions, histories and pinned baselines stay intact.
    const artifactDir = path.join(root, 'artifacts')
    await mkdir(artifactDir, { recursive: true })
    assert(!(await lstat(artifactDir)).isSymbolicLink(), 'Linked artifacts directory')
    const backup = await mkdtemp(path.join(artifactDir, 'version-review-'))
    for (const [index, change] of plan.changes.entries()) {
      assert.equal(digest(await readFile(await safeFile(root, change.file), 'utf8')), change.sha256, 'Version input changed during review')
      await writeFile(path.join(backup, index + '.txt'), change.before, { flag: 'wx' })
    }
    await writeFile(path.join(backup, 'manifest.json'), JSON.stringify({ oldVersion, newVersion, files: plan.changes.map(({ file, sha256 }) => ({ file, sha256 })) }, null, 2), { flag: 'wx' })
    try { for (const change of plan.changes) await writeFile(await safeFile(root, change.file), change.after) }
    catch (error) { for (const change of plan.changes) await writeFile(await safeFile(root, change.file), change.before); throw error }
  }
  return { mode: apply ? 'apply' : 'dry-run', oldVersion, newVersion, files: plan.changes.map(({ file, sha256 }) => ({ file, sha256 })), note: 'Rebuild and review pinned source/API gates before any release; this tool does not update baselines.' }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [oldVersion, newVersion, ...flags] = process.argv.slice(2)
  assert(flags.length <= 1 && flags.every(arg => ['--dry-run', '--apply'].includes(arg)), 'Usage: change-version.mjs OLD NEW [--dry-run|--apply]')
  console.log(JSON.stringify(await changeVersion(fileURLToPath(new URL('../', import.meta.url)), oldVersion, newVersion, flags.includes('--apply')), null, 2))
}
