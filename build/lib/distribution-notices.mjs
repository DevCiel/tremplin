import { readFile, writeFile } from 'node:fs/promises'
import {readFileSync} from 'node:fs'
import assert from 'node:assert/strict'

export const brandingPolicy=JSON.parse(readFileSync(new URL('../../metadata/tremplin-branding.json',import.meta.url),'utf8'))
assert.equal(brandingPolicy.phase,'tremplin-branding-and-notice-packaging')
assert.equal(brandingPolicy.licenseSource,'licenses/third-party-code.txt')
assert.equal(brandingPolicy.distributionFiles,29)
export function activeDistributionExceptions(policy){
  assert.deepEqual(policy.requiredDistributionExceptions,['dist/icons/datepicker-chevron.svg','dist/LICENSE','dist/LICENSE.bootstrap','dist/THIRD_PARTY_NOTICES.txt'])
  const current=policy.requiredDistributionExceptions.filter(file=>file!=='dist/LICENSE.bootstrap')
  assert.deepEqual(current,brandingPolicy.distributionExceptions)
  return current
}

/** Build metadata/attribution only; never edits the pinned framework modules. */
export async function distributionNotices(product) {
  const own=await readFile('LICENSE','utf8'), upstream=await readFile(brandingPolicy.licenseSource,'utf8')
  const notices=[`Tremplin ${product.version}`,own,upstream]
  for(const name of ['@floating-ui/core','@floating-ui/dom','@floating-ui/utils','vanilla-calendar-pro']) {
    const pkg=JSON.parse(await readFile('node_modules/'+name+'/package.json','utf8'))
    notices.push(`${name} ${pkg.version}\n${await readFile('node_modules/'+name+'/LICENSE','utf8')}`)
  }
  notices.push('Documentation acknowledgements\nPortions of the documentation are adapted from material by the Bootstrap Authors.\nSource: https://getbootstrap.com/\nOriginal documentation license: Creative Commons Attribution 3.0 (https://creativecommons.org/licenses/by/3.0/).\nChanges include Tremplin branding, APIs, examples and project-specific installation instructions. Original contributions retain their applicable terms; this credit does not assign third-party authorship to Devciel.')
  await writeFile('dist/LICENSE',own)
  const complete=notices.join('\n\n----------------------------------------\n\n').trimEnd()+'\n'
  await writeFile('THIRD_PARTY_NOTICES.txt',complete)
  await writeFile('dist/THIRD_PARTY_NOTICES.txt',complete)
  const copyrights=[own,upstream].map(text=>text.split(/\r?\n/).find(line=>line.startsWith('Copyright'))).join('; ')
  return `/*! Tremplin v${product.version} | ${copyrights} | MIT. See the distribution's THIRD_PARTY_NOTICES.txt. */`
}
