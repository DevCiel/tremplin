#!/usr/bin/env node
/*!
 * Adapted from Bootstrap's clean-astro.mjs.
 * Copyright 2017-2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * Tremplin adaptation: fixed cache targets, no links, dry-run by default.
 */
import assert from 'node:assert/strict'
import { lstat, realpath, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const cacheTargets = ['.astro', 'node_modules/.astro', 'site/.astro', 'site/node_modules/.astro']
export async function cleanAstro(root, apply = false) {
  root = path.resolve(root)
  assert(!(await lstat(root)).isSymbolicLink(), 'Linked project root is not allowed')
  const canonical = await realpath(root)
  const targets = []
  // Validate all targets before deleting any. Never follow junctions or symlinks.
  for (const relative of cacheTargets) {
    let current = root, exists = true
    for (const segment of relative.split('/')) {
      current = path.join(current, segment)
      const stat = await lstat(current).catch(error => { if (error.code === 'ENOENT') return null; throw error })
      if (!stat) { exists = false; break }
      assert(stat.isDirectory() && !stat.isSymbolicLink(), 'Unsafe Astro cache path: ' + current)
      const resolved = await realpath(current)
      assert(resolved.startsWith(canonical + path.sep), 'Astro cache escapes project root')
    }
    if (exists) targets.push({ relative, absolute: path.join(root, relative) })
  }
  if (apply) for (const target of targets) await rm(target.absolute, { recursive: true, force: false })
  return { mode: apply ? 'apply' : 'dry-run', targets: targets.map(target => target.relative) }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  assert(args.length <= 1 && args.every(arg => ['--dry-run', '--apply'].includes(arg)), 'Usage: clean-astro.mjs [--dry-run|--apply]')
  console.log(JSON.stringify(await cleanAstro(fileURLToPath(new URL('../', import.meta.url)), args.includes('--apply')), null, 2))
}
