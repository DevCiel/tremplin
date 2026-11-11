import type { CodeSample } from './guide-docs'

// Shared executable samples only; prose is authored in content/docs/.
export const layoutExamples: Record<string, { code: CodeSample[]; example?: string }> = {
"layout/breakpoints#2": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss/layout/breakpoints' as bp;\n.dashboard { display: grid; }\n@include bp.media-breakpoint-up(lg) {\n  .dashboard { grid-template-columns: 18rem 1fr; }\n}"
          }
        ] },
"layout/breakpoints#3": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss/layout/breakpoints' as bp;\n@include bp.media-breakpoint-down(md) { .project-navigation { flex-direction: column; } }"
          }
        ] },
"layout/breakpoints#4": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss/layout/breakpoints' as bp;\n@include bp.media-breakpoint-only(md) { .project-panel { width: 40rem; } }"
          }
        ] },
"layout/breakpoints#5": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss/layout/breakpoints' as bp;\n@include bp.media-breakpoint-between(md, xl) { .project-summary { display: grid; } }"
          }
        ] },
"layout/breakpoints#6": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss/config' with (\n  $breakpoints: (base: 0, compact: 30rem, wide: 60rem),\n  $container-max-widths: (sm: null, md: null, lg: null, xl: null, 2xl: null, compact: 28rem, wide: 56rem)\n);\n@use 'tremplin/scss/tremplin-grid';"
          }
        ] },
"layout/breakpoints#8": { code: [
          {
            "language": "html",
            "source": "<div class=\"row g-3\"><div class=\"col-12 2xl:col-6\">First</div><div class=\"col-12 2xl:col-6\">Second</div></div>"
          }
        ], example: "<div class=\"row g-3\" data-layout-demo=\"largest-canonical\"><div class=\"col-12 2xl:col-6\"><div class=\"border rounded p-3\">Canonical 2xl</div></div><div class=\"col-12 2xl:col-6\"><div class=\"border rounded p-3\">Canonical 2xl</div></div></div>" },
"layout/breakpoints#9": { code: [
          {
            "language": "html",
            "source": "<div class=\"grid\">\n  <article class=\"g-col-12 sm:g-col-6\">First</article>\n  <article class=\"g-col-12 sm:g-col-6\">Second</article>\n</div>"
          }
        ] },
"layout/breakpoints#10": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss/layout/breakpoints' as bp;\n.project-frame { @include bp.set-container(inline-size, project-frame); }\n@include bp.container-breakpoint-between(sm, lg, project-frame) { .project-items { display: grid; } }\n@include bp.container-breakpoint-only(lg, project-frame) { .project-items { grid-template-columns: 1fr 1fr; } }\n@include bp.container-breakpoint-down(sm, project-frame) { .project-items { display: block; } }"
          }
        ] },
"layout/breakpoints#12": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss/layout/breakpoints' as bp;\n$tiers: (base: 0, compact: 30rem, wide: 60rem);\n@include bp.loop-breakpoints-up($tiers) using ($name, $prefix) {\n  @include bp.media-breakpoint-up($name, $tiers) { .#{$prefix}project-grid { display: grid; } }\n}"
          }
        ] },
"layout/containers#1": { code: [
          {
            "language": "html",
            "source": "<main class=\"container\">\n  <h1>Project dashboard</h1>\n</main>"
          }
        ], example: "<div class=\"container border rounded p-3\">A centered responsive container</div>" },
"layout/containers#2": { code: [
          {
            "language": "html",
            "source": "<main class=\"md:container\">\n  <h1>Responsive project content</h1>\n</main>"
          }
        ], example: "<div class=\"md:container border rounded p-3\" data-layout-demo=\"responsive-container\">Fluid below md; constrained from md upward</div>" },
"layout/containers#3": { code: [
          {
            "language": "html",
            "source": "<div class=\"container-fluid\">Full-width content with inline gutters</div>"
          }
        ] },
"layout/containers#4": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss' with (\n  $container-padding-x: 2rem,\n  $container-max-widths: (md: 740px)\n);"
          }
        ] },
"layout/containers#5": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss/layout/containers' as containers;\n.project-frame { @include containers.make-container(); }\n.project-narrow-frame { @include containers.make-container(1rem); }"
          }
        ] },
