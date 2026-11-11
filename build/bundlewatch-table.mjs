#!/usr/bin/env node
/*!
 * Adapted from Bootstrap's bundlewatch-table.mjs.
 * Copyright 2017-2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * Tremplin adaptation: local gzip measurements; no npx or network execution.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

export const projectRoot = fileURLToPath(new URL('../', import.meta.url))
export function parseBudgets(config) {
  assert(Array.isArray(config.files) && config.files.length === 3, 'Expected three core budgets')
  const paths = ['dist/css/tremplin.min.css', 'dist/js/tremplin.min.js', 'dist/js/tremplin.bundle.min.js']
  return config.files.map((entry, index) => {
    assert.equal(entry.path, './' + paths[index], 'Unexpected size-budget target')
    assert(/^\d+(?:\.\d+)? kB$/.test(entry.maxSize), 'Budget must use decimal kB')
    const maximum = Number.parseFloat(entry.maxSize) * 1000
    assert(Number.isSafeInteger(maximum) && maximum > 0, 'Invalid size budget')
    return [paths[index], maximum]
  })
}
export const budgets = parseBudgets(JSON.parse(readFileSync(path.join(projectRoot, '.bundlewatch.config.json'), 'utf8')))
export function measureBundleSizes(root = projectRoot, limits = budgets) {
  return limits.map(([file, maximum]) => {
    const bytes = gzipSync(readFileSync(path.join(root, file)), { level: 9 }).byteLength
    return { file, bytes, maximum, remaining: maximum - bytes, passed: bytes <= maximum }
  })
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert(process.argv.slice(2).every(arg => arg === '--json'), 'Usage: bundlewatch-table.mjs [--json]')
  const rows = measureBundleSizes()
  if (process.argv.includes('--json')) console.log(JSON.stringify(rows, null, 2))
  else console.table(rows)
  if (rows.some(row => !row.passed)) process.exitCode = 1
}
