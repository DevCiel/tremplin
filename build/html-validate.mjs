#!/usr/bin/env node
/*!
 * Adapted from Bootstrap's html-validate.mjs.
 * Copyright 2017-2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * Tremplin adaptation: actual site paths, bounded work, fail on an empty match.
 */
import assert from 'node:assert/strict'
import { lstat, realpath } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { HtmlValidate } from 'html-validate'
import { globby } from 'globby'

// Preserve the pinned rule set, including duplicate-ID errors. This is not a
// replacement for the stricter browser accessibility and visual acceptance gates.
export const validationConfig = {
  root: true,
  rules: {
    'attribute-allowed-values': 'off',
    'aria-label-misuse': 'off',
    'valid-id': 'off',
    'void-style': 'off',
    'no-unknown-elements': 'off',
    'attribute-boolean-style': 'off',
    'no-inline-style': 'off',
    'no-dup-id': 'error'
  },
  elements: ['html5', { '*': { attributes: {
    'is:raw': { boolean: true }, switch: { boolean: true },
    autocomplete: { enum: ['on', 'off', 'new-password', 'current-password'] }
  } } }]
}
export async function validateHTML(root, patterns = ['site-dist/**/*.html']) {
  assert(patterns.length > 0 && patterns.every(pattern => !path.isAbsolute(pattern) && !pattern.includes('\\') && !pattern.includes(':') && !pattern.startsWith('-') && !pattern.startsWith('!') && !pattern.split('/').includes('..')), 'Use local relative HTML patterns')
  root = path.resolve(root)
  const canonical = await realpath(root)
  const files = (await globby(patterns, { cwd: root, followSymbolicLinks: false, ignore: ['**/node_modules/**'], onlyFiles: true })).sort()
  assert(files.length > 0, 'No HTML files matched; build the documentation first')
  const validator = new HtmlValidate(validationConfig), errors = []
  for (const file of files) {
    const absolute = path.join(root, file)
    assert(!(await lstat(absolute)).isSymbolicLink() && (await realpath(absolute)).startsWith(canonical + path.sep), 'HTML path escapes project root')
    const report = await validator.validateFile(absolute)
    for (const result of report.results) for (const message of result.messages) if (message.severity === 2) errors.push({ file, line: message.line, column: message.column, rule: message.ruleId, message: message.message })
  }
  return { files: files.length, valid: errors.length === 0, errors }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const result = await validateHTML(fileURLToPath(new URL('../', import.meta.url)), args.length ? args : undefined)
  for (const error of result.errors) console.error(`${error.file}:${error.line}:${error.column} ${error.message} (${error.rule})`)
  console.log(`HTML validation: ${result.files} files, ${result.errors.length} errors`)
  if (!result.valid) process.exitCode = 1
}
