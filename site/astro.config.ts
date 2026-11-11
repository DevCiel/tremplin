import mdx from '@astrojs/mdx'
import { defineConfig } from 'astro/config'
import { fileURLToPath } from 'node:url'
import { documentationAssets } from './src/libs/astro'

export default defineConfig({
  root: fileURLToPath(new URL('../', import.meta.url)),
  site: 'https://gettremplin.com',
  output: 'static',
  srcDir: fileURLToPath(new URL('./src/', import.meta.url)),
  outDir: fileURLToPath(new URL('../site-dist/', import.meta.url)),
  publicDir: fileURLToPath(new URL('./public/', import.meta.url)),
  devToolbar: { enabled: false },
  vite: { css: { postcss: fileURLToPath(new URL('./', import.meta.url)) } },
  integrations: [documentationAssets(), mdx()]
})
