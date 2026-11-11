import type { CodeSample } from './guide-docs'

// Shared executable samples only; prose is authored in content/docs/.
export const contentExamples: Record<string, { code: CodeSample[]; example?: string }> = {
"content/reboot#1": { code: [
          {
            "language": "css",
            "source": ":root {\n  --trm-bg-body: #fff;\n  --trm-fg-body: #202431;\n  --trm-body-font-family: Arial, sans-serif;\n  --trm-body-line-height: 1.5;\n}"
          }
        ] },
"content/reboot#3": { code: [
          {
            "language": "html",
            "source": "<div><h3>A document section</h3><p>Use semantic headings and paragraphs rather than spacing with repeated line breaks.</p><p>Paragraphs have block-end spacing by default.</p></div>"
          }
        ], example: "<div><h3>A document section</h3><p>Use semantic headings and paragraphs rather than spacing with repeated line breaks.</p><p>Paragraphs have block-end spacing by default.</p></div>" },
"content/reboot#4": { code: [
          {
            "language": "html",
            "source": "<div><p>Read the <a style=\"--trm-link-color:var(--trm-primary-fg-emphasis)\" href=\"/content/typography/\">typography guide</a> for text styling.</p><hr><p>A thematic break separates changes in topic.</p></div>"
          }
        ], example: "<div><p>Read the <a style=\"--trm-link-color:var(--trm-primary-fg-emphasis)\" href=\"/content/typography/\">typography guide</a> for text styling.</p><hr><p>A thematic break separates changes in topic.</p></div>" },
"content/reboot#5": { code: [
          {
            "language": "html",
            "source": "<div><p>Use <code>npm run build</code> in a terminal.</p><p>Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save.</p><p>Example output: <samp>Build complete</samp>.</p></div>"
          }
        ], example: "<div><p>Use <code>npm run build</code> in a terminal.</p><p>Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save.</p><p>Example output: <samp>Build complete</samp>.</p></div>" },
"content/reboot#7": { code: [
          {
            "language": "html",
            "source": "<p hidden>This content is not displayed.</p>"
          }
        ] },
"content/reboot#8": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss' with (\n  $root-tokens: (--trm-body-font-size: 1rem, --trm-body-line-height: 1.6),\n  $enable-smooth-scroll: false\n);"
          }
        ] },
"content/typography#1": { code: [
          {
            "language": "html",
            "source": "<div><h3>A third-level heading</h3><h4>A fourth-level heading</h4><p>Choose heading levels by document structure, not by preferred visual size.</p></div>"
          }
        ], example: "<div><h3>A third-level heading</h3><h4>A fourth-level heading</h4><p>Choose heading levels by document structure, not by preferred visual size.</p></div>" },
"content/typography#2": { code: [
          {
            "language": "html",
            "source": "<div><p class=\"fs-3xl fw-light\">Build with Tremplin</p><p class=\"fs-xl\">A larger introductory paragraph for a section or page.</p></div>"
          }
        ], example: "<div><p class=\"fs-3xl fw-light\">Build with Tremplin</p><p class=\"fs-xl\">A larger introductory paragraph for a section or page.</p></div>" },
"content/typography#3": { code: [
          {
            "language": "html",
            "source": "<div><p><mark>Highlighted text</mark> draws attention without changing the sentence.</p><p><del>Removed content</del> and <ins>inserted content</ins> describe a revision.</p><p><strong>Important text</strong>, <em>emphasis</em>, and <small>a supplementary note</small> preserve meaning.</p></div>"
          }
        ], example: "<div><p><mark>Highlighted text</mark> draws attention without changing the sentence.</p><p><del>Removed content</del> and <ins>inserted content</ins> describe a revision.</p><p><strong>Important text</strong>, <em>emphasis</em>, and <small>a supplementary note</small> preserve meaning.</p></div>" },
