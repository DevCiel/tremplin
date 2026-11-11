import { readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join, relative, sep } from 'node:path'
import ts from 'typescript'
import { compile } from 'sass'
import postcss from 'postcss'

const readJson = async path => JSON.parse(await readFile(path, 'utf8'))
const sortUnique = values => [...new Set(values)].sort((left, right) => left.localeCompare(right))
const hasModifier = (node, kind) => node.modifiers?.some(modifier => modifier.kind === kind) ?? false
const normalizePath = path => path.split(sep).join('/')

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(path))
    else files.push(path)
  }
  return files
}

function moduleExports(path, specifier) {
  return readFile(path, 'utf8').then(text => {
    const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const runtimeExports = []
    const typeExports = []
    const declarations = []

    for (const node of source.statements) {
      if (ts.isExportAssignment(node) && !node.isExportEquals) {
        runtimeExports.push('default')
        continue
      }

      if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const element of node.exportClause.elements) {
          const target = node.isTypeOnly || element.isTypeOnly ? typeExports : runtimeExports
          target.push(element.name.text)
        }
        continue
      }

      if (!hasModifier(node, ts.SyntaxKind.ExportKeyword)) continue
      const isDefault = hasModifier(node, ts.SyntaxKind.DefaultKeyword)
      const name = isDefault ? 'default' : node.name?.text
      if (!name) continue

      if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
        typeExports.push(name)
        declarations.push(node.getText(source).replace(/\s+/g, ' ').trim())
      } else {
        runtimeExports.push(name)
        if (ts.isFunctionDeclaration(node) && node.body) {
          declarations.push(text.slice(node.getStart(source), node.body.getStart(source)).replace(/\s+/g, ' ').trim())
        }
      }
    }

    return {
      specifier,
      runtimeExports: sortUnique(runtimeExports),
      typeExports: sortUnique(typeExports),
      declarations: sortUnique(declarations)
    }
  })
}

function sassSignatures(text, directive) {
  const expression = new RegExp(`@${directive}\\s+([a-zA-Z0-9_-]+)\\s*(\\([^\\n{]*\\))?`, 'g')
  return [...text.matchAll(expression)]
    .filter(match => !match[1].startsWith('-') && !match[1].startsWith('_'))
    .map(match => `${match[1]}${(match[2] ?? '').replace(/\s+/g, ' ')}`)
}

function configurableVariables(text) {
  const declarations = [...text.matchAll(/^\$([a-zA-Z0-9_-]+)\s*:/gm)]
  const variables = []
  for (let index = 0; index < declarations.length; index += 1) {
    const declaration = declarations[index]
    const end = declarations[index + 1]?.index ?? text.length
    if (text.slice(declaration.index, end).includes('!default')) variables.push(declaration[1])
  }
  return variables
}

const manifest = await readJson('package.json')
const components = await readJson('metadata/components.json')
const api = await readJson('metadata/api.json')
const scssFiles = (await walk('src/scss')).filter(path => path.endsWith('.scss'))
const scssSources = await Promise.all(scssFiles.map(async path => ({ path, text: await readFile(path, 'utf8') })))

const componentModules = api.components.map(component => ({
  path: join('src/js', `${component.name}.ts`),
  specifier: `./${component.name}`
})).filter(module => !module.specifier.includes('command-palette'))
const javascriptSources = [
  { path: 'src/js/index.ts', specifier: '.' },
  { path: 'src/adapters/react.ts', specifier: './react' },
  { path: 'src/adapters/vue.ts', specifier: './vue' },
  { path: 'src/js/extensions/command-palette.ts', specifier: './extensions/command-palette' },
  ...componentModules
]
const javascriptModules = await Promise.all(javascriptSources.map(module => moduleExports(module.path, module.specifier)))

const packageExports = Object.entries(manifest.exports)
  .map(([specifier, target]) => ({ specifier, target }))
  .sort((left, right) => left.specifier.localeCompare(right.specifier))

