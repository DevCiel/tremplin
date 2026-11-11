import type { CodeSample } from './guide-docs'

// Executable samples only. Prose and metadata are authored in content/docs/helpers/.
export const helpersRawExamples: Record<string, { code?: CodeSample[]; example?: string }[]> = {
  "helpers/focus-ring": [
    {
      "code": [
        {
          "language": "html",
          "source": "<a class=\"focus-ring d-inline-block border rounded p-3\" id=\"helper-focus-link\" href=\"/components/button/\" style=\"--trm-focus-ring-color:#075985\">Review button styles</a>"
        }
      ],
      "example": "<a class=\"focus-ring d-inline-block border rounded p-3\" id=\"helper-focus-link\" href=\"/components/button/\" style=\"--trm-focus-ring-color:#075985\">Review button styles</a>"
    },
    {
      "code": [
        {
          "language": "css",
          "source": ".project-action.focus-ring {\n  --trm-focus-ring-width: 4px;\n  --trm-focus-ring-color: #075985;\n  --trm-focus-ring-offset: 3px;\n  outline-offset: var(--trm-focus-ring-offset);\n}"
        }
      ],
      "example": "<a class=\"focus-ring theme-success d-inline-block border rounded p-3\" href=\"/getting-started/accessibility/\">Contextual focus ring</a>"
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/root' with (\n  $root-tokens: (\n    '--trm-focus-ring-width': 4px,\n    '--trm-focus-ring-offset': 3px\n  )\n);\n@use 'tremplin/scss';"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/mixins/focus-ring' as focus;\n.project-action:focus-visible {\n  @include focus.focus-ring(true, #075985);\n}"
        }
      ]
    },
    {}
  ],
  "helpers/hover-lift": [
    {},
    {
      "code": [
        {
          "language": "html",
          "source": "<a class=\"hover-lift focus-ring d-block border rounded p-3\" id=\"helper-lift-link\" href=\"/components/card/\">Read the Card guide</a>"
        }
      ],
      "example": "<a class=\"hover-lift focus-ring d-block border rounded p-3\" id=\"helper-lift-link\" href=\"/components/card/\">Read the Card guide</a>"
    },
    {
      "code": [
        {
          "language": "css",
          "source": ".project-lift.hover-lift {\n  --trm-hover-lift-transition-duration: 120ms;\n  --trm-hover-lift-transition-timing: ease-out;\n  --trm-hover-lift-transform: translateY(-.5rem);\n  --trm-hover-lift-box-shadow: 0 .25rem .75rem rgb(20 24 38 / .16);\n}"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/helpers/hover-lift' with (\n  $hover-lift-tokens: (\n    '--trm-hover-lift-transform': translateY(-.5rem),\n    '--trm-hover-lift-transition-duration': .12s\n  )\n);\n@use 'tremplin/scss';"
        }
      ]
    },
    {
      "code": [
        {
          "language": "css",
          "source": "@media (prefers-reduced-motion: reduce) {\n  .hover-lift { --trm-hover-lift-transform: none; }\n}"
        }
      ]
    }
  ],
  "helpers/icon-link": [
    {
      "code": [
        {
          "language": "html",
          "source": "<a class=\"icon-link\" href=\"/getting-started/install/\"><svg class=\"bi\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m5 12 4 4L19 6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"></path></svg><span>Install Tremplin</span></a>"
        }
      ],
      "example": "<a class=\"icon-link\" href=\"/getting-started/install/\"><svg class=\"bi\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m5 12 4 4L19 6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"></path></svg><span>Install Tremplin</span></a>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<a class=\"icon-link icon-link-hover focus-ring\" id=\"helper-icon-motion\" href=\"/getting-started/install/\"><svg class=\"bi\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m5 12 4 4L19 6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"></path></svg><span>Explore installation</span></a>"
        }
      ],
      "example": "<a class=\"icon-link icon-link-hover focus-ring\" id=\"helper-icon-motion\" href=\"/getting-started/install/\"><svg class=\"bi\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m5 12 4 4L19 6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"></path></svg><span>Explore installation</span></a>"
    },
    {
      "code": [
        {
          "language": "css",
          "source": ".project-icon-link.icon-link {\n  --trm-icon-link-gap: .5rem;\n  --trm-icon-link-icon-size: 1.1em;\n  --trm-icon-link-icon-transition: transform 120ms ease;\n  --trm-icon-link-transform: translate3d(-.15em, 0, 0);\n}"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/helpers/icon-link' with (\n  $icon-link-tokens: (\n    '--trm-icon-link-gap': .5rem,\n    '--trm-icon-link-icon-size': 1.1em\n  )\n);\n@use 'tremplin/scss';"
        }
      ]
    }
  ],
  "helpers/position": [
    {
      "code": [
        {
          "language": "html",
          "source": "<!-- Reserve layout space when using fixed bars. -->\n<header class=\"fixed-top\">Persistent header</header>\n<footer class=\"fixed-bottom\">Persistent actions</footer>"
        }
      ]
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border rounded p-3\" style=\"max-block-size:10rem;overflow:auto\" tabindex=\"0\" role=\"region\" aria-label=\"Sticky position example\"><div class=\"sticky-top p-2\" style=\"background:var(--trm-bg-body)\">Sticky heading</div><p class=\"mt-3\">Scroll within this region. The heading stays inside its containing scroll area.</p><p>Sticky placement remains in normal flow.</p><p>Check ancestor overflow and available scrolling space.</p></div>"
        }
      ],
      "example": "<div class=\"border rounded p-3\" style=\"max-block-size:10rem;overflow:auto\" tabindex=\"0\" role=\"region\" aria-label=\"Sticky position example\"><div class=\"sticky-top p-2\" style=\"background:var(--trm-bg-body)\">Sticky heading</div><p class=\"mt-3\">Scroll within this region. The heading stays inside its containing scroll area.</p><p>Sticky placement remains in normal flow.</p><p>Check ancestor overflow and available scrolling space.</p></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"sticky-bottom\">Always sticky at the physical bottom edge</div>\n<div class=\"md:sticky-top\">Sticky from the md viewport breakpoint</div>\n<div class=\"lg:sticky-bottom\">Sticky from lg</div>"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/config' with (\n  $breakpoints: (base: 0, compact: 30rem, wide: 60rem)\n);\n@use 'tremplin/scss/helpers/position';"
        }
      ]
    }
  ],
  "helpers/stacks": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"vstack gap-3\" data-helper-demo=\"stack\"><div class=\"border rounded p-2\">First item</div><div class=\"border rounded p-2\">Second item</div><div class=\"border rounded p-2\">Third item</div></div>"
        }
      ],
      "example": "<div class=\"vstack gap-3\" data-helper-demo=\"stack\"><div class=\"border rounded p-2\">First item</div><div class=\"border rounded p-2\">Second item</div><div class=\"border rounded p-2\">Third item</div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"hstack flex-wrap gap-3\" data-helper-demo=\"cluster\"><button class=\"btn-solid theme-inverse\" type=\"button\">Save</button><button class=\"btn-outline theme-inverse\" type=\"button\">Preview</button><span>Actions wrap when necessary.</span></div>"
        }
      ],
      "example": "<div class=\"hstack flex-wrap gap-3\" data-helper-demo=\"cluster\"><button class=\"btn-solid theme-inverse\" type=\"button\">Save</button><button class=\"btn-outline theme-inverse\" type=\"button\">Preview</button><span>Actions wrap when necessary.</span></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"stack-container border rounded p-3\"><div class=\"vstack sm:hstack gap-2\" id=\"helper-responsive-stack\"><span class=\"border rounded p-2\">First region</span><span class=\"border rounded p-2\">Second region</span></div></div>"
        }
      ],
      "example": "<div class=\"stack-container border rounded p-3\"><div class=\"vstack sm:hstack gap-2\" id=\"helper-responsive-stack\"><span class=\"border rounded p-2\">First region</span><span class=\"border rounded p-2\">Second region</span></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex flex-column md:flex-row gap-3\">\n  <div>First region</div>\n  <div>Second region</div>\n</div>"
        }
      ]
    },
    {
      "code": [
        {
          "language": "css",
          "source": ".project-stack {\n  --trm-stack-flex: 0 0 auto;\n  --trm-stack-align-self: center;\n}"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/layout/breakpoints' as bp;\n.project-frame { @include bp.set-container(inline-size, project-frame); }\n.project-items { display: flex; flex-direction: column; }\n@include bp.container-breakpoint-up(sm, project-frame) {\n  .project-items { flex-direction: row; }\n}"
        }
      ]
    }
  ],
  "helpers/stretched-link": [
    {
      "code": [
        {
          "language": "html",
          "source": "<article class=\"card position-relative\" id=\"helper-stretched-card\"><div class=\"card-body\"><h3>Layout reference</h3><p>One link supplies the destination for this whole card.</p><a class=\"stretched-link\" id=\"helper-stretched-link\" href=\"/layout/grid/\">Read the Grid guide</a></div></article>"
        }
      ],
      "example": "<article class=\"card position-relative\" id=\"helper-stretched-card\"><div class=\"card-body\"><h3>Layout reference</h3><p>One link supplies the destination for this whole card.</p><a class=\"stretched-link\" id=\"helper-stretched-link\" href=\"/layout/grid/\">Read the Grid guide</a></div></article>"
    },
    {},
    {
      "code": [
        {
          "language": "css",
          "source": ".project-link.stretched-link { --trm-stretched-link-z-index: 2; }"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/helpers/stretched-link' with (\n  $stretched-link-pseudo-element: before,\n  $stretched-link-tokens: ('--trm-stretched-link-z-index': 2)\n);\n@use 'tremplin/scss';"
        }
      ]
    }
  ],
  "helpers/text-truncation": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p class=\"text-truncate border rounded p-3\" id=\"helper-truncated\" style=\"max-inline-size:18rem\">This is a long description inside a constrained text container, with the complete text still present.</p>"
        }
      ],
      "example": "<p class=\"text-truncate border rounded p-3\" id=\"helper-truncated\" style=\"max-inline-size:18rem\">This is a long description inside a constrained text container, with the complete text still present.</p>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex\" style=\"max-inline-size:20rem\">\n  <span class=\"text-truncate\" style=\"min-inline-size:0\">A long label that may be shortened visually</span>\n</div>"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/mixins/text-truncate' as text;\n.project-label {\n  max-inline-size: 16rem;\n  @include text.text-truncate();\n}"
        }
      ]
    }
  ],
  "helpers/vertical-rule": [
    {},
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"hstack gap-3 border rounded p-3\"><span>Draft</span><span class=\"vr\" aria-hidden=\"true\"></span><span>Ready for review</span></div>"
        }
      ],
      "example": "<div class=\"hstack gap-3 border rounded p-3\"><span>Draft</span><span class=\"vr\" aria-hidden=\"true\"></span><span>Ready for review</span></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"hstack gap-3\"><div>Account<br>Profile</div><div class=\"vr\" aria-hidden=\"true\"></div><div>Security<br>Preferences</div></div>"
        }
      ],
      "example": "<div class=\"hstack gap-3\"><div>Account<br>Profile</div><div class=\"vr\" aria-hidden=\"true\"></div><div>Security<br>Preferences</div></div>"
    },
    {
      "code": [
        {
          "language": "css",
          "source": ".project-rule.vr {\n  --trm-vr-border-width: 2px;\n  --trm-border-color: var(--trm-fg-body);\n  min-height: 2rem;\n}"
        }
      ]
    }
  ],
  "helpers/visually-hidden": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p>Release state: <span aria-hidden=\"true\">&#10003;</span><span class=\"visually-hidden\">Ready for review</span></p>"
        }
      ],
      "example": "<p>Release state: <span aria-hidden=\"true\">&#10003;</span><span class=\"visually-hidden\">Ready for review</span></p>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<a class=\"visually-hidden-focusable d-inline-block p-2\" id=\"helper-skip-example\" href=\"#helper-skip-target\">Skip to this example content</a><div id=\"helper-skip-target\" tabindex=\"-1\" class=\"border rounded p-3\">Example destination: the skip link becomes visible while it has focus.</div>"
        }
      ],
      "example": "<a class=\"visually-hidden-focusable d-inline-block p-2\" id=\"helper-skip-example\" href=\"#helper-skip-target\">Skip to this example content</a><div id=\"helper-skip-target\" tabindex=\"-1\" class=\"border rounded p-3\">Example destination: the skip link becomes visible while it has focus.</div>"
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/mixins/visually-hidden' as hidden;\n.project-sr-text { @include hidden.visually-hidden(); }\n.project-skip-link { @include hidden.visually-hidden-focusable(); }"
        }
      ]
    },
    {}
  ]
}

