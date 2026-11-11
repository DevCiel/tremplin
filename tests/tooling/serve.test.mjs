import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { get } from 'node:http'
import { test } from 'node:test'

function startServer(t, { port = 0, root } = {}) {
  const child = spawn(process.execPath, ['tests/tooling/serve.mjs', ...(root ? [root] : [])], {
    env: { ...process.env, TREMPLIN_TEST_PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true
  })
  t.after(async () => {
    if (child.exitCode !== null || child.signalCode !== null) return
    const exited = once(child, 'exit')
    child.kill('SIGTERM')
    await exited
  })
  return new Promise((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    const timer = setTimeout(() => { child.kill(); reject(new Error('Server startup timed out')) }, 10_000)
    child.stderr.on('data', data => { stderr += data })
    child.stdout.on('data', data => {
      stdout += data
      const url = stdout.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0]
      if (!url) return
      clearTimeout(timer)
      resolve({ child, url, port: Number(new URL(url).port) })
    })
    child.once('error', error => { clearTimeout(timer); reject(error) })
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`Server exited (${code}): ${stderr}`)) })
  })
}

test('servers isolate document roots and reject an occupied port', { timeout: 20_000 }, async t => {
  const first = await startServer(t)
  const second = await startServer(t, { root: 'docs' })
  assert.notEqual(first.port, second.port)
  assert.equal((await fetch(`${first.url}/README.md`)).status, 200)
  assert.equal((await fetch(`${second.url}/README.md`)).status, 404)
  await assert.rejects(startServer(t, { port: first.port }), /EADDRINUSE|address already in use/)
  assert.equal((await fetch(first.url)).status, 200)
})

test('shutdown releases the listener for an immediate restart', { timeout: 20_000 }, async t => {
  const first = await startServer(t)
  await fetch(first.url)
  const exited = once(first.child, 'exit')
  first.child.kill('SIGTERM')
  await exited
  const restarted = await startServer(t, { port: first.port })
  assert.equal((await fetch(restarted.url)).status, 200)
})

test('serves native ES module fixtures with a JavaScript MIME type', async t => {
  const server=await startServer(t)
  const response=await fetch(server.url+'/tests/browser/runtime.mjs')
  assert.equal(response.status,200)
  assert.match(response.headers.get('content-type'),/^text\/javascript/)
  assert.match(await response.text(),/import \* as framework from/)
})

test('malformed and aborted requests do not terminate the server', { timeout: 20_000 }, async t => {
  const server = await startServer(t)
  assert.equal((await fetch(`${server.url}/%ZZ`)).status, 400)
  await new Promise((resolve, reject) => {
    const request = get(`${server.url}/dist/css/tremplin.css`, response => {
      response.destroy()
      resolve()
    })
    request.on('error', reject)
  })
  assert.equal((await fetch(server.url)).status, 200)
})
