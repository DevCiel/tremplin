import type { CodeSample } from './guide-docs'

// Executable samples only; authored utility prose lives in MDX.
export const utilitiesRawExamples: Record<string, { code?: CodeSample[]; example?: string }[]> = {
  "utilities/api": [
    {},
    {},
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex flex-column md:flex-row gap-2 md:gap-3\">\n  <span>Stacked below md</span><span>Inline from md</span>\n</div>"
        }
      ],
      "example": "<div class=\"d-flex flex-column md:flex-row gap-2 md:gap-3\" data-utility-api-demo=\"responsive\"><span class=\"border rounded p-2\">Stacked below md</span><span class=\"border rounded p-2\">Inline from md</span></div>"
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: (\n    'inline-padding': (property: padding-inline-start padding-inline-end, class: project-px, values: (2: .5rem)),\n    'cursor': (property: cursor, values: pointer wait),\n    'type-size': (property: (font-size: 1rem, line-height: 1.5), class: project-type, values: (small: (font-size: .875rem)))\n  )\n);"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: (\n    'project-tone': (\n      property: ('--project-tone': null, color: var(--project-tone)),\n      class: project-tone, values: (brand: #075985)\n    )\n  )\n);"
        },
        {
          "language": "html",
          "source": "<p class=\"project-tone-brand\">Composed color</p>"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: (\n    'project-pattern': (\n      selector: attr-starts, class: 'project-card-',\n      property: padding-inline-start, values: 6px\n    )\n  )\n);"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: (\n    'project-space': (\n      property: margin-block-start, class: project-space,\n      child-selector: '> * + *', responsive: true, state: hover,\n      values: (3: 1rem)\n    )\n  )\n);"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: (\n    'project-cursor': (property: cursor, class: project-cursor, responsive: true, values: (pointer: pointer)),\n    'project-fade': (property: opacity, class: project-fade, responsive: true, print: true, dark: true, state: hover focus-visible, values: (50: .5))\n  )\n);"
        },
        {
          "language": "html",
          "source": "<!-- Compile the custom map above before using these classes. -->\n<button class=\"md:project-cursor-pointer hover:project-fade-50\" type=\"button\">Custom utility example</button>\n<p class=\"print:project-fade-50 dark:project-fade-50\">Explicit print and dark variants</p>"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: (\n    'float': null,\n    'opacity': (property: opacity, class: opacity, state: hover, values: (50: .5, 100: 1)),\n    'cursor': (enabled: false)\n  )\n);"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: (\n    'project-display': (property: display, class: project-display, important: true, values: (flex: flex))\n  )\n);"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: (\n    'project-motion': (property: animation, class: project-motion, responsive: true, state: hover, values: (pop: animation-pop .3s ease both))\n  )\n);"
        },
        {
          "language": "html",
          "source": "<div class=\"project-motion-demo hover:project-motion-pop\">Optional decorative motion</div>"
        },
        {
          "language": "css",
          "source": "/* Application preference rule for the normal-priority example above. */\n@media (prefers-reduced-motion: reduce) {\n  .project-motion-demo { animation: none !important; }\n}"
        }
      ]
    },
    {
      "code": [
        {
          "language": "shell",
          "source": "# Framework repository\nnpm.cmd run test:sass:utility-api\nnpm.cmd run build:css\nnpm.cmd run check:size"
        }
      ]
    }
  ],
  "utilities/colors": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"bg-subtle-primary fg-emphasis-primary border rounded p-3\">A deliberately paired foreground and surface.</div>"
        }
      ],
      "example": "<div class=\"bg-subtle-primary fg-emphasis-primary border rounded p-3\">A deliberately paired foreground and surface.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "fg-primary\nfg-secondary\nfg-success\nfg-danger\nfg-warning\nfg-info\nfg-accent\nfg-inverse\nfg-emphasis-primary\nfg-contrast-primary\nfg-body\nfg-1\nfg-2\nfg-3\nfg-4\nfg-bg\nfg-white\nfg-black\nfg-reset\nfg-10\nfg-50\nfg-100"
        }
      ]
    },
    {},
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/theme' with (\n  $theme-colors: (brand: (base: #253a76, fg: #253a76, bg: #dce6ff, contrast: #17213b))\n);\n@use 'tremplin/scss/tremplin-utilities';"
        }
      ]
    },
    {}
  ],
  "utilities/background": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"bg-body fg-body border rounded p-3\">A neutral surface with its body foreground.</div>"
        }
      ],
      "example": "<div class=\"bg-body fg-body border rounded p-3\">A neutral surface with its body foreground.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "bg-primary\nbg-secondary\nbg-success\nbg-danger\nbg-warning\nbg-info\nbg-accent\nbg-inverse\nbg-subtle-primary\nbg-muted-primary\nbg-body\nbg-1\nbg-2\nbg-3\nbg-4\nbg-fg\nbg-white\nbg-black\nbg-transparent\nbg-10\nbg-50\nbg-100\nbg-gradient"
        }
      ]
    },
    {},
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/theme' with ($theme-bgs: (panel: #e6efff));\n@use 'tremplin/scss/tremplin-utilities';"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/config' with ($gradient: linear-gradient(135deg, #e6efff, #fff));\n@use 'tremplin/scss/mixins/gradients' as gradient;\n@use 'tremplin/scss/tremplin-utilities';\n.three-color-x { @include gradient.gradient-x-three-colors(red, gold, 40%, blue); }\n.three-color-y { @include gradient.gradient-y-three-colors(red, gold, 60%, blue); }"
        }
      ]
    },
    {}
  ],
  "utilities/color-scheme": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"color-scheme-auto bg-body fg-body border rounded p-3\">Native color-scheme selection.</div>"
        }
      ],
      "example": "<div class=\"color-scheme-auto bg-body fg-body border rounded p-3\">Native color-scheme selection.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "color-scheme-light\ncolor-scheme-dark\ncolor-scheme-auto"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/theme": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"theme-inverse theme-contrast theme-border rounded p-3\">A coordinated inverse surface.</div>"
        }
      ],
      "example": "<div class=\"theme-inverse theme-contrast theme-border rounded p-3\">A coordinated inverse surface.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "theme-primary\ntheme-secondary\ntheme-success\ntheme-danger\ntheme-warning\ntheme-info\ntheme-accent\ntheme-inverse\ntheme-reset\ntheme-contrast\ntheme-subtle\ntheme-muted\ntheme-border"
        }
      ]
    },
    {},
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/theme' with (\n  $theme-colors: (brand: (base: #253a76, fg: #253a76, bg: #dce6ff, contrast: #17213b))\n);\n@use 'tremplin/scss/tremplin-utilities';"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: ('theme-subtle': null, 'theme-border': (enabled: false))\n);"
        }
      ]
    },
    {}
  ],
  "utilities/aspect-ratio": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"ratio-16x9 border rounded p-3\" style=\"width:100%\">A native 16:9 box.</div>"
        }
      ],
      "example": "<div class=\"ratio-16x9 border rounded p-3\" style=\"width:100%\">A native 16:9 box.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "ratio-auto\nratio-1x1\nratio-4x3\nratio-16x9\nratio-21x9"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/config' with ($aspect-ratios: (square: '1 / 1'));\n@use 'tremplin/scss/tremplin-utilities';"
        }
      ]
    },
    {}
  ],
  "utilities/container-queries": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"contains-inline border rounded p-3\">This box establishes inline-size containment.</div>"
        }
      ],
      "example": "<div class=\"contains-inline border rounded p-3\">This box establishes inline-size containment.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "contains-inline\ncontains-size"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "css",
          "source": ".project-frame { container-type: inline-size; }\n@container (width >= 30rem) {\n  .project-items { display: flex; }\n}"
        }
      ]
    },
    {}
  ],
  "utilities/display": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex flex-wrap gap-2\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
        }
      ],
      "example": "<div class=\"d-flex flex-wrap gap-2\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "d-none\nd-block\nd-inline-block\nd-flex\nd-inline-flex\nd-grid\nd-inline-grid\nd-table\nd-table-row\nd-table-cell\nd-contents\nd-flow-root\nmd:d-inline-grid"
        }
      ]
    },
    {},
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: ('display': (property: display, class: d, responsive: true, print: true, values: (block: block, none: none)))\n);"
        }
      ]
    },
    {}
  ],
  "utilities/float": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border rounded p-3\" style=\"display:flow-root\"><span class=\"float-start border p-2 me-2\">Media</span>Text wraps beside the floated region.</div>"
        }
      ],
      "example": "<div class=\"border rounded p-3\" style=\"display:flow-root\"><span class=\"float-start border p-2 me-2\">Media</span>Text wraps beside the floated region.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "float-start\nfloat-end\nfloat-none\nmd:float-end"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/object-fit": [
    {
      "code": [
        {
          "language": "html",
          "source": "<img class=\"object-fit-cover rounded\" src=\"/content-sample.svg\" width=\"240\" height=\"120\" style=\"width:15rem;height:7.5rem;max-width:100%\" alt=\"Abstract blue panels cropped into a wide box\">"
        }
      ],
      "example": "<img class=\"object-fit-cover rounded\" src=\"/content-sample.svg\" width=\"240\" height=\"120\" style=\"width:15rem;height:7.5rem;max-width:100%\" alt=\"Abstract blue panels cropped into a wide box\">"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "object-fit-cover\nobject-fit-contain\nobject-fit-fill\nobject-fit-scale\nobject-fit-none\nmd:object-fit-cover"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/overflow": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div tabindex=\"0\" role=\"region\" aria-label=\"Overflow example\" class=\"overflow-auto border rounded p-3\" style=\"max-height:5rem\">Scrollable content remains keyboard reachable.<br>Check long content at narrow sizes.<br>Keep focus indicators visible.</div>"
        }
      ],
      "example": "<div tabindex=\"0\" role=\"region\" aria-label=\"Overflow example\" class=\"overflow-auto border rounded p-3\" style=\"max-height:5rem\">Scrollable content remains keyboard reachable.<br>Check long content at narrow sizes.<br>Keep focus indicators visible.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "overflow-auto\noverflow-hidden\noverflow-visible\noverflow-scroll\noverflow-x-auto\noverflow-y-auto"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/position": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"position-relative border rounded\" style=\"height:5rem\"><span class=\"position-absolute top-0 start-0 p-2\">Positioned at the start.</span></div>"
        }
      ],
      "example": "<div class=\"position-relative border rounded\" style=\"height:5rem\"><span class=\"position-absolute top-0 start-0 p-2\">Positioned at the start.</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "position-static\nposition-relative\nposition-absolute\nposition-fixed\nposition-sticky\ntop-0\nbottom-0\nstart-0\nend-0\ntranslate-middle\ntranslate-middle-x\ntranslate-middle-y"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/visibility": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border rounded p-3\"><span class=\"invisible\">Reserved space</span><span>Visible sibling</span></div>"
        }
      ],
      "example": "<div class=\"border rounded p-3\"><span class=\"invisible\">Reserved space</span><span>Visible sibling</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "visible\ninvisible"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/z-index": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"position-relative z-3 border rounded p-3\">Layer 3 within this stacking context.</div>"
        }
      ],
      "example": "<div class=\"position-relative z-3 border rounded p-3\">Layer 3 within this stacking context.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "z-n1\nz-0\nz-1\nz-2\nz-3\nz-menu\nz-sticky\nz-fixed\nz-drawer\nz-dialog\nz-popover\nz-tooltip\nz-toast"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/config' with ($zindex-levels: (menu: 1000, dialog: 1200));\n@use 'tremplin/scss/tremplin-utilities';"
        }
      ]
    },
    {}
  ],
  "utilities/align-content": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex flex-wrap align-content-center gap-2 border p-2\" style=\"min-height:10rem;max-width:14rem\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
        }
      ],
      "example": "<div class=\"d-flex flex-wrap align-content-center gap-2 border p-2\" style=\"min-height:10rem;max-width:14rem\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "align-content-start\nalign-content-center\nalign-content-between\nmd:align-content-center"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/align-items": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex align-items-center gap-2 border p-2\" style=\"min-height:7rem\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
        }
      ],
      "example": "<div class=\"d-flex align-items-center gap-2 border p-2\" style=\"min-height:7rem\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "align-items-start\nalign-items-center\nalign-items-end\nmd:align-items-center"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/align-self": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex gap-2 border p-2\" style=\"min-height:7rem\"><span class=\"align-self-start border p-2\">Start</span><span class=\"align-self-end border p-2\">End</span></div>"
        }
      ],
      "example": "<div class=\"d-flex gap-2 border p-2\" style=\"min-height:7rem\"><span class=\"align-self-start border p-2\">Start</span><span class=\"align-self-end border p-2\">End</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "align-self-auto\nalign-self-start\nalign-self-center\nmd:align-self-end"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/flex": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex flex-column md:flex-row gap-2\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
        }
      ],
      "example": "<div class=\"d-flex flex-column md:flex-row gap-2\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "flex-row\nflex-column\nflex-wrap\nflex-fill\nflex-grow-1\nflex-shrink-0\nmd:flex-row"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/gap": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex flex-wrap row-gap-2 column-gap-3\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
        }
      ],
      "example": "<div class=\"d-flex flex-wrap row-gap-2 column-gap-3\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "gap-0\ngap-2\ngap-3\nmd:gap-4\nrow-gap-0\nrow-gap-2\nmd:row-gap-4\ncolumn-gap-0\ncolumn-gap-3\nmd:column-gap-4"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-grid grid-cols-2 row-gap-2 column-gap-4 md:row-gap-4\">\n  <div>First</div><div>Second</div><div>Third</div><div>Fourth</div>\n</div>"
        }
      ],
      "example": "<div class=\"d-grid grid-cols-2 row-gap-2 column-gap-4\"><div class=\"border rounded p-2\">First</div><div class=\"border rounded p-2\">Second</div><div class=\"border rounded p-2\">Third</div><div class=\"border rounded p-2\">Fourth</div></div>"
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss' with (\n  $spacers: (2: .75rem),\n  $utilities: (\n    'column-gap': (\n      property: column-gap, class: column-gap, responsive: true,\n      important: false, values: (tight: .25rem)\n    )\n  )\n);"
        }
      ]
    },
    {}
  ],
  "utilities/grid": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-grid grid-cols-2 md:grid-cols-3 gap-2\"><div class=\"border rounded p-2\">First</div><div class=\"border rounded p-2\">Second</div><div class=\"border rounded p-2\">Third</div><div class=\"grid-cols-fill border rounded p-2\">Full explicit row</div></div>"
        }
      ],
      "example": "<div class=\"d-grid grid-cols-2 md:grid-cols-3 gap-2\"><div class=\"border rounded p-2\">First</div><div class=\"border rounded p-2\">Second</div><div class=\"border rounded p-2\">Third</div><div class=\"grid-cols-fill border rounded p-2\">Full explicit row</div></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "d-grid\ngrid\ng-col-6\nmd:g-col-4\ngrid-cols-1\ngrid-cols-2\ngrid-cols-3\ngrid-cols-4\ngrid-cols-6\ngrid-cols-subgrid\ngrid-cols-fill\nmd:grid-cols-3\ngrid-auto-flow-row\ngrid-auto-flow-column\ngrid-auto-flow-dense\nmd:grid-auto-flow-column"
        }
      ]
    },
    {},
    {},
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-grid grid-cols-2 column-gap-3\">\n  <div class=\"d-grid grid-cols-fill grid-cols-subgrid\">\n    <div>Aligned first</div><div>Aligned second</div>\n  </div>\n</div>"
        }
      ],
      "example": "<div class=\"d-grid grid-cols-2 column-gap-3 row-gap-2\"><span class=\"border p-2\">Parent first</span><span class=\"border p-2\">Parent second</span><div class=\"d-grid grid-cols-fill grid-cols-subgrid\"><span class=\"border p-2\">Aligned first</span><span class=\"border p-2\">Aligned second</span></div></div>"
    },
    {},
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss' with (\n  $utilities: (\n    'grid-column-counts': (\n      property: grid-template-columns, class: grid-cols,\n      responsive: true, values: (5: repeat(5, 1fr))\n    )\n  )\n);"
        }
      ]
    },
    {}
  ],
  "utilities/justify-content": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex justify-content-between gap-2 border p-2\"><span>Start</span><span>End</span></div>"
        }
      ],
      "example": "<div class=\"d-flex justify-content-between gap-2 border p-2\"><span>Start</span><span>End</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "justify-content-start\njustify-content-center\njustify-content-between\nmd:justify-content-end"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/justify-items": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-grid grid-cols-2 justify-items-center gap-2 border p-2\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
        }
      ],
      "example": "<div class=\"d-grid grid-cols-2 justify-items-center gap-2 border p-2\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "justify-items-start\njustify-items-end\njustify-items-center\njustify-items-stretch\nmd:justify-items-center\njustify-self-start\njustify-self-center\nmd:justify-self-end"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/place-items": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-grid grid-cols-2 place-items-center gap-2 border p-2\" style=\"min-height:8rem\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
        }
      ],
      "example": "<div class=\"d-grid grid-cols-2 place-items-center gap-2 border p-2\" style=\"min-height:8rem\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "place-items-start\nplace-items-end\nplace-items-center\nplace-items-stretch\nmd:place-items-center"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/width": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border rounded p-2\"><div class=\"w-50 border rounded p-2\">Half the parent width.</div></div>"
        }
      ],
      "example": "<div class=\"border rounded p-2\"><div class=\"w-50 border rounded p-2\">Half the parent width.</div></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "w-1\nw-2\nw-25\nw-50\nw-75\nw-100\nw-auto\nw-min\nw-max\nw-fit\nmax-w-100\nmin-w-0\nmin-w-100\nvw-100\nmin-vw-100\ndvw-100\nmin-dvw-100"
        }
      ]
    },
    {},
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: (\n    'width': (property: width, class: w, values: (min: 10rem, 100: 100%)),\n    'height': (property: height, class: h, values: (min: 10rem, 100: 100%))\n  )\n);"
        }
      ]
    },
    {}
  ],
  "utilities/height": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border rounded\" style=\"height:8rem\"><div class=\"h-50 border p-2\">Half the definite parent height.</div></div>"
        }
      ],
      "example": "<div class=\"border rounded\" style=\"height:8rem\"><div class=\"h-50 border p-2\">Half the definite parent height.</div></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "h-25\nh-50\nh-75\nh-100\nh-auto\nh-min\nh-max\nh-fit\nmax-h-100\nmin-h-0\nmin-h-100\nvh-100\nmin-vh-100\ndvh-100\nmin-dvh-100"
        }
      ]
    },
    {},
    {},
    {}
  ],
  "utilities/margin": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border rounded p-3\"><div class=\"ms-3 border p-2\">Logical inline-start margin.</div></div>"
        }
      ],
      "example": "<div class=\"border rounded p-3\"><div class=\"ms-3 border p-2\">Logical inline-start margin.</div></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "m-0\nmt-3\nms-3\nme-3\nmx-auto\nms--1\nme--2\nmd:m-3\nmd:ms-auto"
        }
      ]
    },
    {},
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/config' with ($spacers: (3: 1rem), $negative-spacers: ('-2': -.75rem));\n@use 'tremplin/scss/tremplin-utilities';"
        }
      ]
    },
    {}
  ],
  "utilities/padding": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border rounded p-3\">Padding inside the box.</div>"
        }
      ],
      "example": "<div class=\"border rounded p-3\">Padding inside the box.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "p-0\np-3\npx-4\npy-2\nps-3\npe-3\nmd:p-4"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/space": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex space-x-3\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
        }
      ],
      "example": "<div class=\"d-flex space-x-3\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "space-x-0\nspace-x-3\nmd:space-x-2\nspace-y-0\nspace-y-3\nmd:space-y-2"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/font-family": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p class=\"font-monospace\">A monospace identifier.</p>"
        }
      ],
      "example": "<p class=\"font-monospace\">A monospace identifier.</p>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "font-body\nfont-monospace"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/font-size": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p class=\"text-lg\">A text-size preset with coordinated line height.</p>"
        }
      ],
      "example": "<p class=\"text-lg\">A text-size preset with coordinated line height.</p>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "fs-xs\nfs-sm\nfs-md\nfs-lg\nfs-xl\ntext-sm\ntext-md\ntext-lg"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/font-style": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p class=\"fst-italic\">An italic visual treatment.</p>"
        }
      ],
      "example": "<p class=\"fst-italic\">An italic visual treatment.</p>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "fst-italic\nfst-normal"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/font-weight": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p class=\"fw-semibold\">A semibold visual treatment.</p>"
        }
      ],
      "example": "<p class=\"fw-semibold\">A semibold visual treatment.</p>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "fw-light\nfw-normal\nfw-medium\nfw-semibold\nfw-bold"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/line-height": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p class=\"lh-lg\">Comfortable line spacing for this example.<br>Readability still depends on content and font metrics.</p>"
        }
      ],
      "example": "<p class=\"lh-lg\">Comfortable line spacing for this example.<br>Readability still depends on content and font metrics.</p>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "lh-1\nlh-sm\nlh-md\nlh-lg"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/link": [
    {
      "code": [
        {
          "language": "html",
          "source": "<a class=\"link-100\" style=\"--trm-link-color:var(--trm-primary-fg-emphasis)\" href=\"/utilities/api/\">Read the Utility API</a>"
        }
      ],
      "example": "<a class=\"link-100\" style=\"--trm-link-color:var(--trm-primary-fg-emphasis)\" href=\"/utilities/api/\">Read the Utility API</a>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "link-10\nlink-20\nlink-30\nlink-40\nlink-50\nlink-60\nlink-70\nlink-80\nlink-90\nlink-100\nhover:link-100"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/text-alignment": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p class=\"text-start md:text-end\">Logical text alignment.</p>"
        }
      ],
      "example": "<p class=\"text-start md:text-end\">Logical text alignment.</p>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "text-start\ntext-center\ntext-end\nmd:text-end"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/text-decoration": [
    {
      "code": [
        {
          "language": "html",
          "source": "<a class=\"fg-emphasis-primary text-decoration-underline underline-primary underline-offset-2 underline-thickness-2\" href=\"/utilities/api/\">A visibly underlined destination</a>"
        }
      ],
      "example": "<a class=\"fg-emphasis-primary text-decoration-underline underline-primary underline-offset-2 underline-thickness-2\" href=\"/utilities/api/\">A visibly underlined destination</a>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "text-decoration-none\ntext-decoration-underline\ntext-decoration-line-through\nunderline-offset-1\nunderline-offset-2\nunderline-offset-3\nunderline-primary\nunderline-secondary\nunderline-success\nunderline-danger\nunderline-warning\nunderline-info\nunderline-accent\nunderline-inverse\nunderline-10\nunderline-50\nunderline-100\nunderline-thickness-1\nunderline-thickness-2\nunderline-thickness-3\nunderline-thickness-4\nunderline-thickness-5\nhover:underline-offset-3\nhover:underline-100\nhover:underline-thickness-3"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: ('underline-thickness': (property: text-decoration-thickness, class: underline-thickness, state: hover focus-visible, values: (4: 4px)))\n);"
        }
      ]
    },
    {}
  ],
  "utilities/text-transform": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p class=\"text-uppercase\">A visual case transformation.</p>"
        }
      ],
      "example": "<p class=\"text-uppercase\">A visual case transformation.</p>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "text-lowercase\ntext-uppercase\ntext-capitalize"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/text-wrapping": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p class=\"text-break\" style=\"max-width:100%\">AnUnbrokenIdentifierThatCanWrapInsteadOfClippingAtNarrowWidths</p>"
        }
      ],
      "example": "<p class=\"text-break\" style=\"max-width:100%\">AnUnbrokenIdentifierThatCanWrapInsteadOfClippingAtNarrowWidths</p>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "text-wrap\ntext-nowrap\ntext-balance\ntext-pretty\ntext-break\ntext-truncate"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/vertical-align": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p>Inline text <span class=\"align-middle\" style=\"font-size:1.5rem\">aligned in the middle</span>.</p>"
        }
      ],
      "example": "<p>Inline text <span class=\"align-middle\" style=\"font-size:1.5rem\">aligned in the middle</span>.</p>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "align-baseline\nalign-top\nalign-middle\nalign-bottom\nalign-text-top\nalign-text-bottom"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/border": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border border-2 rounded p-3\">A two-pixel border.</div>"
        }
      ],
      "example": "<div class=\"border border-2 rounded p-3\">A two-pixel border.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "border\nborder-0\nborder-top\nborder-top-0\nborder-bottom\nborder-bottom-0\nborder-start\nborder-start-0\nborder-end\nborder-end-0\nborder-x\nborder-x-0\nborder-y\nborder-y-0\nborder-keyline\nborder-1\nborder-2\nborder-3\nborder-4\nborder-5"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/config' with ($border-width: 2px, $border-style: dashed, $border-widths: (3: 6px));\n@use 'tremplin/scss/tremplin-utilities';"
        }
      ]
    },
    {}
  ],
  "utilities/border-color": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border border-primary rounded p-3\">Boundary color independent of text color.</div>"
        }
      ],
      "example": "<div class=\"border border-primary rounded p-3\">Boundary color independent of text color.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "border-primary\nborder-secondary\nborder-success\nborder-danger\nborder-warning\nborder-info\nborder-accent\nborder-inverse\nborder-subtle-primary\nborder-body\nborder-muted\nborder-subtle\nborder-emphasized\nborder-white\nborder-black\nborder-bg\nborder-10\nborder-50\nborder-100"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/theme' with ($theme-borders: (panel: #253a76));\n@use 'tremplin/scss/tremplin-utilities';"
        }
      ]
    },
    {}
  ],
  "utilities/border-radius": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border rounded-5 p-3\">Numeric radius scale.</div>"
        }
      ],
      "example": "<div class=\"border rounded-5 p-3\">Numeric radius scale.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "rounded\nrounded-0\nrounded-1\nrounded-2\nrounded-3\nrounded-4\nrounded-5\nrounded-6\nrounded-7\nrounded-8\nrounded-9\nrounded-circle\nrounded-pill\nrounded-size-9\nrounded-top\nrounded-top-0\nrounded-end\nrounded-bottom\nrounded-start"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/config' with ($radii: (9: 2rem));\n@use 'tremplin/scss/tremplin-utilities';"
        }
      ]
    },
    {}
  ],
  "utilities/divide": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex divide-x\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
        }
      ],
      "example": "<div class=\"d-flex divide-x\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "divide-x\ndivide-x-0\nmd:divide-x\ndivide-y\ndivide-y-0\nmd:divide-y-0"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/pointer-events": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border rounded p-3\">Pointer hit-testing is separate from keyboard and semantics.</div>"
        }
      ],
      "example": "<div class=\"border rounded p-3\">Pointer hit-testing is separate from keyboard and semantics.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "pe-none\npe-auto"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/user-select": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p class=\"user-select-text\">A selectable identifier: project-2026</p>"
        }
      ],
      "example": "<p class=\"user-select-text\">A selectable identifier: project-2026</p>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "user-select-all\nuser-select-auto\nuser-select-text\nuser-select-none"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/motion": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"animation-none border rounded p-3\">Static preview; motion is not required.</div>"
        }
      ],
      "example": "<div class=\"animation-none border rounded p-3\">Static preview; motion is not required.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "transition-none\nanimation-none\nanimation-shake\nanimation-pop"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with ($utilities: ('animation': null));"
        }
      ]
    },
    {}
  ],
  "utilities/opacity": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"opacity-100 border rounded p-3\">A fully opaque readable preview.</div>"
        }
      ],
      "example": "<div class=\"opacity-100 border rounded p-3\">A fully opaque readable preview.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "opacity-0\nopacity-25\nopacity-50\nopacity-75\nopacity-100"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/shadows": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"shadow-sm border rounded p-3\">A composable decorative shadow.</div>"
        }
      ],
      "example": "<div class=\"shadow-sm border rounded p-3\">A composable decorative shadow.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "shadow\nshadow-xs\nshadow-sm\nshadow-lg\nshadow-xl\nshadow-none\nshadow-primary\nshadow-secondary\nshadow-success\nshadow-danger\nshadow-warning\nshadow-info\nshadow-accent\nshadow-inverse\nshadow-current\nshadow-black\nshadow-white\nshadow-opacity-10\nshadow-opacity-50\nshadow-opacity-100"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/config' with (\n  $shadows: (null: 0 .25rem .75rem rgb(0 0 0 / .18), sm: 0 .125rem .25rem rgb(0 0 0 / .12))\n);\n@use 'tremplin/scss/tremplin-utilities';"
        }
      ]
    },
    {}
  ]
}