"layout/grid#0": { code: [
          {
            "language": "html",
            "source": "<div class=\"container\">\n  <div class=\"row g-3\">\n    <div class=\"col\">First column</div>\n    <div class=\"col\">Second column</div>\n    <div class=\"col\">Third column</div>\n  </div>\n</div>"
          }
        ], example: "<div class=\"container\"><div class=\"row g-3\"><div class=\"col\"><div class=\"border rounded p-3\">First column</div></div><div class=\"col\"><div class=\"border rounded p-3\">Second column</div></div><div class=\"col\"><div class=\"border rounded p-3\">Third column</div></div></div></div>" },
"layout/grid#3": { code: [
          {
            "language": "html",
            "source": "<div class=\"row g-3\">\n  <div class=\"col\">Flexible</div>\n  <div class=\"col-auto\">Content-sized</div>\n  <div class=\"col\">Flexible</div>\n</div>"
          }
        ] },
"layout/grid#4": { code: [
          {
            "language": "html",
            "source": "<div class=\"row g-3\">\n  <aside class=\"col-12 md:col-4\">Sidebar</aside>\n  <section class=\"col-12 md:col-8\">Main content</section>\n</div>"
          }
        ], example: "<div class=\"container\"><div class=\"row g-3\" data-layout-demo=\"responsive\"><div class=\"col-12 md:col-4\"><div class=\"border rounded p-3\">Sidebar</div></div><div class=\"col-12 md:col-8\"><div class=\"border rounded p-3\">Main content</div></div></div></div>" },
"layout/grid#5": { code: [
          {
            "language": "javascript",
            "source": "import 'tremplin/css/reboot'\nimport 'tremplin/css/grid'"
          },
          {
            "language": "html",
            "source": "<div class=\"d-flex flex-column md:flex-row gap-3 px-3\">\n  <span>Responsive flex</span>\n  <span class=\"md:ms-auto\">Automatic margin</span>\n</div>"
          }
        ], example: "<div class=\"d-flex flex-column md:flex-row gap-3 px-3\" data-layout-demo=\"grid-utilities\"><span>Responsive flex</span><span class=\"md:ms-auto\">Automatic margin</span></div>" },
"layout/grid#6": { code: [
          {
            "language": "html",
            "source": "<div class=\"row row-cols-1 md:row-cols-3 g-3\">\n  <div class=\"col\">First card</div>\n  <div class=\"col\">Second card</div>\n  <div class=\"col\">Third card</div>\n</div>"
          }
        ] },
"layout/grid#7": { code: [
          {
            "language": "html",
            "source": "<div class=\"row g-3\">\n  <div class=\"md:col-8\">\n    <div class=\"row g-2\">\n      <div class=\"col-6\">Nested first half</div>\n      <div class=\"col-6\">Nested second half</div>\n    </div>\n  </div>\n  <div class=\"md:col-4\">Sibling</div>\n</div>"
          }
        ] },
"layout/grid#8": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss/mixins/grid' as grid;\n.project-row { @include grid.make-row(); > * { @include grid.make-col-ready(); } }\n.project-column { @include grid.make-col(6); }"
          }
        ] },
"layout/grid#9": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss/mixins/grid' as grid;\n.project-row { @include grid.make-row(); > * { @include grid.make-col-ready(); } }\n.project-frame { @include grid.make-grid-columns(4, $breakpoints: (base: 0, compact: 30rem)); }"
          }
        ] },
"layout/columns#0": { code: [
          {
            "language": "html",
            "source": "<div class=\"row align-items-center justify-content-between\">\n  <div class=\"col-4\">First</div>\n  <div class=\"col-4 align-self-end\">Second</div>\n</div>"
          }
        ], example: "<div class=\"container\"><div class=\"row align-items-center g-3\"><div class=\"col-6\"><div class=\"border rounded p-3\">Short</div></div><div class=\"col-6\"><div class=\"border rounded p-3\">A taller column<br>with another line</div></div></div></div>" },
"layout/columns#1": { code: [
          {
            "language": "html",
            "source": "<div class=\"row\">\n  <div class=\"col-8\">Eight units</div>\n  <div class=\"col-6\">Six units: wraps to the next line</div>\n</div>"
          }
        ] },
