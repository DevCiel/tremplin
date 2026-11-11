# Interaction components

Import the native ES-module entry or the plugin needed by the application.
Component-owned data APIs register on import. Public browser files must be
loaded with `type="module"`; there is no public classic-script dispatcher.

```html
<button type="button" class="btn-solid theme-primary"
  data-trm-toggle="collapse" data-trm-target="#details"
  aria-expanded="false" aria-controls="details">Details</button>
<div class="collapse" id="details">Additional content</div>
```

The actual methods, options and lifecycle events are recorded in
[metadata/api.json](../metadata/api.json). Use those component-specific contracts:
do not assume every plugin has a toggle method, accepts an initial toggle option,
or returns the same kind of value from every operation.

Menu replaces the old Dropdown component. Dialog/Drawer use their current
component-owned native-dialog contracts. Floating UI is used where positioning
is required. Command Palette is an optional extension, not a root export.
Do not restore retired aliases or an overlay-manager API from old documentation.

Use [the JavaScript guide](../site/src/content/docs/getting-started/javascript.mdx),
[component guides](../site/src/data/component-reference.ts), and
[security policy](../SECURITY.md) for current data hooks, focus behavior,
sanitization, Trusted Types and cleanup requirements. Follow
[the migration guide](MIGRATION.md) when replacing a retired application setup.
