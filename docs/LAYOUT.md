# Layout and utilities

JavaScript and Sass remain under `src/js/` and `src/scss/`; build tooling lives
under `build/`. Public layout classes are unprefixed.

```html
<div class="container">
  <div class="grid">
    <aside class="md:col-4">Navigation</aside>
    <main class="md:col-8">Content</main>
  </div>
</div>
```

Use the current responsive-prefix syntax and actual source-derived utility
values, not the suffix/infix aliases documented by the retired hybrid versions.

- [Layout guide source](../site/src/content/docs/layout/grid.mdx)
- [Utility guide source](../site/src/data/utilities-guides.ts)
- [Pinned configuration](../src/scss/_config.scss)
- [Layout source](../src/scss/layout/index.scss)
- [Public selectors and Sass contract](../metadata/public-api.json)

The live documentation routes are `/layout/` and `/utilities/`. Consult the
specific Grid or utility guide for defaults, RTL behavior and customization;
do not assume Bootstrap 5 classes or old Tremplin aliases are supported.
