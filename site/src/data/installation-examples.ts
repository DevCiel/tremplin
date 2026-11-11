import type { CodeSample } from './guide-docs'
import pkg from '../../../package.json' with { type: 'json' }
import integrity from '../../../dist/integrity.json' with { type: 'json' }

export const frameworkVersion = pkg.version
export const installCommand = `${pkg.name}@${frameworkVersion}`
export const registryInstallCommand = `npm i ${installCommand}`
export const localPackage = `./vendor/${pkg.name}-${frameworkVersion}.tgz`
export const requiredPeers = '@floating-ui/dom vanilla-calendar-pro'
export const installationManagers = [
  ['npm', `npm i ${pkg.name}`],
  ['pnpm', `pnpm add ${pkg.name}`],
  ['Yarn', `yarn add ${pkg.name}`],
  ['Bun', `bun add ${pkg.name}`]
] as const

// ESM browser bundle: peers included, no implicit window global.
export const starterHtml = `<!doctype html>
<html lang="en" data-trm-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My Tremplin project</title>
  <link rel="stylesheet" href="./dist/css/tremplin.min.css">
</head>
<body>
  <main class="container py-5">
    <h1>Hello, Tremplin!</h1>
    <p>Build your first responsive interface.</p>
    <button class="btn-solid theme-inverse" type="button"
      data-trm-toggle="collapse" data-trm-target="#welcome"
      aria-expanded="false" aria-controls="welcome">Show details</button>
    <div class="collapse mt-3" id="welcome">
      <div class="card card-body">Your framework is working.</div>
    </div>
  </main>
  <script type="module" src="./dist/js/tremplin.bundle.min.js"></script>
</body>
</html>`

const cdn = `https://cdn.jsdelivr.net/npm/${installCommand}/dist`
const css = 'css/tremplin.min.css', js = 'js/tremplin.bundle.min.js'

export const packageMetadata = pkg
export const installationExamples: Record<string, { code: CodeSample[]; example?: string }> = {
"install#0": { code: [{ language: 'shell', source: installationManagers[0][1] }] },
"install#1": { code: [
      { label: 'Application entry after the target markup exists', language: 'js', source: "import 'tremplin/css'\nimport * as tremplin from 'tremplin'\n\ntremplin.Collapse.getOrCreateInstance('#welcome')" },
      { label: 'Named root imports', language: 'js', source: "import { Tooltip, Toast, Popover } from 'tremplin'" },
      { label: 'Individual component entry (alternative to the root import)', language: 'js', source: "import 'tremplin/css'\nimport Collapse from 'tremplin/collapse'\n\nCollapse.getOrCreateInstance('#welcome')" }
    ] },
"install#2": { code: [{ language: 'shell', source: `yarn config set nodeLinker node-modules\nyarn add ${localPackage} ${requiredPeers}` }] },
"install#6": { code: [{ label: 'After verified publication only', language: 'html', source: `<link rel="stylesheet" href="${cdn}/${css}"
  integrity="${integrity.assets[css].integrity}" crossorigin="anonymous">
<script type="module" src="${cdn}/${js}"
  integrity="${integrity.assets[js].integrity}" crossorigin="anonymous"></script>` }] },
"install#8": { code: [{ label: 'Compute the SHA-384 value locally', language: 'shell', source: 'openssl dgst -sha384 -binary tremplin.bundle.min.js | openssl base64 -A' }] },
"install#10": { code: [{ language: 'html', source: starterHtml }, { label: 'Standard ESM alternative with separately supplied dependency modules', language: 'html', source: `<script type="importmap">
{
  "imports": {
    "@floating-ui/dom": "./vendor/floating-ui.js",
    "vanilla-calendar-pro": "./vendor/vanilla-calendar-pro.js"
  }
}
</script>
<script type="module">
  import { Collapse } from './dist/js/tremplin.js'
  // This module runs after parsing: #welcome must exist.
  Collapse.getOrCreateInstance('#welcome')
</script>` }] },
"install#11": { code: [
      { label: 'Framework repository', language: 'shell', source: 'npm install\nnpm run build\nnpm pack' },
      { label: 'Separate consumer application (adjust the path)', language: 'shell', source: `npm install ../tremplin/tremplin-${frameworkVersion}.tgz ${requiredPeers}` },
      { label: 'Documentation website, from the framework checkout after building', language: 'shell', source: 'npm run site:prepare\nnpx astro dev --host 127.0.0.1 --port 4321' }
    ] },
}