export const utilitiesExamples: Record<string, { code?: CodeSample[]; example?: string }[]> = {
  "utilities/api": [
    {},
    {},
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex flex-column md:flex-row gap-2 md:gap-3\">\n  <span>Stacked below md</span><span>Inline from md</span>\n</div>"
        }
      ],
      "example": "<div class=\"d-flex flex-column md:flex-row gap-2 md:gap-3\" data-utility-api-demo=\"responsive\"><span class=\"border rounded p-2\">Stacked below md</span><span class=\"border rounded p-2\">Inline from md</span></div>"
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: (\n    'inline-padding': (property: padding-inline-start padding-inline-end, class: project-px, values: (2: .5rem)),\n    'cursor': (property: cursor, values: pointer wait),\n    'type-size': (property: (font-size: 1rem, line-height: 1.5), class: project-type, values: (small: (font-size: .875rem)))\n  )\n);"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: (\n    'project-tone': (\n      property: ('--project-tone': null, color: var(--project-tone)),\n      class: project-tone, values: (brand: #075985)\n    )\n  )\n);"
        },
        {
          "language": "html",
          "source": "<p class=\"project-tone-brand\">Composed color</p>"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: (\n    'project-pattern': (\n      selector: attr-starts, class: 'project-card-',\n      property: padding-inline-start, values: 6px\n    )\n  )\n);"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: (\n    'project-space': (\n      property: margin-block-start, class: project-space,\n      child-selector: '> * + *', responsive: true, state: hover,\n      values: (3: 1rem)\n    )\n  )\n);"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: (\n    'project-cursor': (property: cursor, class: project-cursor, responsive: true, values: (pointer: pointer)),\n    'project-fade': (property: opacity, class: project-fade, responsive: true, print: true, dark: true, state: hover focus-visible, values: (50: .5))\n  )\n);"
        },
        {
          "language": "html",
          "source": "<!-- Compile the custom map above before using these classes. -->\n<button class=\"md:project-cursor-pointer hover:project-fade-50\" type=\"button\">Custom utility example</button>\n<p class=\"print:project-fade-50 dark:project-fade-50\">Explicit print and dark variants</p>"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: (\n    'float': null,\n    'opacity': (property: opacity, class: opacity, state: hover, values: (50: .5, 100: 1)),\n    'cursor': (enabled: false)\n  )\n);"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: (\n    'project-display': (property: display, class: project-display, important: true, values: (flex: flex))\n  )\n);"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: (\n    'project-motion': (property: animation, class: project-motion, responsive: true, state: hover, values: (pop: animation-pop .3s ease both))\n  )\n);"
        },
        {
          "language": "html",
          "source": "<div class=\"project-motion-demo hover:project-motion-pop\">Optional decorative motion</div>"
        },
        {
          "language": "css",
          "source": "/* Application preference rule for the normal-priority example above. */\n@media (prefers-reduced-motion: reduce) {\n  .project-motion-demo { animation: none !important; }\n}"
        }
      ]
    },
    {
      "code": [
        {
          "language": "shell",
          "source": "# Framework repository\nnpm.cmd run test:sass:utility-api\nnpm.cmd run build:css\nnpm.cmd run check:size"
        }
      ]
    }
  ],
  "utilities/colors": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"bg-subtle-primary fg-emphasis-primary border rounded p-3\">A deliberately paired foreground and surface.</div>"
        }
      ],
      "example": "<div class=\"bg-subtle-primary fg-emphasis-primary border rounded p-3\">A deliberately paired foreground and surface.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "fg-primary\nfg-secondary\nfg-success\nfg-danger\nfg-warning\nfg-info\nfg-accent\nfg-inverse\nfg-emphasis-primary\nfg-contrast-primary\nfg-body\nfg-1\nfg-2\nfg-3\nfg-4\nfg-bg\nfg-white\nfg-black\nfg-reset\nfg-10\nfg-50\nfg-100"
        }
      ]
    },
    {},
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/theme' with (\n  $theme-colors: (brand: (base: #253a76, fg: #253a76, bg: #dce6ff, contrast: #17213b))\n);\n@use 'tremplin/scss/tremplin-utilities';"
        }
      ]
    },
    {}
  ],
  "utilities/background": [
    {
      "code": [
        {
          "language": "css",
          "source": ".demo-contrast {\n  --trm-primary-bg: var(--trm-blue-700);\n  --trm-success-bg: var(--trm-green-700);\n  --trm-danger-bg: var(--trm-red-700);\n  --trm-primary-fg: var(--trm-primary-fg-emphasis);\n  --trm-success-fg: var(--trm-success-fg-emphasis);\n  --trm-danger-fg: var(--trm-danger-fg-emphasis);\n  --trm-info-fg: var(--trm-info-fg-emphasis);\n  --trm-warning-fg: var(--trm-warning-fg-emphasis);\n  --trm-link-color: var(--trm-primary-fg-emphasis);\n  --trm-link-hover-color: var(--trm-primary-fg-emphasis);\n}\n.demo-contrast [data-trm-theme][dir] {\n  color: var(--trm-fg-body);\n  background-color: var(--trm-bg-body);\n}\n/* Calendar Pro appends input popups to body, outside the wrapper. Its styles\n   option carries this explicit class to both popup and inline calendars. */\n.demo-calendar-contrast[data-vc=\"calendar\"] {\n  --trm-datepicker-day-selected-bg: var(--trm-blue-700);\n  --trm-datepicker-day-disabled-color: var(--trm-fg-2);\n}\n.demo-calendar-contrast [data-vc-date-month=\"prev\"] [data-vc-date-btn],\n.demo-calendar-contrast [data-vc-date-month=\"next\"] [data-vc-date-btn] {\n  opacity: .8;\n}"
        }
      ]
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"demo-contrast\">\n<div class=\"bg-body fg-body border rounded p-3\">A neutral surface with its body foreground.</div>\n</div>"
        }
      ],
      "example": "<div class=\"demo-contrast\">\n<div class=\"bg-body fg-body border rounded p-3\">A neutral surface with its body foreground.</div>\n</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "bg-primary\nbg-secondary\nbg-success\nbg-danger\nbg-warning\nbg-info\nbg-accent\nbg-inverse\nbg-subtle-primary\nbg-muted-primary\nbg-body\nbg-1\nbg-2\nbg-3\nbg-4\nbg-fg\nbg-white\nbg-black\nbg-transparent\nbg-10\nbg-50\nbg-100\nbg-gradient"
        }
      ]
    },
    {},
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/theme' with ($theme-bgs: (panel: #e6efff));\n@use 'tremplin/scss/tremplin-utilities';"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/config' with ($gradient: linear-gradient(135deg, #e6efff, #fff));\n@use 'tremplin/scss/mixins/gradients' as gradient;\n@use 'tremplin/scss/tremplin-utilities';\n.three-color-x { @include gradient.gradient-x-three-colors(red, gold, 40%, blue); }\n.three-color-y { @include gradient.gradient-y-three-colors(red, gold, 60%, blue); }"
        }
      ]
    },
    {}
  ],
  "utilities/color-scheme": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"color-scheme-auto bg-body fg-body border rounded p-3\">Native color-scheme selection.</div>"
        }
      ],
      "example": "<div class=\"color-scheme-auto bg-body fg-body border rounded p-3\">Native color-scheme selection.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "color-scheme-light\ncolor-scheme-dark\ncolor-scheme-auto"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/theme": [
    {
      "code": [
        {
          "language": "css",
          "source": ".demo-contrast {\n  --trm-primary-bg: var(--trm-blue-700);\n  --trm-success-bg: var(--trm-green-700);\n  --trm-danger-bg: var(--trm-red-700);\n  --trm-primary-fg: var(--trm-primary-fg-emphasis);\n  --trm-success-fg: var(--trm-success-fg-emphasis);\n  --trm-danger-fg: var(--trm-danger-fg-emphasis);\n  --trm-info-fg: var(--trm-info-fg-emphasis);\n  --trm-warning-fg: var(--trm-warning-fg-emphasis);\n  --trm-link-color: var(--trm-primary-fg-emphasis);\n  --trm-link-hover-color: var(--trm-primary-fg-emphasis);\n}\n.demo-contrast [data-trm-theme][dir] {\n  color: var(--trm-fg-body);\n  background-color: var(--trm-bg-body);\n}\n/* Calendar Pro appends input popups to body, outside the wrapper. Its styles\n   option carries this explicit class to both popup and inline calendars. */\n.demo-calendar-contrast[data-vc=\"calendar\"] {\n  --trm-datepicker-day-selected-bg: var(--trm-blue-700);\n  --trm-datepicker-day-disabled-color: var(--trm-fg-2);\n}\n.demo-calendar-contrast [data-vc-date-month=\"prev\"] [data-vc-date-btn],\n.demo-calendar-contrast [data-vc-date-month=\"next\"] [data-vc-date-btn] {\n  opacity: .8;\n}"
        }
      ]
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"demo-contrast\">\n<div class=\"theme-inverse theme-contrast theme-border rounded p-3\">A coordinated inverse surface.</div>\n</div>"
        }
      ],
      "example": "<div class=\"demo-contrast\">\n<div class=\"theme-inverse theme-contrast theme-border rounded p-3\">A coordinated inverse surface.</div>\n</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "theme-primary\ntheme-secondary\ntheme-success\ntheme-danger\ntheme-warning\ntheme-info\ntheme-accent\ntheme-inverse\ntheme-reset\ntheme-contrast\ntheme-subtle\ntheme-muted\ntheme-border"
        }
      ]
    },
    {},
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/theme' with (\n  $theme-colors: (brand: (base: #253a76, fg: #253a76, bg: #dce6ff, contrast: #17213b))\n);\n@use 'tremplin/scss/tremplin-utilities';"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: ('theme-subtle': null, 'theme-border': (enabled: false))\n);"
        }
      ]
    },
    {}
  ],
  "utilities/aspect-ratio": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"ratio-16x9 border rounded p-3\" style=\"width:100%\">A native 16:9 box.</div>"
        }
      ],
      "example": "<div class=\"ratio-16x9 border rounded p-3\" style=\"width:100%\">A native 16:9 box.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "ratio-auto\nratio-1x1\nratio-4x3\nratio-16x9\nratio-21x9"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/config' with ($aspect-ratios: (square: '1 / 1'));\n@use 'tremplin/scss/tremplin-utilities';"
        }
      ]
    },
    {}
  ],
  "utilities/container-queries": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"contains-inline border rounded p-3\">This box establishes inline-size containment.</div>"
        }
      ],
      "example": "<div class=\"contains-inline border rounded p-3\">This box establishes inline-size containment.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "contains-inline\ncontains-size"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "css",
          "source": ".project-frame { container-type: inline-size; }\n@container (width >= 30rem) {\n  .project-items { display: flex; }\n}"
        }
      ]
    },
    {}
  ],
  "utilities/display": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex flex-wrap gap-2\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
        }
      ],
      "example": "<div class=\"d-flex flex-wrap gap-2\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "d-none\nd-block\nd-inline-block\nd-flex\nd-inline-flex\nd-grid\nd-inline-grid\nd-table\nd-table-row\nd-table-cell\nd-contents\nd-flow-root\nmd:d-inline-grid"
        }
      ]
    },
    {},
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: ('display': (property: display, class: d, responsive: true, print: true, values: (block: block, none: none)))\n);"
        }
      ]
    },
    {}
  ],
  "utilities/float": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border rounded p-3\" style=\"display:flow-root\"><span class=\"float-start border p-2 me-2\">Media</span>Text wraps beside the floated region.</div>"
        }
      ],
      "example": "<div class=\"border rounded p-3\" style=\"display:flow-root\"><span class=\"float-start border p-2 me-2\">Media</span>Text wraps beside the floated region.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "float-start\nfloat-end\nfloat-none\nmd:float-end"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/object-fit": [
    {
      "code": [
        {
          "language": "html",
          "source": "<img class=\"object-fit-cover rounded\" src=\"/content-sample.svg\" width=\"240\" height=\"120\" style=\"width:15rem;height:7.5rem;max-width:100%\" alt=\"Abstract blue panels cropped into a wide box\">"
        }
      ],
      "example": "<img class=\"object-fit-cover rounded\" src=\"/content-sample.svg\" width=\"240\" height=\"120\" style=\"width:15rem;height:7.5rem;max-width:100%\" alt=\"Abstract blue panels cropped into a wide box\">"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "object-fit-cover\nobject-fit-contain\nobject-fit-fill\nobject-fit-scale\nobject-fit-none\nmd:object-fit-cover"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/overflow": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div tabindex=\"0\" role=\"region\" aria-label=\"Overflow example\" class=\"overflow-auto border rounded p-3\" style=\"max-height:5rem\">Scrollable content remains keyboard reachable.<br>Check long content at narrow sizes.<br>Keep focus indicators visible.</div>"
        }
      ],
      "example": "<div tabindex=\"0\" role=\"region\" aria-label=\"Overflow example\" class=\"overflow-auto border rounded p-3\" style=\"max-height:5rem\">Scrollable content remains keyboard reachable.<br>Check long content at narrow sizes.<br>Keep focus indicators visible.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "overflow-auto\noverflow-hidden\noverflow-visible\noverflow-scroll\noverflow-x-auto\noverflow-y-auto"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/position": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"position-relative border rounded\" style=\"height:5rem\"><span class=\"position-absolute top-0 start-0 p-2\">Positioned at the start.</span></div>"
        }
      ],
      "example": "<div class=\"position-relative border rounded\" style=\"height:5rem\"><span class=\"position-absolute top-0 start-0 p-2\">Positioned at the start.</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "position-static\nposition-relative\nposition-absolute\nposition-fixed\nposition-sticky\ntop-0\nbottom-0\nstart-0\nend-0\ntranslate-middle\ntranslate-middle-x\ntranslate-middle-y"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/visibility": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border rounded p-3\"><span class=\"invisible\">Reserved space</span><span>Visible sibling</span></div>"
        }
      ],
      "example": "<div class=\"border rounded p-3\"><span class=\"invisible\">Reserved space</span><span>Visible sibling</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "visible\ninvisible"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/z-index": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"position-relative z-3 border rounded p-3\">Layer 3 within this stacking context.</div>"
        }
      ],
      "example": "<div class=\"position-relative z-3 border rounded p-3\">Layer 3 within this stacking context.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "z-n1\nz-0\nz-1\nz-2\nz-3\nz-menu\nz-sticky\nz-fixed\nz-drawer\nz-dialog\nz-popover\nz-tooltip\nz-toast"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/config' with ($zindex-levels: (menu: 1000, dialog: 1200));\n@use 'tremplin/scss/tremplin-utilities';"
        }
      ]
    },
    {}
  ],
  "utilities/align-content": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex flex-wrap align-content-center gap-2 border p-2\" style=\"min-height:10rem;max-width:14rem\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
        }
      ],
      "example": "<div class=\"d-flex flex-wrap align-content-center gap-2 border p-2\" style=\"min-height:10rem;max-width:14rem\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "align-content-start\nalign-content-center\nalign-content-between\nmd:align-content-center"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/align-items": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex align-items-center gap-2 border p-2\" style=\"min-height:7rem\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
        }
      ],
      "example": "<div class=\"d-flex align-items-center gap-2 border p-2\" style=\"min-height:7rem\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "align-items-start\nalign-items-center\nalign-items-end\nmd:align-items-center"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/align-self": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex gap-2 border p-2\" style=\"min-height:7rem\"><span class=\"align-self-start border p-2\">Start</span><span class=\"align-self-end border p-2\">End</span></div>"
        }
      ],
      "example": "<div class=\"d-flex gap-2 border p-2\" style=\"min-height:7rem\"><span class=\"align-self-start border p-2\">Start</span><span class=\"align-self-end border p-2\">End</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "align-self-auto\nalign-self-start\nalign-self-center\nmd:align-self-end"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/flex": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex flex-column md:flex-row gap-2\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
        }
      ],
      "example": "<div class=\"d-flex flex-column md:flex-row gap-2\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "flex-row\nflex-column\nflex-wrap\nflex-fill\nflex-grow-1\nflex-shrink-0\nmd:flex-row"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/gap": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex flex-wrap row-gap-2 column-gap-3\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
        }
      ],
      "example": "<div class=\"d-flex flex-wrap row-gap-2 column-gap-3\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "gap-0\ngap-2\ngap-3\nmd:gap-4\nrow-gap-0\nrow-gap-2\nmd:row-gap-4\ncolumn-gap-0\ncolumn-gap-3\nmd:column-gap-4"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-grid grid-cols-2 row-gap-2 column-gap-4 md:row-gap-4\">\n  <div>First</div><div>Second</div><div>Third</div><div>Fourth</div>\n</div>"
        }
      ],
      "example": "<div class=\"d-grid grid-cols-2 row-gap-2 column-gap-4\"><div class=\"border rounded p-2\">First</div><div class=\"border rounded p-2\">Second</div><div class=\"border rounded p-2\">Third</div><div class=\"border rounded p-2\">Fourth</div></div>"
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss' with (\n  $spacers: (2: .75rem),\n  $utilities: (\n    'column-gap': (\n      property: column-gap, class: column-gap, responsive: true,\n      important: false, values: (tight: .25rem)\n    )\n  )\n);"
        }
      ]
    },
    {}
  ],
  "utilities/grid": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-grid grid-cols-2 md:grid-cols-3 gap-2\"><div class=\"border rounded p-2\">First</div><div class=\"border rounded p-2\">Second</div><div class=\"border rounded p-2\">Third</div><div class=\"grid-cols-fill border rounded p-2\">Full explicit row</div></div>"
        }
      ],
      "example": "<div class=\"d-grid grid-cols-2 md:grid-cols-3 gap-2\"><div class=\"border rounded p-2\">First</div><div class=\"border rounded p-2\">Second</div><div class=\"border rounded p-2\">Third</div><div class=\"grid-cols-fill border rounded p-2\">Full explicit row</div></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "d-grid\ngrid\ng-col-6\nmd:g-col-4\ngrid-cols-1\ngrid-cols-2\ngrid-cols-3\ngrid-cols-4\ngrid-cols-6\ngrid-cols-subgrid\ngrid-cols-fill\nmd:grid-cols-3\ngrid-auto-flow-row\ngrid-auto-flow-column\ngrid-auto-flow-dense\nmd:grid-auto-flow-column"
        }
      ]
    },
    {},
    {},
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-grid grid-cols-2 column-gap-3\">\n  <div class=\"d-grid grid-cols-fill grid-cols-subgrid\">\n    <div>Aligned first</div><div>Aligned second</div>\n  </div>\n</div>"
        }
      ],
      "example": "<div class=\"d-grid grid-cols-2 column-gap-3 row-gap-2\"><span class=\"border p-2\">Parent first</span><span class=\"border p-2\">Parent second</span><div class=\"d-grid grid-cols-fill grid-cols-subgrid\"><span class=\"border p-2\">Aligned first</span><span class=\"border p-2\">Aligned second</span></div></div>"
    },
    {},
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss' with (\n  $utilities: (\n    'grid-column-counts': (\n      property: grid-template-columns, class: grid-cols,\n      responsive: true, values: (5: repeat(5, 1fr))\n    )\n  )\n);"
        }
      ]
    },
    {}
  ],
  "utilities/justify-content": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex justify-content-between gap-2 border p-2\"><span>Start</span><span>End</span></div>"
        }
      ],
      "example": "<div class=\"d-flex justify-content-between gap-2 border p-2\"><span>Start</span><span>End</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "justify-content-start\njustify-content-center\njustify-content-between\nmd:justify-content-end"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/justify-items": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-grid grid-cols-2 justify-items-center gap-2 border p-2\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
        }
      ],
      "example": "<div class=\"d-grid grid-cols-2 justify-items-center gap-2 border p-2\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "justify-items-start\njustify-items-end\njustify-items-center\njustify-items-stretch\nmd:justify-items-center\njustify-self-start\njustify-self-center\nmd:justify-self-end"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/place-items": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-grid grid-cols-2 place-items-center gap-2 border p-2\" style=\"min-height:8rem\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
        }
      ],
      "example": "<div class=\"d-grid grid-cols-2 place-items-center gap-2 border p-2\" style=\"min-height:8rem\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "place-items-start\nplace-items-end\nplace-items-center\nplace-items-stretch\nmd:place-items-center"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/width": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border rounded p-2\"><div class=\"w-50 border rounded p-2\">Half the parent width.</div></div>"
        }
      ],
      "example": "<div class=\"border rounded p-2\"><div class=\"w-50 border rounded p-2\">Half the parent width.</div></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "w-1\nw-2\nw-25\nw-50\nw-75\nw-100\nw-auto\nw-min\nw-max\nw-fit\nmax-w-100\nmin-w-0\nmin-w-100\nvw-100\nmin-vw-100\ndvw-100\nmin-dvw-100"
        }
      ]
    },
    {},
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: (\n    'width': (property: width, class: w, values: (min: 10rem, 100: 100%)),\n    'height': (property: height, class: h, values: (min: 10rem, 100: 100%))\n  )\n);"
        }
      ]
    },
    {}
  ],
  "utilities/height": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border rounded\" style=\"height:8rem\"><div class=\"h-50 border p-2\">Half the definite parent height.</div></div>"
        }
      ],
      "example": "<div class=\"border rounded\" style=\"height:8rem\"><div class=\"h-50 border p-2\">Half the definite parent height.</div></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "h-25\nh-50\nh-75\nh-100\nh-auto\nh-min\nh-max\nh-fit\nmax-h-100\nmin-h-0\nmin-h-100\nvh-100\nmin-vh-100\ndvh-100\nmin-dvh-100"
        }
      ]
    },
    {},
    {},
    {}
  ],
  "utilities/margin": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border rounded p-3\"><div class=\"ms-3 border p-2\">Logical inline-start margin.</div></div>"
        }
      ],
      "example": "<div class=\"border rounded p-3\"><div class=\"ms-3 border p-2\">Logical inline-start margin.</div></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "m-0\nmt-3\nms-3\nme-3\nmx-auto\nms--1\nme--2\nmd:m-3\nmd:ms-auto"
        }
      ]
    },
    {},
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/config' with ($spacers: (3: 1rem), $negative-spacers: ('-2': -.75rem));\n@use 'tremplin/scss/tremplin-utilities';"
        }
      ]
    },
    {}
  ],
  "utilities/padding": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border rounded p-3\">Padding inside the box.</div>"
        }
      ],
      "example": "<div class=\"border rounded p-3\">Padding inside the box.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "p-0\np-3\npx-4\npy-2\nps-3\npe-3\nmd:p-4"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/space": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex space-x-3\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
        }
      ],
      "example": "<div class=\"d-flex space-x-3\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "space-x-0\nspace-x-3\nmd:space-x-2\nspace-y-0\nspace-y-3\nmd:space-y-2"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/font-family": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p class=\"font-monospace\">A monospace identifier.</p>"
        }
      ],
      "example": "<p class=\"font-monospace\">A monospace identifier.</p>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "font-body\nfont-monospace"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/font-size": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p class=\"text-lg\">A text-size preset with coordinated line height.</p>"
        }
      ],
      "example": "<p class=\"text-lg\">A text-size preset with coordinated line height.</p>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "fs-xs\nfs-sm\nfs-md\nfs-lg\nfs-xl\ntext-sm\ntext-md\ntext-lg"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/font-style": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p class=\"fst-italic\">An italic visual treatment.</p>"
        }
      ],
      "example": "<p class=\"fst-italic\">An italic visual treatment.</p>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "fst-italic\nfst-normal"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/font-weight": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p class=\"fw-semibold\">A semibold visual treatment.</p>"
        }
      ],
      "example": "<p class=\"fw-semibold\">A semibold visual treatment.</p>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "fw-light\nfw-normal\nfw-medium\nfw-semibold\nfw-bold"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/line-height": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p class=\"lh-lg\">Comfortable line spacing for this example.<br>Readability still depends on content and font metrics.</p>"
        }
      ],
      "example": "<p class=\"lh-lg\">Comfortable line spacing for this example.<br>Readability still depends on content and font metrics.</p>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "lh-1\nlh-sm\nlh-md\nlh-lg"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/link": [
    {
      "code": [
        {
          "language": "html",
          "source": "<a class=\"link-100\" style=\"--trm-link-color:var(--trm-primary-fg-emphasis)\" href=\"/utilities/api/\">Read the Utility API</a>"
        }
      ],
      "example": "<a class=\"link-100\" style=\"--trm-link-color:var(--trm-primary-fg-emphasis)\" href=\"/utilities/api/\">Read the Utility API</a>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "link-10\nlink-20\nlink-30\nlink-40\nlink-50\nlink-60\nlink-70\nlink-80\nlink-90\nlink-100\nhover:link-100"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/text-alignment": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p class=\"text-start md:text-end\">Logical text alignment.</p>"
        }
      ],
      "example": "<p class=\"text-start md:text-end\">Logical text alignment.</p>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "text-start\ntext-center\ntext-end\nmd:text-end"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/text-decoration": [
    {
      "code": [
        {
          "language": "html",
          "source": "<a class=\"fg-emphasis-primary text-decoration-underline underline-primary underline-offset-2 underline-thickness-2\" href=\"/utilities/api/\">A visibly underlined destination</a>"
        }
      ],
      "example": "<a class=\"fg-emphasis-primary text-decoration-underline underline-primary underline-offset-2 underline-thickness-2\" href=\"/utilities/api/\">A visibly underlined destination</a>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "text-decoration-none\ntext-decoration-underline\ntext-decoration-line-through\nunderline-offset-1\nunderline-offset-2\nunderline-offset-3\nunderline-primary\nunderline-secondary\nunderline-success\nunderline-danger\nunderline-warning\nunderline-info\nunderline-accent\nunderline-inverse\nunderline-10\nunderline-50\nunderline-100\nunderline-thickness-1\nunderline-thickness-2\nunderline-thickness-3\nunderline-thickness-4\nunderline-thickness-5\nhover:underline-offset-3\nhover:underline-100\nhover:underline-thickness-3"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with (\n  $utilities: ('underline-thickness': (property: text-decoration-thickness, class: underline-thickness, state: hover focus-visible, values: (4: 4px)))\n);"
        }
      ]
    },
    {}
  ],
  "utilities/text-transform": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p class=\"text-uppercase\">A visual case transformation.</p>"
        }
      ],
      "example": "<p class=\"text-uppercase\">A visual case transformation.</p>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "text-lowercase\ntext-uppercase\ntext-capitalize"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/text-wrapping": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p class=\"text-break\" style=\"max-width:100%\">AnUnbrokenIdentifierThatCanWrapInsteadOfClippingAtNarrowWidths</p>"
        }
      ],
      "example": "<p class=\"text-break\" style=\"max-width:100%\">AnUnbrokenIdentifierThatCanWrapInsteadOfClippingAtNarrowWidths</p>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "text-wrap\ntext-nowrap\ntext-balance\ntext-pretty\ntext-break\ntext-truncate"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/vertical-align": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p>Inline text <span class=\"align-middle\" style=\"font-size:1.5rem\">aligned in the middle</span>.</p>"
        }
      ],
      "example": "<p>Inline text <span class=\"align-middle\" style=\"font-size:1.5rem\">aligned in the middle</span>.</p>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "align-baseline\nalign-top\nalign-middle\nalign-bottom\nalign-text-top\nalign-text-bottom"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/border": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border border-2 rounded p-3\">A two-pixel border.</div>"
        }
      ],
      "example": "<div class=\"border border-2 rounded p-3\">A two-pixel border.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "border\nborder-0\nborder-top\nborder-top-0\nborder-bottom\nborder-bottom-0\nborder-start\nborder-start-0\nborder-end\nborder-end-0\nborder-x\nborder-x-0\nborder-y\nborder-y-0\nborder-keyline\nborder-1\nborder-2\nborder-3\nborder-4\nborder-5"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/config' with ($border-width: 2px, $border-style: dashed, $border-widths: (3: 6px));\n@use 'tremplin/scss/tremplin-utilities';"
        }
      ]
    },
    {}
  ],
  "utilities/border-color": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border border-primary rounded p-3\">Boundary color independent of text color.</div>"
        }
      ],
      "example": "<div class=\"border border-primary rounded p-3\">Boundary color independent of text color.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "border-primary\nborder-secondary\nborder-success\nborder-danger\nborder-warning\nborder-info\nborder-accent\nborder-inverse\nborder-subtle-primary\nborder-body\nborder-muted\nborder-subtle\nborder-emphasized\nborder-white\nborder-black\nborder-bg\nborder-10\nborder-50\nborder-100"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/theme' with ($theme-borders: (panel: #253a76));\n@use 'tremplin/scss/tremplin-utilities';"
        }
      ]
    },
    {}
  ],
  "utilities/border-radius": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border rounded-5 p-3\">Numeric radius scale.</div>"
        }
      ],
      "example": "<div class=\"border rounded-5 p-3\">Numeric radius scale.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "rounded\nrounded-0\nrounded-1\nrounded-2\nrounded-3\nrounded-4\nrounded-5\nrounded-6\nrounded-7\nrounded-8\nrounded-9\nrounded-circle\nrounded-pill\nrounded-size-9\nrounded-top\nrounded-top-0\nrounded-end\nrounded-bottom\nrounded-start"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/config' with ($radii: (9: 2rem));\n@use 'tremplin/scss/tremplin-utilities';"
        }
      ]
    },
    {}
  ],
  "utilities/divide": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex divide-x\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
        }
      ],
      "example": "<div class=\"d-flex divide-x\"><span class=\"border rounded p-2\">First</span><span class=\"border rounded p-2\">Second</span><span class=\"border rounded p-2\">Third</span></div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "divide-x\ndivide-x-0\nmd:divide-x\ndivide-y\ndivide-y-0\nmd:divide-y-0"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/pointer-events": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border rounded p-3\">Pointer hit-testing is separate from keyboard and semantics.</div>"
        }
      ],
      "example": "<div class=\"border rounded p-3\">Pointer hit-testing is separate from keyboard and semantics.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "pe-none\npe-auto"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/user-select": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p class=\"user-select-text\">A selectable identifier: project-2026</p>"
        }
      ],
      "example": "<p class=\"user-select-text\">A selectable identifier: project-2026</p>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "user-select-all\nuser-select-auto\nuser-select-text\nuser-select-none"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/motion": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"animation-none border rounded p-3\">Static preview; motion is not required.</div>"
        }
      ],
      "example": "<div class=\"animation-none border rounded p-3\">Static preview; motion is not required.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "transition-none\nanimation-none\nanimation-shake\nanimation-pop"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/tremplin-utilities' with ($utilities: ('animation': null));"
        }
      ]
    },
    {}
  ],
  "utilities/opacity": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"opacity-100 border rounded p-3\">A fully opaque readable preview.</div>"
        }
      ],
      "example": "<div class=\"opacity-100 border rounded p-3\">A fully opaque readable preview.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "opacity-0\nopacity-25\nopacity-50\nopacity-75\nopacity-100"
        }
      ]
    },
    {},
    {}
  ],
  "utilities/shadows": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"shadow-sm border rounded p-3\">A composable decorative shadow.</div>"
        }
      ],
      "example": "<div class=\"shadow-sm border rounded p-3\">A composable decorative shadow.</div>"
    },
    {
      "code": [
        {
          "language": "text",
          "source": "shadow\nshadow-xs\nshadow-sm\nshadow-lg\nshadow-xl\nshadow-none\nshadow-primary\nshadow-secondary\nshadow-success\nshadow-danger\nshadow-warning\nshadow-info\nshadow-accent\nshadow-inverse\nshadow-current\nshadow-black\nshadow-white\nshadow-opacity-10\nshadow-opacity-50\nshadow-opacity-100"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/config' with (\n  $shadows: (null: 0 .25rem .75rem rgb(0 0 0 / .18), sm: 0 .125rem .25rem rgb(0 0 0 / .12))\n);\n@use 'tremplin/scss/tremplin-utilities';"
        }
      ]
    },
    {}
  ]
}

