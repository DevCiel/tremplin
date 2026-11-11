// Distribution branding only. Copyright is read from the retained licenses,
// not rewritten to assign upstream authorship or years to Tremplin.
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const product = JSON.parse(await readFile(new URL('package.json', root), 'utf8'))
const notices = await Promise.all(['LICENSE', 'licenses/third-party-code.txt'].map(file => readFile(new URL(file, root), 'utf8')))
const copyrights = notices.map(text => text.split(/\r?\n/).find(line => line.startsWith('Copyright')))
if (copyrights.some(line => !line)) throw new Error('Distribution copyright notice is missing')

export default function banner(pluginFilename) {
  return `/*!\n * Tremplin${pluginFilename ? ` ${pluginFilename}` : ''} v${product.version} (${product.homepage})\n * ${copyrights.join('\n * ')}\n * Licensed under MIT. See LICENSE and THIRD_PARTY_NOTICES.txt.\n */`
}
