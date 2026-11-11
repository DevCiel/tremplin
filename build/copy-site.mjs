import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { syncSiteDirectory } from './lib/site-assets.mjs'

const copies = [
  ['THIRD_PARTY_NOTICES.txt', 'site/public/THIRD_PARTY_NOTICES.txt'],
  ['llms.txt', 'site/public/llms.txt'],
  ['dist/css/tremplin.min.css', 'site/public/css/tremplin.min.css'],
  ['dist/icons/datepicker-chevron.svg', 'site/public/icons/datepicker-chevron.svg'],
  ['icons/tremplin-icons.svg', 'site/public/icons/tremplin-icons.svg']
]

for (const [source, destination] of copies) {
  await mkdir(destination.slice(0, destination.lastIndexOf('/')), { recursive: true })
  const sourceContents = await readFile(source)
  const destinationContents = await readFile(destination).catch(() => null)
  if (!destinationContents?.equals(sourceContents)) await writeFile(destination, sourceContents)
}

for (const name of ['dist', 'themes', 'js/dist']) {
  const result = await syncSiteDirectory(process.cwd(), name)
  console.log(`Prepared ${name}: ${result.files} current files, ${result.removed.length} obsolete copies removed.`)
}
