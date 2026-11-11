import { createReadStream, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, isAbsolute, join, normalize, relative } from 'node:path'

const root = normalize(join(process.cwd(), process.argv[2] || '.'))
const indexFile = 'index.html'
const port = Number(process.env.TREMPLIN_TEST_PORT || 4173)
const types = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.map': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' }

const server = createServer((request, response) => {
  let pathname
  try {
    pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname)
  } catch {
    response.writeHead(400).end('Bad request')
    return
  }
  if (pathname === '/' && !process.argv[2]) {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
    response.end('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Tremplin test server</title></head><body><main><h1>Tremplin test server</h1><p>This local server exposes repository test fixtures and current build assets. Start the Astro documentation project to browse the website.</p></main></body></html>')
    return
  }
  let file = normalize(join(root, pathname === '/' ? indexFile : pathname.slice(1)))
  const localPath = relative(root, file)
  if (localPath.startsWith('..') || isAbsolute(localPath)) { response.writeHead(403).end('Forbidden'); return }
  try {
    if (statSync(file).isDirectory()) file = join(file, 'index.html')
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' })
    const stream = createReadStream(file)
    stream.on('error', () => response.destroy())
    response.on('close', () => stream.destroy())
    stream.pipe(response)
  } catch {
    response.writeHead(404).end('Not found')
  }
})

// Reuse browser connections across requests instead of rapidly consuming
// Windows ephemeral ports while pages load many local assets.
server.keepAliveTimeout = 60_000
server.headersTimeout = 65_000

let stopping = false
function shutdown() {
  if (stopping) return
  stopping = true
  server.close(() => process.exit(0))
  server.closeAllConnections()
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

server.on('error', error => {
  process.stderr.write(`Tremplin test server on port ${port}: ${error.message}\n`)
  process.exitCode = 1
})
server.listen(port, '127.0.0.1', () => process.stdout.write(`Tremplin test server: http://127.0.0.1:${server.address().port}\n`))
