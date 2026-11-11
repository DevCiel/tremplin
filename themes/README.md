# Tremplin theme presets

Load a preset after Tremplin CSS, then select it on the root element:

```html
<link rel="stylesheet" href="tremplin.css">
<link rel="stylesheet" href="tremplin-ocean.css">
<html data-trm-theme="ocean">
```

The presets only override public design tokens. They do not add or rename component classes.
When changing a semantic color, also set its matching `--trm-*-contrast` token so
filled controls retain accessible text contrast while outline controls keep using
the semantic color itself.
