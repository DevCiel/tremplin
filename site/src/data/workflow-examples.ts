import type { CodeSample } from './guide-docs'
import manifest from '../../../package.json' with { type: 'json' }

const packageFile = `tremplin-${manifest.version}.tgz`
const localInstall = `npm install ./${packageFile} @floating-ui/dom vanilla-calendar-pro`
const pageBody = `<main class="container py-4">
  <h1>Welcome to Tremplin</h1>
  <button class="btn-outline theme-inverse" data-trm-toggle="dialog" data-trm-target="#welcome">Open welcome</button>
  <dialog class="dialog" id="welcome" aria-labelledby="welcome-title"><div class="dialog-body"><h2 id="welcome-title">Welcome</h2><button class="btn-close" data-trm-dismiss="dialog" aria-label="Close"></button></div></dialog>
</main>`
const entry = "import 'tremplin/css'\nimport * as tremplin from 'tremplin'\n\n// Importing the root also registers the declarative data APIs.\nconsole.log(tremplin.Dialog.VERSION)"

// Shared executable samples only; prose is authored in content/docs/.
export const workflowExamples: Record<string, { code: CodeSample[]; example?: string }> = {
"guides/quickstart#1": { code: [{ language: 'shell', source: 'npm install\nnpm run build' }] },
"guides/quickstart#2": { code: [{ language: 'html', source: '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tremplin starter</title><link rel="stylesheet" href="./dist/css/tremplin.min.css"></head><body>\n' + pageBody + '\n<script type="module" src="./dist/js/tremplin.bundle.min.js"></script>\n</body></html>' }] },
"guides/npm#1": { code: [{ language: 'shell', source: `# Framework checkout\nnpm pack\n\n# Separate consumer project containing ${packageFile}\nnpm init -y\n${localInstall}` }] },
"guides/npm#2": { code: [{ language: 'javascript', source: entry }] },
"guides/npm#3": { code: [{ language: 'html', source: pageBody }] },
"guides/npm#4": { code: [{ language: 'javascript', source: "import 'tremplin/css'\nimport Dialog from 'tremplin/dialog'\n\nconst welcome = Dialog.getOrCreateInstance('#welcome')\nawait welcome.show()" }] },
"guides/vite#1": { code: [{ language: 'shell', source: `# Framework checkout\nnpm pack\n\n# Separate consumer project containing ${packageFile}\nnpm init -y\n${localInstall}` }] },
"guides/vite#2": { code: [{ language: 'shell', source: 'npm install --save-dev vite\nnpx vite' }] },
"guides/vite#3": { code: [{ language: 'javascript', source: entry }] },
"guides/vite#4": { code: [{ language: 'html', source: pageBody }] },
"guides/vite#5": { code: [{ language: 'html', source: '<script type="module" src="/src/main.js"></script>' }, { language: 'shell', source: 'npx vite build\nnpx vite preview' }] },
"guides/webpack#1": { code: [{ language: 'shell', source: `# Framework checkout\nnpm pack\n\n# Separate consumer project containing ${packageFile}\nnpm init -y\n${localInstall}` }] },
"guides/webpack#2": { code: [{ language: 'shell', source: 'npm install --save-dev webpack webpack-cli webpack-dev-server style-loader css-loader html-webpack-plugin' }] },
"guides/webpack#3": { code: [{ language: 'javascript', source: entry }] },
"guides/webpack#4": { code: [{ language: 'html', source: pageBody }] },
"guides/webpack#5": { code: [{ language: 'javascript', source: "// webpack.config.cjs\nconst HtmlWebpackPlugin = require('html-webpack-plugin')\nmodule.exports = {\n  mode: 'development',\n  entry: './src/main.js',\n  output: { filename: 'app.js', clean: true },\n  module: { rules: [{ test: /\\.css$/i, use: ['style-loader', 'css-loader'] }] },\n  plugins: [new HtmlWebpackPlugin({ template: './index.html' })]\n}" }, { language: 'shell', source: 'npx webpack serve\nnpx webpack --mode production' }] },
"guides/parcel#1": { code: [{ language: 'shell', source: `# Framework checkout\nnpm pack\n\n# Separate consumer project containing ${packageFile}\nnpm init -y\n${localInstall}` }] },
"guides/parcel#2": { code: [{ language: 'shell', source: 'npm pkg delete main\nnpm install --save-dev parcel\nnpx parcel index.html' }] },
"guides/parcel#3": { code: [{ language: 'javascript', source: entry }] },
"guides/parcel#4": { code: [{ language: 'html', source: pageBody }] },
"guides/parcel#5": { code: [{ language: 'html', source: '<script type="module" src="./src/main.js"></script>' }, { language: 'shell', source: 'npx parcel build index.html' }] },
"guides/contribute#1": { code: [{ language: 'shell', source: 'npm install\nnpm run audit:tremplin -- --fetch --stage --check\nnpm run validate:tremplin-stage\nnpm run build\nnpm run check:production-css' }] },
"guides/contribute#2": { code: [{ language: 'shell', source: 'npm run typecheck\nnpm run test:typecheck-boundaries\nnpm test\nnpm run check:api\nnpm run check:no-legacy' }] },
}
