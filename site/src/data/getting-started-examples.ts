import type { CodeSample } from './guide-docs'
import pkg from '../../../package.json' with { type: 'json' }
import integrity from '../../../dist/integrity.json' with { type: 'json' }
import { installationExamples } from './installation-examples'
const frameworkVersion = pkg.version
const installCommand = `${pkg.name}@${frameworkVersion}`
const cssPath = 'css/tremplin.min.css'
const jsPath = 'js/tremplin.bundle.min.js'
const cdn = `https://cdn.jsdelivr.net/npm/${installCommand}/dist`

// Executable/copyable samples only. Authored prose lives in content/docs/.
export const gettingStartedExamples: Record<string, { code: CodeSample[]; example?: string }> = {
  ...installationExamples,
"ai#1": { code: [{ label: 'Example prompt', language: 'text', source: `Build a responsive settings form using Tremplin ${frameworkVersion}.
Use unprefixed CSS classes and data-trm-* behavior hooks.
Follow the local Forms, Collapse, and Dialog guides.
Use visible labels, keyboard-operable controls, and explicit error text.
Use local dist assets until registry publication is verified.
Do not introduce another framework or invent Tremplin APIs.` }] },
"ai#3": { code: [{ language: 'shell', source: 'npm run typecheck\nnpm test\nnpm run test:csp\nnpm run check' }] },
"approach#0": { code: [{ language: 'html', source: '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>My project</title>\n</head>\n<body>...</body>\n</html>' }] },
"approach#1": { code: [{ language: 'html', source: '<div class="row g-3">\n  <div class="col-12 col-md-6">First column</div>\n  <div class="col-12 col-md-6">Second column</div>\n</div>' }], example: '<div class="row g-3"><div class="col-12 col-md-6"><div class="border rounded p-3">First column</div></div><div class="col-12 col-md-6"><div class="border rounded p-3">Second column</div></div></div>' },
"css-variables#0": { code: [{ language: 'html', source: '<link rel="stylesheet" href="./assets/tremplin.min.css">\n<link rel="stylesheet" href="./app.css">' }] },
"css-variables#1": { code: [{ language: 'css', source: ':root, [data-trm-theme="light"], [data-trm-theme="dark"] {\n  --trm-primary: #075985;\n  --trm-primary-contrast: #fff;\n  --trm-radius: .75rem;\n  --trm-font-sans: system-ui, sans-serif;\n}' }] },
"css-variables#2": { code: [{ language: 'css', source: '.brand-button {\n  --trm-btn-bg: #075985;\n  --trm-btn-border: #075985;\n  --trm-btn-color: #fff;\n}' }, { language: 'html', source: '<button class="btn brand-button" type="button">A custom button</button>' }], example: '<button class="btn docs-token-demo" type="button">A custom button</button>' },
"css-variables#3": { code: [{ language: 'js', source: "document.documentElement.dataset.trmTheme = 'dark'" }] },
"javascript#1": { code: [{ language: 'html', source: '<button class="btn btn-primary" type="button"\n  data-trm-toggle="collapse" data-trm-target="#details"\n  aria-expanded="false" aria-controls="details">Toggle details</button>\n<div class="collapse" id="details">Project details</div>' }], example: '<button class="btn btn-primary" type="button" data-trm-toggle="collapse" data-trm-target="#guide-disclosure" aria-controls="guide-disclosure" aria-expanded="false">Toggle details</button><div class="collapse mt-3" id="guide-disclosure"><div class="card card-body">This example uses the installed browser bundle.</div></div>' },
"javascript#2": { code: [{ label: 'Bundler application after the target exists', language: 'js', source: "import 'tremplin/css'\nimport Collapse from 'tremplin/collapse'\n\nconst panel = document.querySelector('#details')\nif (panel) {\n  const instance = Collapse.getOrCreateInstance(panel)\n  await instance.show()\n  // Await transitions before the next dependent state change.\n  await instance.hide()\n}" }, { label: 'Browser module: use instead of another runtime script', language: 'js', source: "import { Collapse } from './dist/js/tremplin.bundle.min.js'\n\nconst panel = document.querySelector('#details')\nconst instance = Collapse.getOrCreateInstance(panel)\ninstance.show()" }] },
"javascript#3": { code: [{ language: 'js', source: "import { Collapse } from './dist/js/tremplin.bundle.min.js'\n\nconst panel = document.querySelector('#details')\npanel.addEventListener('show.trm.collapse', event => {\n  if (panel.dataset.locked === 'true') event.preventDefault()\n})\npanel.addEventListener('shown.trm.collapse', () => {\n  console.log('Details are now open')\n})" }] },
"javascript#5": { code: [{ language: 'js', source: "// Run during application teardown, before removing #details.\nCollapse.getInstance('#details')?.dispose()" }] },
"javascript#6": { code: [{ language: 'text', source: "require-trusted-types-for 'script'; trusted-types tremplin" }] },
"browsers-devices#1": { code: [{ language: 'js', source: "const features = {\n  dialog: typeof HTMLDialogElement !== 'undefined' &&\n    typeof HTMLDialogElement.prototype.showModal === 'function',\n  observer: 'IntersectionObserver' in window,\n  containers: CSS.supports('container-type', 'inline-size'),\n  colorMix: CSS.supports('color', 'color-mix(in srgb, red, blue)')\n}\nconsole.table(features)" }] },
"accessibility#2": { code: [{ language: 'html', source: '<label class="form-label" for="email">Email address</label>\n<input class="form-control is-invalid" type="email" id="email"\n  aria-invalid="true" aria-describedby="email-help email-error">\n<p class="form-text" id="email-help">Use an address you can access.</p>\n<p class="invalid-feedback" id="email-error">Enter a valid email address.</p>' }], example: '<label class="form-label" for="getting-started-email">Email address</label><input class="form-control" type="email" id="getting-started-email" aria-describedby="getting-started-email-help"><p class="form-text" id="getting-started-email-help">Use an address you can access.</p>' },
"accessibility#3": { code: [{ language: 'html', source: '<button class="btn btn-primary" type="button" data-trm-toggle="dialog"\n  data-trm-target="#help-dialog">Open help</button>\n<dialog class="dialog" id="help-dialog" aria-labelledby="help-title">\n  <div class="dialog-header"><h2 id="help-title">Help</h2></div>\n  <div class="dialog-body">Use the form labels to complete each field.</div>\n  <div class="dialog-footer">\n    <button class="btn btn-primary" type="button" data-trm-dismiss="dialog">Close</button>\n  </div>\n</dialog>' }] },
"accessibility#4": { code: [{ language: 'html', source: '<span class="spinner-border" aria-hidden="true"></span>\n<span role="status">Loading results…</span>' }] },
"download#2": { code: [{ language: 'shell', source: 'npm install\nnpm run build\nnpm run check\nnpm pack' }] },
"download#3": { code: [{ label: 'Save as verify.mjs; run node verify.mjs next to integrity.json', language: 'js', source: "import { createHash } from 'node:crypto'\nimport { readFileSync } from 'node:fs'\n\nconst manifest = JSON.parse(readFileSync('integrity.json', 'utf8'))\nconst actual = 'sha384-' + createHash('sha384')\n  .update(readFileSync('tremplin.min.css'))\n  .digest('base64')\nif (actual !== manifest.assets['css/tremplin.min.css'].integrity) {\n  throw new Error('Integrity mismatch: do not use this file')\n}\nconsole.log('Verified Tremplin', manifest.version)" }] },
"contents#0": { code: [{ language: 'text', source: `tremplin/
  dist/
    css/          full, grid, reboot, and utilities CSS; minified variants
    js/           ESM, CommonJS facades, chunks, declarations, source maps
    integrity.json
  src/scss/       Sass modules and optional extensions
  src/js/         TypeScript components and utilities
  icons/          sprite and icon CSS
  themes/         runtime theme presets
  starters/       HTML, Vite, React, and Vue starting points
  metadata/       component and API contracts
  docs/           project and migration documentation` }] },
"contents#4": { code: [{ language: 'shell', source: 'npm pack --dry-run\nnpm run test:package' }] },
"bundlers#0": { code: [{ language: 'shell', source: 'mkdir my-tremplin-app\ncd my-tremplin-app\nnpm init -y\nnpm install --save-dev vite' }] },
"bundlers#1": { code: [{ language: 'shell', source: `npm install ../tremplin/tremplin-${frameworkVersion}.tgz @floating-ui/dom` }] },
"bundlers#2": { code: [{ label: 'index.html', language: 'html', source: '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Tremplin with Vite</title>\n</head>\n<body>\n  <main class="container py-5">\n    <h1>Tremplin with Vite</h1>\n    <button class="btn btn-primary" type="button" data-trm-toggle="collapse"\n      data-trm-target="#details" aria-controls="details" aria-expanded="false">Details</button>\n    <div class="collapse" id="details">It works.</div>\n  </main>\n  <script type="module" src="/main.js"></script>\n</body>\n</html>' }] },
"bundlers#3": { code: [{ label: 'main.js', language: 'js', source: "import 'tremplin/css'\nimport Collapse from 'tremplin/collapse'\n\n// Retain a concrete component reference and initialize the target.\nCollapse.getOrCreateInstance('#details')" }] },
"bundlers#4": { code: [{ label: 'package.json scripts', language: 'json', source: '{\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "preview": "vite preview"\n  }\n}' }, { language: 'shell', source: 'npm run dev\n# Stop the development server before continuing if needed.\nnpm run build\nnpm run preview' }] },
"bundlers#5": { code: [{ language: 'shell', source: 'npm install --save-dev sass' }, { label: 'app.scss', language: 'scss', source: "@use 'tremplin/scss' with (\n  $primary: #075985,\n  $enable-shadows: false\n);" }, { label: 'main.js CSS replacement', language: 'js', source: "import './app.scss'" }] },
"rtl#0": { code: [{ language: 'html', source: '<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <link rel="stylesheet" href="./assets/tremplin.min.css">\n  <title>مثال Tremplin</title>\n</head>\n<body>...</body>\n</html>' }] },
"rtl#1": { code: [], example: '<div dir="rtl" lang="ar" class="border rounded p-3"><p class="text-start mb-2">واجهة تدعم اتجاه الكتابة</p><button class="btn btn-primary" type="button">متابعة</button><span dir="ltr" class="ms-3">hello@example.com</span></div>' },
"rtl#2": { code: [{ language: 'css', source: '.notice {\n  padding-inline: 1rem;\n  margin-inline-start: .5rem;\n  border-inline-start: .25rem solid var(--trm-primary);\n  text-align: start;\n}' }] },
"rtl#3": { code: [{ language: 'html', source: '<p dir="rtl" lang="ar">البريد: <bdi dir="ltr">hello@example.com</bdi></p>' }] },
}
