import type { CodeSample } from './guide-docs'

// Shared executable samples only; prose is authored in content/docs/.
export const customizeExamples: Record<string, { code: CodeSample[]; example?: string }> = {
"customize/overview#2": { code: [
          {
            "language": "css",
            "source": "@layer colors, config, root, reboot, layout, content, forms, components, custom, helpers, utilities;"
          }
        ] },
"customize/overview#3": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss';\n@layer custom { .project-button { border-radius: 1rem; } }\n.project-card { padding: 2rem; }"
          }
        ] },
"customize/sass#0": { code: [
          {
            "language": "shell",
            "source": "npm install --save-dev sass"
          }
        ] },
"customize/sass#1": { code: [
          {
            "language": "text",
            "source": "src/scss/\n  _colors.scss        base semantic colors\n  _config.scss        configuration and utility defaults\n  _theme.scss         semantic theme maps\n  _root.scss          emitted runtime variables\n  buttons/ content/ forms/ helpers/ layout/ mixins/ utilities/\n  extensions/         Tremplin-only additions\n  tremplin.scss       full entry point"
          }
        ] },
"customize/sass#2": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss' with (\n  $radius: .75rem,\n  $enable-shadows: false,\n  $root-tokens: (--trm-body-font-family: 'Arial, sans-serif')\n);\n@use 'sass:map';\n@use 'tremplin/scss/config' as config;\n@use 'tremplin/scss/mixins/focus-ring' as focus;\n.product-focus {\n  padding: map.get(config.$spacers, 3);\n  &:focus-visible { @include focus.focus-ring(true); }\n}"
          }
        ] },
"customize/sass#3": { code: [
          {
            "language": "shell",
            "source": "npx sass --load-path=node_modules app.scss public/app.css --style=compressed"
          }
        ] },
"customize/sass#4": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss' with (\n  $spacers: (6: 4rem, 2: null),\n  $utilities: ('cursor': (property: cursor, class: cursor, values: (pointer: pointer), important: false))\n);"
          }
        ] },
"customize/options#1": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss' with (\n  $enable-rounded: false,\n  $enable-shadows: false,\n  $enable-smooth-scroll: false\n);"
          }
        ] },
"customize/color#2": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss' with ($colors: (blue: #075985));"
          },
          {
            "language": "css",
            "source": ":root {\n  --trm-primary-base: #075985;\n  --trm-primary-bg: #075985;\n  --trm-primary-contrast: #fff;\n}"
          }
        ] },
"customize/theme#1": { code: [
          {
            "language": "css",
            "source": ".billing-area {\n  --trm-primary-base: #075985;\n  --trm-primary-bg: #075985;\n  --trm-primary-contrast: #fff;\n  --trm-primary-bg-subtle: #e0f2fe;\n  --trm-primary-fg-emphasis: #0c4a6e;\n}"
          }
        ] },
"customize/theme#3": { code: [
          {
            "language": "html",
            "source": "<button class=\"btn-outline theme-inverse\" type=\"button\">Continue</button>"
          }
        ] },
"customize/theme#4": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss' with (\n  $theme-colors: (primary: (\n    base: #075985, fg: light-dark(#075985, #bae6fd),\n    fg-emphasis: light-dark(#0c4a6e, #e0f2fe),\n    bg: #075985, bg-subtle: light-dark(#e0f2fe, #082f49),\n    bg-muted: light-dark(#bae6fd, #0c4a6e),\n    border: light-dark(#7dd3fc, #0369a1),\n    focus-ring: #38bdf8, contrast: #fff\n  ))\n);"
          }
        ] },
"customize/color-modes#0": { code: [
          {
            "language": "html",
            "source": "<html lang=\"en\" data-trm-theme=\"dark\">"
          }
        ] },
"customize/color-modes#1": { code: [
          {
            "language": "js",
            "source": "let chosen = 'auto'\ntry { chosen = localStorage.getItem('theme') ?? 'auto' } catch {}\nif (chosen === 'light' || chosen === 'dark') {\n  document.documentElement.dataset.trmTheme = chosen\n} else {\n  document.documentElement.removeAttribute('data-trm-theme')\n}"
          }
        ] },
"customize/color-modes#2": { code: [
          {
            "language": "css",
            "source": "[data-trm-theme=\"product\"] {\n  color-scheme: light;\n  --trm-bg-body: #f8fafc;\n  --trm-fg-body: #0f172a;\n  --trm-bg-1: #f1f5f9;\n  --trm-border-color: #94a3b8;\n}"
          }
        ] },
"customize/components#0": { code: [
          {
            "language": "html",
            "source": "<article class=\"card\">\n  <div class=\"card-body\">\n    <h2>Project summary</h2>\n    <p>Use semantic HTML inside component classes.</p>\n  </div>\n</article>"
          }
        ] },
"customize/components#2": { code: [
          {
            "language": "html",
            "source": "<div class=\"d-flex flex-column md:flex-row gap-3\">\n  <article class=\"card\"><div class=\"card-body\">First</div></article>\n  <article class=\"card\"><div class=\"card-body\">Second</div></article>\n</div>"
          }
        ] },
"customize/components#3": { code: [
          {
            "language": "css",
            "source": ".project-notice {\n  padding: 1rem;\n  border-inline-start: .25rem solid var(--trm-primary-border);\n  background: var(--trm-bg-1);\n  color: var(--trm-fg-body);\n}"
          }
        ] },
"customize/transitions#2": { code: [
          {
            "language": "css",
            "source": ".collapse {\n  --trm-transition-collapse-duration: .2s;\n  --trm-transition-collapse-timing: ease-out;\n}\n.fade { --trm-transition-fade-duration: .1s; }"
          }
        ] },
"customize/transitions#3": { code: [
          {
            "language": "css",
            "source": "@media (prefers-reduced-motion: reduce) {\n  .project-notice { transition: none; animation: none; }\n}"
          }
        ] },
"customize/rtl#1": { code: [
          {
            "language": "html",
            "source": "<html lang=\"ar\" dir=\"rtl\">\n<!-- Include the same tremplin.min.css used for LTR. -->"
          }
        ] },
"customize/rtl#2": { code: [
          {
            "language": "css",
            "source": ".project-notice {\n  padding-inline: 1rem;\n  border-inline-start: .25rem solid var(--trm-primary-border);\n  text-align: start;\n}"
          }
        ] },
"customize/optimize#1": { code: [
          {
            "language": "js",
            "source": "import 'tremplin/css'\nimport Collapse from 'tremplin/collapse'\nCollapse.getOrCreateInstance('#details')"
          }
        ] },
"customize/optimize#3": { code: [
          {
            "language": "shell",
            "source": "# In the framework repository\nnpm run check:size\nnpm run test:package"
          }
        ] },
"customize/css-variables#0": { code: [
          {
            "language": "css",
            "source": ":root {\n  --trm-primary-base: #075985;\n  --trm-primary-bg: #075985;\n  --trm-primary-contrast: #fff;\n  --trm-focus-ring-width: 3px;\n  --trm-focus-ring-color: rgb(7 89 133 / .5);\n}"
          }
        ] },
"customize/css-variables#1": { code: [
          {
            "language": "css",
            "source": ".brand-button.btn-solid {\n  --trm-btn-bg: #075985;\n  --trm-btn-border-color: #075985;\n  --trm-btn-color: #fff;\n}"
          }
        ] },
}
