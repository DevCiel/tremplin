# Framework integrations

The core is framework-independent. React and Vue integration helpers are
optional package exports, not imports in the default core.

- [React adapter source](../src/adapters/react.ts): `tremplin/react`
- [Vue adapter source](../src/adapters/vue.ts): `tremplin/vue`
- [Current integration guide source](../site/src/content/docs/guides/npm.mdx)
- [Starter projects](../starters)

Import individual plugins using their actual default component export, for
example `import Collapse from 'tremplin/collapse'`, or named exports from
`tremplin`. Do not copy the retired named component-subpath imports.

Adapters own instance lifecycle during mount/unmount. Keep application event
handlers and declarative data triggers coordinated so a click does not toggle
a component twice. Refer to the adapter's current types for ref/directive
contracts rather than assuming an older hook signature.

The broader consumer-toolchain matrix and starter browser qualification remain
incomplete. Starter templates do not establish a verified public npm/CDN release;
use a current locally built tarball while publication is blocked.