"content/typography#4": { code: [
          {
            "language": "html",
            "source": "<div><p class=\"fw-semibold text-start\">A semibold paragraph aligned to the logical start.</p><p><abbr title=\"Application Programming Interface\" class=\"initialism\">API</abbr> describes an application interface.</p></div>"
          }
        ], example: "<div><p class=\"fw-semibold text-start\">A semibold paragraph aligned to the logical start.</p><p><abbr title=\"Application Programming Interface\" class=\"initialism\">API</abbr> describes an application interface.</p></div>" },
"content/typography#5": { code: [
          {
            "language": "html",
            "source": "<figure><blockquote class=\"blockquote\"><p>Keep important content understandable before adding visual polish.</p></blockquote><figcaption class=\"blockquote-footer\">Tremplin documentation example</figcaption></figure>"
          }
        ], example: "<figure><blockquote class=\"blockquote\"><p>Keep important content understandable before adding visual polish.</p></blockquote><figcaption class=\"blockquote-footer\">Tremplin documentation example</figcaption></figure>" },
"content/typography#6": { code: [
          {
            "language": "html",
            "source": "<div><ul><li>Use semantic lists for related items.</li><li>Keep the reading order meaningful.</li></ul><ul class=\"list-unstyled\"><li>Unstyled list item</li><li>Another unstyled item</li></ul><ul class=\"list-inline\"><li class=\"list-inline-item\">HTML</li><li class=\"list-inline-item\">CSS</li></ul></div>"
          }
        ], example: "<div><ul><li>Use semantic lists for related items.</li><li>Keep the reading order meaningful.</li></ul><ul class=\"list-unstyled\"><li>Unstyled list item</li><li>Another unstyled item</li></ul><ul class=\"list-inline\"><li class=\"list-inline-item\">HTML</li><li class=\"list-inline-item\">CSS</li></ul></div>" },
"content/typography#8": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss' with (\n  $root-tokens: (--trm-body-font-family: 'Arial, sans-serif', --trm-body-line-height: 1.6),\n  $font-sizes: (xl: (font-size: 1.75rem, line-height: 1.4))\n);"
          }
        ] },
"content/images#0": { code: [
          {
            "language": "html",
            "source": "<div style=\"max-inline-size: 32rem\" data-content-demo=\"image\"><img src=\"/content-sample.svg\" width=\"800\" height=\"400\" class=\"img-fluid\" alt=\"Three blue panels arranged in a two-column layout\"></div>"
          }
        ], example: "<div style=\"max-inline-size: 32rem\" data-content-demo=\"image\"><img src=\"/content-sample.svg\" width=\"800\" height=\"400\" class=\"img-fluid\" alt=\"Three blue panels arranged in a two-column layout\"></div>" },
"content/images#1": { code: [
          {
            "language": "html",
            "source": "<img src=\"/content-sample.svg\" width=\"240\" height=\"120\" class=\"img-thumbnail\" alt=\"Three blue panels in a thumbnail\">"
          }
        ], example: "<img src=\"/content-sample.svg\" width=\"240\" height=\"120\" class=\"img-thumbnail\" alt=\"Three blue panels in a thumbnail\">" },
"content/images#2": { code: [
          {
            "language": "html",
            "source": "<img src=\"/content-sample.svg\" width=\"256\" height=\"128\" class=\"img-fluid d-block mx-auto\" alt=\"Three blue panels centered in the container\">"
          }
        ], example: "<img src=\"/content-sample.svg\" width=\"256\" height=\"128\" class=\"img-fluid d-block mx-auto\" alt=\"Three blue panels centered in the container\">" },
"content/images#3": { code: [
          {
            "language": "html",
            "source": "<figure class=\"figure\"><img src=\"/content-sample.svg\" width=\"800\" height=\"400\" class=\"img-fluid\" alt=\"Three blue panels arranged in a two-column layout\"><figcaption class=\"figure-caption\">An example two-column arrangement with one tall panel and two stacked panels.</figcaption></figure>"
          }
        ], example: "<figure class=\"figure\"><img src=\"/content-sample.svg\" width=\"800\" height=\"400\" class=\"img-fluid\" alt=\"Three blue panels arranged in a two-column layout\"><figcaption class=\"figure-caption\">An example two-column arrangement with one tall panel and two stacked panels.</figcaption></figure>" },
