import type { AstroIntegration } from 'astro'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { prepareDocumentationAssets } from '../../build/assets.mjs'

/** Run before Astro enumerates public files, for both root and site-local CLI usage. */
export function documentationAssets(): AstroIntegration {
  return {
    name: 'tremplin-documentation-assets',
    hooks: {
      'astro:config:setup': async () => { await prepareDocumentationAssets() },
      'astro:server:setup': ({ server }) => {
        const roots = ['../scss/', '../../static/'].map(relative => fileURLToPath(new URL(relative, import.meta.url)))
        server.watcher.add(roots)
        let timer: ReturnType<typeof setTimeout> | undefined
        const changed = (file: string) => {
          if (!roots.some(root => {
            const relative = path.relative(root, file)
            return !relative.startsWith('..') && !path.isAbsolute(relative)
          })) return
          clearTimeout(timer)
          timer = setTimeout(() => {
            void prepareDocumentationAssets().then(() => server.ws.send({ type: 'full-reload' }))
              .catch(error => server.config.logger.error(String(error)))
          }, 75)
        }
        server.watcher.on('add', changed).on('change', changed).on('unlink', changed)
        server.httpServer?.once('close', () => {
          clearTimeout(timer)
          server.watcher.off('add', changed).off('change', changed).off('unlink', changed)
        })
      }
    }
  }
}