export const helpersExamples: Record<string, { code?: CodeSample[]; example?: string }[]> = {
  "helpers/focus-ring": [
    {
      "code": [
        {
          "language": "html",
          "source": "<a class=\"focus-ring d-inline-block border rounded p-3\" id=\"helper-focus-link\" href=\"/components/button/\" style=\"--trm-focus-ring-color:#075985\">Review button styles</a>"
        }
      ],
      "example": "<a class=\"focus-ring d-inline-block border rounded p-3\" id=\"helper-focus-link\" href=\"/components/button/\" style=\"--trm-focus-ring-color:#075985\">Review button styles</a>"
    },
    {
      "code": [
        {
          "language": "css",
          "source": ".project-action.focus-ring {\n  --trm-focus-ring-width: 4px;\n  --trm-focus-ring-color: #075985;\n  --trm-focus-ring-offset: 3px;\n  outline-offset: var(--trm-focus-ring-offset);\n}"
        }
      ],
      "example": "<a class=\"focus-ring theme-success d-inline-block border rounded p-3\" href=\"/getting-started/accessibility/\">Contextual focus ring</a>"
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/root' with (\n  $root-tokens: (\n    '--trm-focus-ring-width': 4px,\n    '--trm-focus-ring-offset': 3px\n  )\n);\n@use 'tremplin/scss';"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/mixins/focus-ring' as focus;\n.project-action:focus-visible {\n  @include focus.focus-ring(true, #075985);\n}"
        }
      ]
    },
    {}
  ],
  "helpers/hover-lift": [
    {},
    {
      "code": [
        {
          "language": "html",
          "source": "<a class=\"hover-lift focus-ring d-block border rounded p-3\" id=\"helper-lift-link\" href=\"/components/card/\">Read the Card guide</a>"
        }
      ],
      "example": "<a class=\"hover-lift focus-ring d-block border rounded p-3\" id=\"helper-lift-link\" href=\"/components/card/\">Read the Card guide</a>"
    },
    {
      "code": [
        {
          "language": "css",
          "source": ".project-lift.hover-lift {\n  --trm-hover-lift-transition-duration: 120ms;\n  --trm-hover-lift-transition-timing: ease-out;\n  --trm-hover-lift-transform: translateY(-.5rem);\n  --trm-hover-lift-box-shadow: 0 .25rem .75rem rgb(20 24 38 / .16);\n}"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/helpers/hover-lift' with (\n  $hover-lift-tokens: (\n    '--trm-hover-lift-transform': translateY(-.5rem),\n    '--trm-hover-lift-transition-duration': .12s\n  )\n);\n@use 'tremplin/scss';"
        }
      ]
    },
    {
      "code": [
        {
          "language": "css",
          "source": "@media (prefers-reduced-motion: reduce) {\n  .hover-lift { --trm-hover-lift-transform: none; }\n}"
        }
      ]
    }
  ],
  "helpers/icon-link": [
    {
      "code": [
        {
          "language": "html",
          "source": "<a class=\"icon-link\" href=\"/getting-started/install/\"><svg class=\"bi\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m5 12 4 4L19 6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"></path></svg><span>Install Tremplin</span></a>"
        }
      ],
      "example": "<a class=\"icon-link\" href=\"/getting-started/install/\"><svg class=\"bi\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m5 12 4 4L19 6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"></path></svg><span>Install Tremplin</span></a>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<a class=\"icon-link icon-link-hover focus-ring\" id=\"helper-icon-motion\" href=\"/getting-started/install/\"><svg class=\"bi\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m5 12 4 4L19 6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"></path></svg><span>Explore installation</span></a>"
        }
      ],
      "example": "<a class=\"icon-link icon-link-hover focus-ring\" id=\"helper-icon-motion\" href=\"/getting-started/install/\"><svg class=\"bi\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m5 12 4 4L19 6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"></path></svg><span>Explore installation</span></a>"
    },
    {
      "code": [
        {
          "language": "css",
          "source": ".project-icon-link.icon-link {\n  --trm-icon-link-gap: .5rem;\n  --trm-icon-link-icon-size: 1.1em;\n  --trm-icon-link-icon-transition: transform 120ms ease;\n  --trm-icon-link-transform: translate3d(-.15em, 0, 0);\n}"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/helpers/icon-link' with (\n  $icon-link-tokens: (\n    '--trm-icon-link-gap': .5rem,\n    '--trm-icon-link-icon-size': 1.1em\n  )\n);\n@use 'tremplin/scss';"
        }
      ]
    }
  ],
  "helpers/position": [
    {
      "code": [
        {
          "language": "html",
          "source": "<!-- Reserve layout space when using fixed bars. -->\n<header class=\"fixed-top\">Persistent header</header>\n<footer class=\"fixed-bottom\">Persistent actions</footer>"
        }
      ]
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"border rounded p-3\" style=\"max-block-size:10rem;overflow:auto\" tabindex=\"0\" role=\"region\" aria-label=\"Sticky position example\"><div class=\"sticky-top p-2\" style=\"background:var(--trm-bg-body)\">Sticky heading</div><p class=\"mt-3\">Scroll within this region. The heading stays inside its containing scroll area.</p><p>Sticky placement remains in normal flow.</p><p>Check ancestor overflow and available scrolling space.</p></div>"
        }
      ],
      "example": "<div class=\"border rounded p-3\" style=\"max-block-size:10rem;overflow:auto\" tabindex=\"0\" role=\"region\" aria-label=\"Sticky position example\"><div class=\"sticky-top p-2\" style=\"background:var(--trm-bg-body)\">Sticky heading</div><p class=\"mt-3\">Scroll within this region. The heading stays inside its containing scroll area.</p><p>Sticky placement remains in normal flow.</p><p>Check ancestor overflow and available scrolling space.</p></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"sticky-bottom\">Always sticky at the physical bottom edge</div>\n<div class=\"md:sticky-top\">Sticky from the md viewport breakpoint</div>\n<div class=\"lg:sticky-bottom\">Sticky from lg</div>"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/config' with (\n  $breakpoints: (base: 0, compact: 30rem, wide: 60rem)\n);\n@use 'tremplin/scss/helpers/position';"
        }
      ]
    }
  ],
  "helpers/stacks": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"vstack gap-3\" data-helper-demo=\"stack\"><div class=\"border rounded p-2\">First item</div><div class=\"border rounded p-2\">Second item</div><div class=\"border rounded p-2\">Third item</div></div>"
        }
      ],
      "example": "<div class=\"vstack gap-3\" data-helper-demo=\"stack\"><div class=\"border rounded p-2\">First item</div><div class=\"border rounded p-2\">Second item</div><div class=\"border rounded p-2\">Third item</div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"hstack flex-wrap gap-3\" data-helper-demo=\"cluster\"><button class=\"btn-solid theme-inverse\" type=\"button\">Save</button><button class=\"btn-outline theme-inverse\" type=\"button\">Preview</button><span>Actions wrap when necessary.</span></div>"
        }
      ],
      "example": "<div class=\"hstack flex-wrap gap-3\" data-helper-demo=\"cluster\"><button class=\"btn-solid theme-inverse\" type=\"button\">Save</button><button class=\"btn-outline theme-inverse\" type=\"button\">Preview</button><span>Actions wrap when necessary.</span></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"stack-container border rounded p-3\"><div class=\"vstack sm:hstack gap-2\" id=\"helper-responsive-stack\"><span class=\"border rounded p-2\">First region</span><span class=\"border rounded p-2\">Second region</span></div></div>"
        }
      ],
      "example": "<div class=\"stack-container border rounded p-3\"><div class=\"vstack sm:hstack gap-2\" id=\"helper-responsive-stack\"><span class=\"border rounded p-2\">First region</span><span class=\"border rounded p-2\">Second region</span></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex flex-column md:flex-row gap-3\">\n  <div>First region</div>\n  <div>Second region</div>\n</div>"
        }
      ]
    },
    {
      "code": [
        {
          "language": "css",
          "source": ".project-stack {\n  --trm-stack-flex: 0 0 auto;\n  --trm-stack-align-self: center;\n}"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/layout/breakpoints' as bp;\n.project-frame { @include bp.set-container(inline-size, project-frame); }\n.project-items { display: flex; flex-direction: column; }\n@include bp.container-breakpoint-up(sm, project-frame) {\n  .project-items { flex-direction: row; }\n}"
        }
      ]
    }
  ],
  "helpers/stretched-link": [
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
          "source": "<div class=\"demo-contrast\">\n<article class=\"card position-relative\" id=\"helper-stretched-card\"><div class=\"card-body\"><h3>Layout reference</h3><p>One link supplies the destination for this whole card.</p><a class=\"stretched-link\" id=\"helper-stretched-link\" href=\"/layout/grid/\">Read the Grid guide</a></div></article>\n</div>"
        }
      ],
      "example": "<div class=\"demo-contrast\">\n<article class=\"card position-relative\" id=\"helper-stretched-card\"><div class=\"card-body\"><h3>Layout reference</h3><p>One link supplies the destination for this whole card.</p><a class=\"stretched-link\" id=\"helper-stretched-link\" href=\"/layout/grid/\">Read the Grid guide</a></div></article>\n</div>"
    },
    {},
    {
      "code": [
        {
          "language": "css",
          "source": ".project-link.stretched-link { --trm-stretched-link-z-index: 2; }"
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/helpers/stretched-link' with (\n  $stretched-link-pseudo-element: before,\n  $stretched-link-tokens: ('--trm-stretched-link-z-index': 2)\n);\n@use 'tremplin/scss';"
        }
      ]
    }
  ],
  "helpers/text-truncation": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p class=\"text-truncate border rounded p-3\" id=\"helper-truncated\" style=\"max-inline-size:18rem\">This is a long description inside a constrained text container, with the complete text still present.</p>"
        }
      ],
      "example": "<p class=\"text-truncate border rounded p-3\" id=\"helper-truncated\" style=\"max-inline-size:18rem\">This is a long description inside a constrained text container, with the complete text still present.</p>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"d-flex\" style=\"max-inline-size:20rem\">\n  <span class=\"text-truncate\" style=\"min-inline-size:0\">A long label that may be shortened visually</span>\n</div>"
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/mixins/text-truncate' as text;\n.project-label {\n  max-inline-size: 16rem;\n  @include text.text-truncate();\n}"
        }
      ]
    }
  ],
  "helpers/vertical-rule": [
    {},
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"hstack gap-3 border rounded p-3\"><span>Draft</span><span class=\"vr\" aria-hidden=\"true\"></span><span>Ready for review</span></div>"
        }
      ],
      "example": "<div class=\"hstack gap-3 border rounded p-3\"><span>Draft</span><span class=\"vr\" aria-hidden=\"true\"></span><span>Ready for review</span></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"hstack gap-3\"><div>Account<br>Profile</div><div class=\"vr\" aria-hidden=\"true\"></div><div>Security<br>Preferences</div></div>"
        }
      ],
      "example": "<div class=\"hstack gap-3\"><div>Account<br>Profile</div><div class=\"vr\" aria-hidden=\"true\"></div><div>Security<br>Preferences</div></div>"
    },
    {
      "code": [
        {
          "language": "css",
          "source": ".project-rule.vr {\n  --trm-vr-border-width: 2px;\n  --trm-border-color: var(--trm-fg-body);\n  min-height: 2rem;\n}"
        }
      ]
    }
  ],
  "helpers/visually-hidden": [
    {
      "code": [
        {
          "language": "html",
          "source": "<p>Release state: <span aria-hidden=\"true\">&#10003;</span><span class=\"visually-hidden\">Ready for review</span></p>"
        }
      ],
      "example": "<p>Release state: <span aria-hidden=\"true\">&#10003;</span><span class=\"visually-hidden\">Ready for review</span></p>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<a class=\"visually-hidden-focusable d-inline-block p-2\" id=\"helper-skip-example\" href=\"#helper-skip-target\">Skip to this example content</a><div id=\"helper-skip-target\" tabindex=\"-1\" class=\"border rounded p-3\">Example destination: the skip link becomes visible while it has focus.</div>"
        }
      ],
      "example": "<a class=\"visually-hidden-focusable d-inline-block p-2\" id=\"helper-skip-example\" href=\"#helper-skip-target\">Skip to this example content</a><div id=\"helper-skip-target\" tabindex=\"-1\" class=\"border rounded p-3\">Example destination: the skip link becomes visible while it has focus.</div>"
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/mixins/visually-hidden' as hidden;\n.project-sr-text { @include hidden.visually-hidden(); }\n.project-skip-link { @include hidden.visually-hidden-focusable(); }"
        }
      ]
    },
    {}
  ]
}