"content/images#4": { code: [
          {
            "language": "html",
            "source": "<picture>\n  <source media=\"(min-width: 48rem)\" srcset=\"/content-sample.svg\">\n  <img src=\"/content-sample.svg\" width=\"800\" height=\"400\"\n    class=\"img-fluid\" alt=\"Three blue panels arranged in a two-column layout\">\n</picture>"
          }
        ] },
"content/images#5": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss/content/images' with (\n  $thumbnail-tokens: (--trm-thumbnail-border-radius: 1rem),\n  $figure-tokens: (--trm-figure-gap: .75rem)\n);"
          }
        ] },
"content/tables#0": { code: [
          {
            "language": "html",
            "source": "<table class=\"table \"><caption>Project workstreams</caption><thead><tr><th scope=\"col\">Workstream</th><th scope=\"col\">Status</th><th scope=\"col\">Owner</th></tr></thead><tbody><tr><th scope=\"row\">Design</th><td>Ready</td><td>Devciel</td></tr><tr><th scope=\"row\">Documentation</th><td>In review</td><td>Community</td></tr></tbody></table>"
          }
        ], example: "<table class=\"table \"><caption>Project workstreams</caption><thead><tr><th scope=\"col\">Workstream</th><th scope=\"col\">Status</th><th scope=\"col\">Owner</th></tr></thead><tbody><tr><th scope=\"row\">Design</th><td>Ready</td><td>Devciel</td></tr><tr><th scope=\"row\">Documentation</th><td>In review</td><td>Community</td></tr></tbody></table>" },
"content/tables#1": { code: [
          {
            "language": "html",
            "source": "<table class=\"table theme-inverse\"><caption>Project workstreams</caption><thead><tr><th scope=\"col\">Workstream</th><th scope=\"col\">Status</th><th scope=\"col\">Owner</th></tr></thead><tbody><tr><th scope=\"row\">Design</th><td>Ready</td><td>Devciel</td></tr><tr><th scope=\"row\">Documentation</th><td>In review</td><td>Community</td></tr></tbody></table>"
          }
        ], example: "<table class=\"table theme-inverse\"><caption>Project workstreams</caption><thead><tr><th scope=\"col\">Workstream</th><th scope=\"col\">Status</th><th scope=\"col\">Owner</th></tr></thead><tbody><tr><th scope=\"row\">Design</th><td>Ready</td><td>Devciel</td></tr><tr><th scope=\"row\">Documentation</th><td>In review</td><td>Community</td></tr></tbody></table>" },
"content/tables#2": { code: [
          {
            "language": "html",
            "source": "<table class=\"table table-striped-columns\"><caption>Project workstreams</caption><thead><tr><th scope=\"col\">Workstream</th><th scope=\"col\">Status</th><th scope=\"col\">Owner</th></tr></thead><tbody><tr><th scope=\"row\">Design</th><td>Ready</td><td>Devciel</td></tr><tr><th scope=\"row\">Documentation</th><td>In review</td><td>Community</td></tr></tbody></table>"
          }
        ], example: "<table class=\"table table-striped\"><caption>Project workstreams</caption><thead><tr><th scope=\"col\">Workstream</th><th scope=\"col\">Status</th><th scope=\"col\">Owner</th></tr></thead><tbody><tr><th scope=\"row\">Design</th><td>Ready</td><td>Devciel</td></tr><tr><th scope=\"row\">Documentation</th><td>In review</td><td>Community</td></tr></tbody></table>" },
