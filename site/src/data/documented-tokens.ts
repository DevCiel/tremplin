import catalog from '../../../metadata/documentation-tokens.json' with { type: 'json' }

type Token = { name: string; defaultValue: string; map: string; source: string }
const components = catalog.components as Record<string, { variables: Token[] }>

export const documentedTokens = (name: string) => (components[name]?.variables ?? []).map(token => ({
  name: token.name,
  defaultValue: token.defaultValue,
  purpose: `Default exported through $${token.map}; configure that map before its first Sass load.`
}))

export const documentedTokenNames = (name: string) => new Set([
  ...(components[name]?.variables ?? []), ...(components.root?.variables ?? [])
].map(token => token.name))
