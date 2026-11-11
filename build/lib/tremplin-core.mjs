import { createHash } from 'node:crypto'

export const sha256 = source => createHash('sha256').update(source).digest('hex')
export const gitBlobHash = bytes => createHash('sha1').update(`blob ${Buffer.byteLength(bytes)}\0`).update(bytes).digest('hex')

export function moduleKind(file) {
  if (file.startsWith('scss/') && file.endsWith('.scss') && !file.startsWith('scss/tests/')) return 'scss'
  if (file.startsWith('js/src/') && file.endsWith('.ts')) return 'javascript'
  return null
}

export function productionPath(file) {
  if (!moduleKind(file)) throw new Error(`Not a core module: ${file}`)
  if (file.startsWith('scss/')) return `src/scss/${file.slice(5).replace(/^bootstrap(?=[.-])/, 'tremplin')}`
  return `src/js/${file.slice(7)}`
}

export function brandedPath(file) {
  return file.replace(/^scss\/bootstrap(?=[.-])/, 'scss/tremplin')
}

// This is a declared branding/namespace transform, NOT a semantic normalizer.
// Never hide changes to selectors, geometry, values, imports, APIs or algorithms.
export function brandSource(source, { version, upstreamVersion }) {
  const urls = []
  return source.replace(/\r\n/g, '\n').split('\n').map(line => {
    if (/\bCopyright\b/.test(line)) return line
    // Product-homepage branding only in the upstream Sass banner comment.
    // License/source URLs and all executable or styling content stay intact.
    if(/^\s*\*\s+Bootstrap\s+#\{\$file\}\s+v/.test(line))line=line.replace('(https://getbootstrap.com/)','(https://gettremplin.com)')
    const protectedLine = line.replace(/https?:\/\/[^\s"'<>)]*/g, url => {
      urls.push(url)
      return `__UPSTREAM_URL_${urls.length - 1}__`
    })
    return protectedLine
      .replace(/Bootstrap/g, 'Tremplin').replace(/bootstrap/g, 'tremplin')
      .replace(/(?<![\w-])--(?:bs-)?(?!trm-|vc-)(?=[a-zA-Z#])/g, '--trm-')
      .replace(/data-bs-/g, 'data-trm-')
      .replace(/\bbs(?=[A-Z.])/g, 'trm')
      .replace(/(['"])bs\1/g, '$1trm$1')
      .replace(/\/\^bs\//g, '/^trm/')
      .replace(new RegExp(`(const VERSION = ['"])${upstreamVersion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`), `$1${version}$2`)
      .replace(`v${upstreamVersion}`, `v${version}`)
      .replace(/__UPSTREAM_URL_(\d+)__/g, (_, index) => urls[Number(index)])
  }).join('\n')
}

export function compareSource(local, upstream, identity) {
  if (local === undefined) return 'missing'
  const expected = brandSource(upstream, identity)
  if (local.replace(/\r\n/g, '\n') === expected) return 'matched'
  return 'implementation-differs'
}

export function safeReferencePath(file) {
  if (typeof file !== 'string' || !file || file.includes('\\') || file.startsWith('/') || file.includes(':') || file.split('/').some(part => !part || part === '.' || part === '..')) throw new Error(`Unsafe reference path: ${file}`)
  return file
}