// Inventory the actual strict output, not the historical hybrid component list.
// Include utilities as public selectors; the retained schema field name is legacy.
const actualClasses = []
const generatedProperties = []
const compiledStyles = postcss.parse(compile('src/scss/tremplin.scss').css)
compiledStyles.walkDecls(declaration => {
  if (declaration.prop.startsWith('--trm-')) generatedProperties.push(declaration.prop)
})
compiledStyles.walkRules(rule => {
  for (const match of rule.selector.matchAll(/\.((?:\\[a-f0-9]{1,6}\s?|\\[^\r\n]|[-_a-zA-Z0-9])+)/gi)) {
    actualClasses.push(match[1].replace(/\\([a-f0-9]{1,6})\s?|\\(.)/gi, (_, hex, character) => hex ? String.fromCodePoint(parseInt(hex, 16)) : character))
  }
})
const componentClasses = sortUnique(actualClasses)
const cssCustomProperties = sortUnique([...generatedProperties, ...scssSources.flatMap(({ text }) => [
  ...text.matchAll(/--(?:trm-|#\{\$prefix\})([a-zA-Z0-9-]+)/g)
].map(match => `--trm-${match[1]}`))])

const sassEntrypoints = [
  './scss',
  ...scssFiles
    .filter(path => !basename(path).startsWith('_'))
    .map(path => {
      const normalized = relative('src/scss', path).split(sep).join('/')
      return normalized.endsWith('/index.scss')
        ? `./scss/${normalized.slice(0, -'/index.scss'.length)}`
        : `./scss/${normalized.slice(0, -'.scss'.length)}`
    })
]

const publicVariableFiles = new Set(['src/scss/_colors.scss', 'src/scss/_config.scss', 'src/scss/_theme.scss', 'src/scss/helpers/_hover-lift.scss', 'src/scss/helpers/_icon-link.scss', 'src/scss/helpers/_stretched-link.scss'])
const publicFunctionFiles = new Set(['src/scss/_config.scss', 'src/scss/_functions.scss', 'src/scss/_theme.scss'])
const forwardedMixinFiles = new Set([
  'src/scss/layout/_breakpoints.scss',
  ...scssFiles
    .filter(path => path.startsWith(join('src', 'scss', 'mixins')) && basename(path) !== 'index.scss')
    .map(normalizePath)
])

const sassVariables = sortUnique(scssSources
  .filter(({ path }) => publicVariableFiles.has(normalizePath(path)))
  .flatMap(({ text }) => configurableVariables(text)))
const sassFunctions = sortUnique(scssSources
  .filter(({ path }) => publicFunctionFiles.has(normalizePath(path)) || forwardedMixinFiles.has(normalizePath(path)))
  .flatMap(({ text }) => sassSignatures(text, 'function')))
const sassMixins = sortUnique(scssSources
  .filter(({ path }) => forwardedMixinFiles.has(normalizePath(path)) || normalizePath(path) === 'src/scss/_theme.scss')
  .flatMap(({ text }) => sassSignatures(text, 'mixin')))

const contract = {
  $schema: './public-api.schema.json',
  framework: 'Tremplin',
  version: manifest.version,
  packageExports,
  javascriptModules: javascriptModules.sort((left, right) => left.specifier.localeCompare(right.specifier)),
  css: { componentClasses, customProperties: cssCustomProperties },
  sass: {
    entrypoints: sortUnique(sassEntrypoints),
    variables: sassVariables,
    functions: sassFunctions,
    mixins: sassMixins
  }
}

await writeFile('metadata/public-api.json', `${JSON.stringify(contract, null, 2)}\n`)
if (process.argv.includes('--snapshot')) throw new Error('Review metadata/strict-api-baseline.json explicitly; build:api never changes the strict baseline')
process.stdout.write(`Generated public API contract with ${packageExports.length} package exports, ${javascriptModules.length} JavaScript modules, ${componentClasses.length} component classes, ${cssCustomProperties.length} CSS custom properties, and ${sassVariables.length + sassFunctions.length + sassMixins.length} Sass symbols.\n`)