export const helpersRuntimeScripts: Record<string, string> = {
  "helpers/stretched-link": "\nconst demoStyle = document.createElement('style'); demoStyle.textContent = \".demo-contrast {\\n  --trm-primary-bg: var(--trm-blue-700);\\n  --trm-success-bg: var(--trm-green-700);\\n  --trm-danger-bg: var(--trm-red-700);\\n  --trm-primary-fg: var(--trm-primary-fg-emphasis);\\n  --trm-success-fg: var(--trm-success-fg-emphasis);\\n  --trm-danger-fg: var(--trm-danger-fg-emphasis);\\n  --trm-info-fg: var(--trm-info-fg-emphasis);\\n  --trm-warning-fg: var(--trm-warning-fg-emphasis);\\n  --trm-link-color: var(--trm-primary-fg-emphasis);\\n  --trm-link-hover-color: var(--trm-primary-fg-emphasis);\\n}\\n.demo-contrast [data-trm-theme][dir] {\\n  color: var(--trm-fg-body);\\n  background-color: var(--trm-bg-body);\\n}\\n/* Calendar Pro appends input popups to body, outside the wrapper. Its styles\\n   option carries this explicit class to both popup and inline calendars. */\\n.demo-calendar-contrast[data-vc=\\\"calendar\\\"] {\\n  --trm-datepicker-day-selected-bg: var(--trm-blue-700);\\n  --trm-datepicker-day-disabled-color: var(--trm-fg-2);\\n}\\n.demo-calendar-contrast [data-vc-date-month=\\\"prev\\\"] [data-vc-date-btn],\\n.demo-calendar-contrast [data-vc-date-month=\\\"next\\\"] [data-vc-date-btn] {\\n  opacity: .8;\\n}\"; document.head.append(demoStyle);"
}