"content/tables#3": { code: [
          {
            "language": "html",
            "source": "<table class=\"table table-striped table-hover\"><caption>Project workstreams</caption><thead><tr><th scope=\"col\">Workstream</th><th scope=\"col\">Status</th><th scope=\"col\">Owner</th></tr></thead><tbody><tr class=\"table-active\"><th scope=\"row\">Design</th><td>Selected for review</td><td>Devciel</td></tr><tr><th scope=\"row\">Documentation</th><td class=\"table-active\">Selected for review</td><td>Community</td></tr></tbody></table>"
          }
        ], example: "<table class=\"table table-striped table-hover\"><caption>Project workstreams</caption><thead><tr><th scope=\"col\">Workstream</th><th scope=\"col\">Status</th><th scope=\"col\">Owner</th></tr></thead><tbody><tr class=\"table-active\"><th scope=\"row\">Design</th><td>Selected for review</td><td>Devciel</td></tr><tr><th scope=\"row\">Documentation</th><td class=\"table-active\">Selected for review</td><td>Community</td></tr></tbody></table>" },
"content/tables#4": { code: [
          {
            "language": "html",
            "source": "<table class=\"table table-borderless\"><caption>Project workstreams</caption><thead><tr><th scope=\"col\">Workstream</th><th scope=\"col\">Status</th><th scope=\"col\">Owner</th></tr></thead><tbody><tr><th scope=\"row\">Design</th><td>Ready</td><td>Devciel</td></tr><tr><th scope=\"row\">Documentation</th><td>In review</td><td>Community</td></tr></tbody></table>"
          }
        ], example: "<table class=\"table table-bordered\"><caption>Project workstreams</caption><thead><tr><th scope=\"col\">Workstream</th><th scope=\"col\">Status</th><th scope=\"col\">Owner</th></tr></thead><tbody><tr><th scope=\"row\">Design</th><td>Ready</td><td>Devciel</td></tr><tr><th scope=\"row\">Documentation</th><td>In review</td><td>Community</td></tr></tbody></table>" },
"content/tables#5": { code: [
          {
            "language": "html",
            "source": "<table class=\"table table-sm\"><caption>Project workstreams</caption><thead><tr><th scope=\"col\">Workstream</th><th scope=\"col\">Status</th><th scope=\"col\">Owner</th></tr></thead><tbody><tr><th scope=\"row\">Design</th><td>Ready</td><td>Devciel</td></tr><tr><th scope=\"row\">Documentation</th><td>In review</td><td>Community</td></tr></tbody></table>"
          }
        ], example: "<table class=\"table table-sm\"><caption>Project workstreams</caption><thead><tr><th scope=\"col\">Workstream</th><th scope=\"col\">Status</th><th scope=\"col\">Owner</th></tr></thead><tbody><tr><th scope=\"row\">Design</th><td>Ready</td><td>Devciel</td></tr><tr><th scope=\"row\">Documentation</th><td>In review</td><td>Community</td></tr></tbody></table>" },
"content/tables#6": { code: [
          {
            "language": "html",
            "source": "<table class=\"table\">\n  <caption>Workstream totals</caption>\n  <thead><tr><th scope=\"col\">Workstream</th><th scope=\"col\">Count</th></tr></thead>\n  <tbody><tr><th scope=\"row\">Open</th><td>12</td></tr></tbody>\n  <tbody class=\"table-group-divider\">\n    <tr><th scope=\"row\">Completed</th><td class=\"align-middle\">8</td></tr>\n  </tbody>\n</table>"
          }
        ] },
"content/tables#8": { code: [
          {
            "language": "html",
            "source": "<table class=\"table caption-top\">\n  <caption>Items in this release</caption>\n  <thead><tr><th scope=\"col\">Category</th><th scope=\"col\">Items</th></tr></thead>\n  <tbody><tr><th scope=\"row\">Guides</th><td>5</td></tr></tbody>\n  <tfoot><tr><th scope=\"row\">Total</th><td>5</td></tr></tfoot>\n</table>"
          }
        ] },
"content/tables#9": { code: [
          {
            "language": "html",
            "source": "<div class=\"md:table-responsive\">\n  <table class=\"table\"><caption>Project totals</caption><tbody><tr><th scope=\"row\">Guides</th><td>5</td></tr></tbody></table>\n</div>"
          }
        ], example: "<div class=\"table-responsive\" role=\"region\" aria-label=\"Scrollable project workstreams\" tabindex=\"0\" data-content-demo=\"table-scroll\"><table class=\"table \"><caption>Project workstreams</caption><thead><tr><th scope=\"col\">Workstream</th><th scope=\"col\">Status</th><th scope=\"col\">Owner</th></tr></thead><tbody><tr><th scope=\"row\">Accessibility and documentation verification</th><td>Awaiting final review of narrow-screen behavior</td><td>Framework contributors and maintainers</td></tr></tbody></table></div>" },
