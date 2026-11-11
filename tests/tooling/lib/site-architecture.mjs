import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { compile } from 'sass'
import { transform } from 'lightningcss'

const digest = bytes => createHash('sha256').update(bytes).digest('hex')

/** Keep old CSS fixture hashes; permit only Sass formatting, never visual rules. */
export function assertDocumentationStylesheet(bytes, historicalHash) {
  const original = readFileSync('tests/fixtures/documentation-scope/docs.initial.css')
  assert.equal(digest(original), historicalHash, 'Historical documentation CSS reference changed')
  const compiled = compile('site/src/scss/docs.scss', { style: 'expanded', sourceMap: false, charset: false }).css
  assert.equal(Buffer.from(bytes).toString('utf8'), compiled, 'Documentation CSS is not the current Sass output')
  const canonical = code => transform({ filename: 'docs.css', code: Buffer.from(code), minify: true }).code
  assert.equal(digest(canonical(bytes)), digest(canonical(original)), 'Documentation CSS changed beyond the cascade-preserving source split')
}

/** Project scripts only; exports, dependencies and publication flags stay protected. */
export function projectSiteScripts(scripts) {
  assert.equal(scripts['site:prepare'], 'node site/build/documentation-assets.mjs && node site/build/runtime.mjs && node build/copy-site.mjs')
  assert.equal(scripts['site:dev'], undefined)
  return {
    ...scripts,
    'site:prepare': 'node site/build/assets.mjs && ' + scripts['site:prepare'],
    'site:dev': 'npm run site:prepare && astro dev --host 127.0.0.1 --port 4321'
  }
}