"layout/columns#2": { code: [
          {
            "language": "html",
            "source": "<div class=\"row\">\n  <div class=\"col\">First</div>\n  <div class=\"w-100\" aria-hidden=\"true\"></div>\n  <div class=\"col\">Next line</div>\n</div>"
          }
        ] },
"layout/columns#3": { code: [
          {
            "language": "html",
            "source": "<div class=\"row\">\n  <div class=\"col order-2 md:order-1\">First in the DOM</div>\n  <div class=\"col order-1 md:order-2\">Second in the DOM</div>\n</div>"
          }
        ] },
"layout/columns#4": { code: [
          {
            "language": "html",
            "source": "<div class=\"row\">\n  <div class=\"col-6 offset-3 md:offset-0\">Centered below md</div>\n</div>"
          }
        ], example: "<div class=\"container\"><div class=\"row\" data-layout-demo=\"offset\"><div class=\"col-6 offset-3 md:offset-0\"><div class=\"border rounded p-3\">Centered below md; reset at md</div></div></div></div>" },
"layout/gutters#1": { code: [
          {
            "language": "html",
            "source": "<div class=\"container\">\n  <div class=\"row gx-4\">\n    <div class=\"col\"><div class=\"border p-3\">First</div></div>\n    <div class=\"col\"><div class=\"border p-3\">Second</div></div>\n  </div>\n</div>"
          }
        ], example: "<div class=\"container\"><div class=\"row gx-4\"><div class=\"col\"><div class=\"border rounded p-3\">First</div></div><div class=\"col\"><div class=\"border rounded p-3\">Second</div></div></div></div>" },
"layout/gutters#2": { code: [
          {
            "language": "html",
            "source": "<div class=\"row row-cols-1 md:row-cols-2 gy-3\">\n  <div class=\"col\">First</div>\n  <div class=\"col\">Second</div>\n  <div class=\"col\">Third</div>\n</div>"
          }
        ] },
"layout/gutters#3": { code: [
          {
            "language": "html",
            "source": "<div class=\"row g-2 md:gx-4 md:gy-3\">...</div>"
          }
        ], example: "<div class=\"container\"><div class=\"row row-cols-1 md:row-cols-2 g-3\" data-layout-demo=\"gutters\"><div class=\"col\"><div class=\"border rounded p-3\">First</div></div><div class=\"col\"><div class=\"border rounded p-3\">Second</div></div><div class=\"col\"><div class=\"border rounded p-3\">Third</div></div><div class=\"col\"><div class=\"border rounded p-3\">Fourth</div></div></div></div>" },
"layout/gutters#4": { code: [
          {
            "language": "html",
            "source": "<div class=\"row g-0\">\n  <div class=\"col-6\">First</div>\n  <div class=\"col-6\">Second</div>\n</div>"
          }
        ] },
"layout/gutters#5": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss' with (\n  $grid-gutter-x: 2rem,\n  $grid-gutter-y: .5rem,\n  $grid-row-columns: 4,\n  $gutters: (0: 0, 2: .5rem, 3: 1rem, wide: 2rem)\n);"
          }
        ] },
"layout/utilities#0": { code: [
          {
            "language": "html",
            "source": "<div class=\"d-none md:d-block\">Visible from md upward</div>"
          }
        ] },
"layout/utilities#1": { code: [
          {
            "language": "html",
            "source": "<div class=\"d-flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3\">\n  <span>Project summary</span>\n  <button class=\"btn-solid theme-inverse\" type=\"button\">Continue</button>\n</div>"
          }
        ], example: "<div class=\"d-flex flex-column md:flex-row gap-3\"><div class=\"border rounded p-3\">First</div><div class=\"border rounded p-3\">Second</div></div>" },
"layout/utilities#2": { code: [
          {
            "language": "html",
            "source": "<div class=\"p-3 lg:p-5\">\n  <p class=\"mb-0\">Content with responsive padding</p>\n</div>"
          }
        ] },
"layout/utilities#3": { code: [
          {
            "language": "html",
            "source": "<div class=\"invisible\">Space is reserved, content is hidden.</div>\n<div class=\"visible\">Visible content</div>"
          }
        ] },