export const utilitiesRuntimeScripts: Record<string, string> = {
  "utilities/background": "\nconst demoStyle = document.createElement('style'); demoStyle.textContent = \".demo-contrast {\\n  --trm-primary-bg: var(--trm-blue-700);\\n  --trm-success-bg: var(--trm-green-700);\\n  --trm-danger-bg: var(--trm-red-700);\\n  --trm-primary-fg: var(--trm-primary-fg-emphasis);\\n  --trm-success-fg: var(--trm-success-fg-emphasis);\\n  --trm-danger-fg: var(--trm-danger-fg-emphasis);\\n  --trm-info-fg: var(--trm-info-fg-emphasis);\\n  --trm-warning-fg: var(--trm-warning-fg-emphasis);\\n  --trm-link-color: var(--trm-primary-fg-emphasis);\\n  --trm-link-hover-color: var(--trm-primary-fg-emphasis);\\n}\\n.demo-contrast [data-trm-theme][dir] {\\n  color: var(--trm-fg-body);\\n  background-color: var(--trm-bg-body);\\n}\\n/* Calendar Pro appends input popups to body, outside the wrapper. Its styles\\n   option carries this explicit class to both popup and inline calendars. */\\n.demo-calendar-contrast[data-vc=\\\"calendar\\\"] {\\n  --trm-datepicker-day-selected-bg: var(--trm-blue-700);\\n  --trm-datepicker-day-disabled-color: var(--trm-fg-2);\\n}\\n.demo-calendar-contrast [data-vc-date-month=\\\"prev\\\"] [data-vc-date-btn],\\n.demo-calendar-contrast [data-vc-date-month=\\\"next\\\"] [data-vc-date-btn] {\\n  opacity: .8;\\n}\"; document.head.append(demoStyle);",
  "utilities/theme": "\nconst demoStyle = document.createElement('style'); demoStyle.textContent = \".demo-contrast {\\n  --trm-primary-bg: var(--trm-blue-700);\\n  --trm-success-bg: var(--trm-green-700);\\n  --trm-danger-bg: var(--trm-red-700);\\n  --trm-primary-fg: var(--trm-primary-fg-emphasis);\\n  --trm-success-fg: var(--trm-success-fg-emphasis);\\n  --trm-danger-fg: var(--trm-danger-fg-emphasis);\\n  --trm-info-fg: var(--trm-info-fg-emphasis);\\n  --trm-warning-fg: var(--trm-warning-fg-emphasis);\\n  --trm-link-color: var(--trm-primary-fg-emphasis);\\n  --trm-link-hover-color: var(--trm-primary-fg-emphasis);\\n}\\n.demo-contrast [data-trm-theme][dir] {\\n  color: var(--trm-fg-body);\\n  background-color: var(--trm-bg-body);\\n}\\n/* Calendar Pro appends input popups to body, outside the wrapper. Its styles\\n   option carries this explicit class to both popup and inline calendars. */\\n.demo-calendar-contrast[data-vc=\\\"calendar\\\"] {\\n  --trm-datepicker-day-selected-bg: var(--trm-blue-700);\\n  --trm-datepicker-day-disabled-color: var(--trm-fg-2);\\n}\\n.demo-calendar-contrast [data-vc-date-month=\\\"prev\\\"] [data-vc-date-btn],\\n.demo-calendar-contrast [data-vc-date-month=\\\"next\\\"] [data-vc-date-btn] {\\n  opacity: .8;\\n}\"; document.head.append(demoStyle);"
}