"content/tables#10": { code: [
          {
            "language": "html",
            "source": "<div class=\"table-card\"><div class=\"table-responsive\" role=\"region\" aria-label=\"Stacked workstream example\" tabindex=\"0\"><table class=\"table md:table-stacked\"><caption>Project workstreams</caption><thead><tr><th scope=\"col\">Workstream</th><th scope=\"col\">Status</th></tr></thead><tbody><tr><td data-cell=\"Workstream\">Design</td><td data-cell=\"Status\">In progress</td></tr></tbody></table></div></div>"
          }
        ], example: "<div class=\"table-card\"><div class=\"table-responsive\" role=\"region\" aria-label=\"Stacked workstream example\" tabindex=\"0\"><table class=\"table md:table-stacked\"><caption>Project workstreams</caption><thead><tr><th scope=\"col\">Workstream</th><th scope=\"col\">Status</th></tr></thead><tbody><tr><td data-cell=\"Workstream\">Design</td><td data-cell=\"Status\">In progress</td></tr></tbody></table></div></div>" },
"content/tables#11": { code: [
          {
            "language": "css",
            "source": ".project-table {\n  --trm-table-cell-padding-x: 1rem;\n  --trm-table-cell-padding-y: .75rem;\n  --trm-table-active-bg-factor: 15%;\n}"
          }
        ] },
"content/tables#12": { code: [
          {
            "language": "scss",
            "source": "@use 'tremplin/scss/content/tables' with (\n  $table-tokens: (--trm-table-cell-padding-x: 1rem)\n);"
          }
        ] },
"content/prose#1": { code: [
          {
            "language": "html",
            "source": "<article class=\"prose\" data-content-demo=\"prose\"><h3>Writing useful documentation</h3><p>Start with a concrete task and keep the instructions in a logical order.</p><h4>Review the result</h4><ul><li>Check the example against the actual framework.</li><li>Test the complete task with the keyboard.</li></ul><p>Use <strong>clear labels</strong> and links with understandable purpose.</p></article>"
          }
        ], example: "<article class=\"prose\" data-content-demo=\"prose\"><h3>Writing useful documentation</h3><p>Start with a concrete task and keep the instructions in a logical order.</p><h4>Review the result</h4><ul><li>Check the example against the actual framework.</li><li>Test the complete task with the keyboard.</li></ul><p>Use <strong>clear labels</strong> and links with understandable purpose.</p></article>" },
"content/prose#3": { code: [
          {
            "language": "html",
            "source": "<div class=\"prose\"><p>Run <code>npm run build</code> before reviewing the output.</p><ol><li>Check the local build.</li><li>Open the page at a narrow width.</li></ol></div>"
          }
        ], example: "<div class=\"prose\"><p>Run <code>npm run build</code> before reviewing the output.</p><ol><li>Check the local build.</li><li>Open the page at a narrow width.</li></ol></div>" },
"content/prose#5": { code: [
          {
            "language": "html",
            "source": "<div class=\"prose\"><p>Article content surrounds an embedded application region.</p><div class=\"not-prose\"><h4>Embedded controls</h4><ul><li>First option</li><li>Second option</li></ul></div></div>"
          }
        ], example: "<div class=\"prose\"><p>Article content surrounds an embedded application region.</p><div class=\"not-prose\"><h4>Embedded controls</h4><ul><li>First option</li><li>Second option</li></ul></div></div>" },
"content/prose#6": { code: [
          {
            "language": "css",
            "source": ".project-article {\n  max-inline-size: 65ch;\n  line-height: 1.7;\n}\n.project-article :where(pre, .table-responsive) {\n  max-inline-size: 100%;\n}"
          }
        ] },
}