"layout/z-index#3": { code: [
          {
            "language": "scss",
            "source": "@use 'sass:map';\n@use 'tremplin/scss/config' as config with (\n  $zindex-levels: (n1: -1, 0: 0, 1: 1, 2: 2, 3: 3, menu: 1000, sticky: 1010, fixed: 1020, drawer: 1030, dialog: 1040, popover: 1050, tooltip: 1060, toast: 1070)\n);\n@use 'tremplin/scss';\n.project-tooltip { position: absolute; z-index: map.get(config.$zindex-levels, tooltip); }"
          }
        ] },
"layout/css-grid#1": { code: [
          {
            "language": "html",
            "source": "<div class=\"grid\">\n  <article class=\"g-col-4\">First</article>\n  <article class=\"g-col-4\">Second</article>\n  <article class=\"g-col-4\">Third</article>\n</div>"
          }
        ], example: "<div class=\"grid\" data-layout-demo=\"css-grid\"><div class=\"g-col-4 border rounded p-3\">First</div><div class=\"g-col-4 border rounded p-3\">Second</div><div class=\"g-col-4 border rounded p-3\">Third</div></div>" },
"layout/css-grid#2": { code: [
          {
            "language": "html",
            "source": "<div class=\"grid\">\n  <article class=\"g-col-12 sm:g-col-6\">First</article>\n  <article class=\"g-col-12 sm:g-col-6\">Second</article>\n</div>"
          }
        ], example: "<div class=\"grid\" data-layout-demo=\"modern-query\" style=\"resize:horizontal;overflow:auto;min-inline-size:12rem;max-inline-size:100%\"><div class=\"g-col-12 sm:g-col-6 border rounded p-3\">First</div><div class=\"g-col-12 sm:g-col-6 border rounded p-3\">Second</div></div>" },
"layout/css-grid#3": { code: [
          {
            "language": "html",
            "source": "<div class=\"grid\">\n  <article class=\"g-col-6 g-start-4 md:g-col-4 md:g-start-5\">Centered content</article>\n</div>"
          }
        ], example: "<div class=\"grid\"><div class=\"g-col-6 g-start-4 border rounded p-3\">Six tracks, starting at line four</div></div>" },
"layout/css-grid#5": { code: [
          {
            "language": "html",
            "source": "<div class=\"grid\">\n  <section class=\"g-col-12 md:g-col-8\">\n    <div class=\"grid\">\n      <article class=\"g-col-12 sm:g-col-6\">Nested first half</article>\n      <article class=\"g-col-12 sm:g-col-6\">Nested second half</article>\n    </div>\n  </section>\n</div>"
          }
        ] },
"layout/css-grid#6": { code: [
          {
            "language": "css",
            "source": ".project-grid.grid {\n  --trm-columns: 6;\n  --trm-gap: 1.5rem;\n}"
          },
          {
            "language": "scss",
            "source": "@use 'tremplin/scss' with (\n  $grid-columns: 6,\n  $enable-cssgrid: true\n);"
          }
        ] },
"layout/css-grid#7": { code: [
          {
            "language": "html",
            "source": "<div class=\"grid\" style=\"--trm-columns:2;--trm-rows:2;--trm-gap:.5rem;height:8rem\">\n  <article class=\"g-col-1\">First</article>\n  <article class=\"g-col-1\">Second</article>\n  <article class=\"g-col-1\">Third</article>\n</div>"
          }
        ], example: "<div class=\"grid\" data-layout-demo=\"grid-rows\" style=\"--trm-columns:2;--trm-rows:2;--trm-gap:.5rem;height:8rem\"><div class=\"g-col-1 border rounded p-2\">First</div><div class=\"g-col-1 border rounded p-2\">Second</div><div class=\"g-col-1 border rounded p-2\">Third</div></div>" },
"layout/css-grid#8": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss/config' with (\n  $grid-columns: 6,\n  $spacers: (3: .75rem)\n);\n@use 'tremplin/scss/tremplin-grid' with (\n  $utilities: ('order': null)\n);"
          }
        ] },
"layout/css-grid#9": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss/mixins/grid' as grid;\n@use 'tremplin/scss/layout/breakpoints' as bp;\n\n.project-layout {\n  @include bp.set-container();\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  @include grid.make-cssgrid(4, (base: 0, compact: 30rem));\n}"
          }
        ] },
}
