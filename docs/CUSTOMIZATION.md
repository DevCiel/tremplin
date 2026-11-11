# Sass customization

Configure the current Sass module before its first evaluation:

```scss
@use 'tremplin/scss' with (
  $primary: #6d4aff,
  $enable-rounded: true
);
```

The application's Sass integration must resolve package imports; the installed
package checks cover this separately from compiling repository source. Use
[the customization guide source](../site/src/content/docs/customize/sass.mdx) and
[the exported Sass contract](../metadata/public-api.json) for supported variables,
functions, mixins and selective entry points. Do not restore configuration
names or merge behavior from the retired hybrid guides.

Runtime custom properties retain `--trm-*`, data hooks retain `data-trm-*`, and
public class names remain unprefixed. The current core and its optional
extension CSS are separate outputs. Load optional CSS explicitly when needed;
do not assume it is included in the default core.

See [current migration guidance](MIGRATION.md) before adapting an older project.
