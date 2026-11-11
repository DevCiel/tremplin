# Content, forms and components

The current framework follows the pinned Bootstrap 6 core with unprefixed
classes and Tremplin-owned data hooks. Use the generated component guides rather
than the retired prototype catalogs.

- [Component catalog source](../site/src/data/component-reference.ts)
- [Forms guide source](../site/src/content/docs/forms/overview.mdx)
- [JavaScript API inventory](../metadata/api.json)
- [Public CSS/Sass and package contract](../metadata/public-api.json)

The documentation website exposes these at `/components/`, `/forms/` and
`/api/`. Build and run it using the [repository quick start](../README.md#quick-start).

Use canonical classes shown by the current guides, such as
`btn-solid theme-primary`. Menu is a core component; Scrollspy is JavaScript
behavior, not a dedicated root Sass partial. Optional local patterns are
explicitly separated from the core. Do not infer a public component, option or
class merely from a retired example.

Applications must supply native semantics, labels, help/error associations and
appropriate validation behavior. An application-owned error summary is not a
promise of a core `.error-summary` class. Follow the current guide examples and
[accessibility qualification policy](ACCESSIBILITY_TESTING.md).
