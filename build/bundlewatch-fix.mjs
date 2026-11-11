#!/usr/bin/env node
/*!
 * Adapted from Bootstrap's bundlewatch-fix.mjs.
 * Copyright 2017-2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * Tremplin adaptation: dry-run default; automatic increases are CSS-only.
 */
import assert from 'node:assert/strict'
import { lstatSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { measureBundleSizes, parseBudgets, projectRoot } from './bundlewatch-table.mjs'

export function proposeBudgets(config, rows) {
  const limits = parseBudgets(config)
  assert.equal(rows.length, limits.length)
  const proposals = rows.flatMap((row, index) => {
    assert.equal(row.file, limits[index][0])
    assert.equal(row.maximum, limits[index][1])
    assert(Number.isSafeInteger(row.bytes) && row.bytes >= 0)
    return row.bytes > row.maximum ? [{ file: row.file, before: row.maximum, after: Math.ceil(row.bytes / 1000) * 1000, automatic: row.file.endsWith('.css') }] : []
  })
  return proposals
}
export function updateCssBudgets(root = projectRoot, write = false) {
  const filename = path.join(root, '.bundlewatch.config.json')
  assert(!lstatSync(root).isSymbolicLink() && !lstatSync(filename).isSymbolicLink(), 'Linked budget paths are not writable')
  const original = readFileSync(filename, 'utf8'), config = JSON.parse(original)
  const rows = measureBundleSizes(root, parseBudgets(config)), proposals = proposeBudgets(config, rows)
  if (write) {
    assert(!proposals.some(item => !item.automatic), 'JavaScript budget increases require separate user approval; no budgets written')
    for (const proposal of proposals) config.files.find(item => item.path === './' + proposal.file).maxSize = `${proposal.after / 1000} kB`
    assert.equal(readFileSync(filename, 'utf8'), original, 'Budget config changed during review')
    if (proposals.length) writeFileSync(filename, JSON.stringify(config, null, 2) + '\n')
  }
  return { mode: write ? 'write-css-only' : 'dry-run', proposals }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  assert(args.length <= 1 && args.every(arg => ['--dry-run', '--write'].includes(arg)), 'Usage: bundlewatch-fix.mjs [--dry-run|--write]')
  console.log(JSON.stringify(updateCssBudgets(projectRoot, args.includes('--write')), null, 2))
}
