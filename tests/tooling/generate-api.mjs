import { readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import ts from 'typescript-bootstrap'

const sourceDirectory = 'src/js'
const rootFiles = (await readdir(sourceDirectory))
  .filter(file => file.endsWith('.ts') && !['base-component.ts', 'dialog-base.ts', 'index.ts'].includes(file))
const files = [...rootFiles, 'extensions/command-palette.ts'].sort()
const compilerConfig = ts.readConfigFile('tsconfig.core.json', ts.sys.readFile)
const parsedConfig = ts.parseJsonConfigFileContent(compilerConfig.config, ts.sys, process.cwd())
const program = ts.createProgram(parsedConfig.fileNames, { ...parsedConfig.options, noEmit: true })
const checker = program.getTypeChecker()
const toggleTargets = new Set(['button', 'collapse', 'command-palette', 'datepicker', 'dialog', 'drawer', 'menu', 'popover', 'tab', 'toast', 'toggler'])

const kebab = value => value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const hasModifier = (node, kind) => node.modifiers?.some(modifier => modifier.kind === kind) ?? false

function signature(member, source) {
  const name = member.name?.getText(source)
  if (!name || hasModifier(member, ts.SyntaxKind.PrivateKeyword) || hasModifier(member, ts.SyntaxKind.ProtectedKeyword) || hasModifier(member, ts.SyntaxKind.StaticKeyword)) return null
  if (ts.isMethodDeclaration(member)) {
    const parameters = member.parameters.map(parameter => parameter.getText(source)).join(', ')
    return `${name}(${parameters}): ${member.type?.getText(source) ?? 'void'}`
  }
  if (ts.isPropertyDeclaration(member) && member.initializer && ts.isArrowFunction(member.initializer)) {
    const parameters = member.initializer.parameters.map(parameter => parameter.getText(source)).join(', ')
    return `${name}(${parameters}): ${member.initializer.type?.getText(source) ?? 'void'}`
  }
  return null
}

function interfaceOptions(declaration, source, forceOptional = false) {
  if (!declaration) return []
  const members = ts.isInterfaceDeclaration(declaration) ? declaration.members :
    ts.isTypeAliasDeclaration(declaration) && ts.isTypeLiteralNode(declaration.type) ? declaration.type.members :
      ts.isTypeAliasDeclaration(declaration) && ts.isIntersectionTypeNode(declaration.type) ?
        declaration.type.types.flatMap(type => ts.isTypeLiteralNode(type) ? [...type.members] : []) : []
  return members.map(member => ({
    name: member.name?.getText(source) ?? '',
    type: member.type?.getText(source) ?? 'unknown',
    required: forceOptional ? false : !member.questionToken
  })).filter(option => option.name && option.name !== '[key: string]')
}

const dialogBasePath = join(sourceDirectory, 'dialog-base.ts')
const dialogBaseText = await readFile(dialogBasePath, 'utf8')
const dialogBaseSource = ts.createSourceFile(dialogBasePath, dialogBaseText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
const dialogBaseClass = dialogBaseSource.statements.find(node => ts.isClassDeclaration(node) && node.name?.text === 'DialogBase')
const dialogBaseConfig = dialogBaseSource.statements.find(node => ts.isInterfaceDeclaration(node) && node.name.text === 'DialogBaseConfig')
const dialogBaseMethods = dialogBaseClass?.members.map(member => signature(member, dialogBaseSource)).filter(Boolean) ?? []
const dialogBaseOptions = interfaceOptions(dialogBaseConfig, dialogBaseSource, true)
const dialogBaseEvents = ['show', 'shown', 'hide', 'hidden', 'hidePrevented']

const tooltipPath = join(sourceDirectory, 'tooltip.ts')
const tooltipText = await readFile(tooltipPath, 'utf8')
const tooltipSource = ts.createSourceFile(tooltipPath, tooltipText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
const tooltipClass = tooltipSource.statements.find(node => ts.isClassDeclaration(node) && node.name?.text === 'Tooltip')
const tooltipConfig = tooltipSource.statements.find(node => ts.isTypeAliasDeclaration(node) && node.name.text === 'TooltipConfig')
const tooltipMethods = tooltipClass?.members.map(member => signature(member, tooltipSource)).filter(Boolean) ?? []
const tooltipOptions = interfaceOptions(tooltipConfig, tooltipSource, true)
const tooltipEvents = ['show', 'shown', 'hide', 'hidden', 'inserted']

const components = []
for (const file of files) {
  const path = join(sourceDirectory, file)
  const text = await readFile(path, 'utf8')
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const name = basename(file, '.ts')
  const optionInterface = source.statements.find(node =>
    (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
    (node.name.text.endsWith('Options') || node.name.text.endsWith('Config'))
  )
  const classNode = source.statements.find(node => ts.isClassDeclaration(node))
  const typedSource = program.getSourceFile(path)
  const typedClass = typedSource?.statements.find(node => ts.isClassDeclaration(node))
  const extendsDialogBase = classNode?.heritageClauses?.some(clause => clause.getText(source).includes('DialogBase')) ?? false
  const extendsTooltip = classNode?.heritageClauses?.some(clause => clause.getText(source).includes('Tooltip')) ?? false
  const ownOptions = interfaceOptions(optionInterface, source, optionInterface?.name.text.endsWith('Config'))
  let options = [...(extendsDialogBase ? dialogBaseOptions : []), ...(extendsTooltip ? tooltipOptions : []), ...ownOptions]
  const ownMethods = classNode?.members.map(member => signature(member, source)).filter(Boolean) ?? []
  let methods = [...new Set([...(extendsDialogBase ? dialogBaseMethods : []), ...(extendsTooltip ? tooltipMethods : []), ...ownMethods])]
  if (typedClass?.name) {
    const instanceType = checker.getDeclaredTypeOfSymbol(checker.getSymbolAtLocation(typedClass.name))
    const constructorType = checker.getTypeOfSymbolAtLocation(checker.getSymbolAtLocation(typedClass.name), typedClass)
    const constructor = checker.getSignaturesOfType(constructorType, ts.SignatureKind.Construct)[0]
    const configParameter = constructor?.parameters[1]
    if (configParameter) {
      const type = checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(configParameter, typedClass))
      options = type.getProperties().map(property => ({ name: property.name,
        type: checker.typeToString(checker.getTypeOfSymbolAtLocation(property, typedClass), typedClass, ts.TypeFormatFlags.NoTruncation),
        required: !(property.flags & ts.SymbolFlags.Optional) }))
    }
    methods = instanceType.getProperties().flatMap(property => {
      const declaration = property.valueDeclaration ?? property.declarations?.[0]
      if (!declaration || property.name === 'constructor' || ts.getCombinedModifierFlags(declaration) & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected | ts.ModifierFlags.Static)) return []
      return checker.getSignaturesOfType(checker.getTypeOfSymbolAtLocation(property, typedClass), ts.SignatureKind.Call)
        .map(signature => `${property.name}${checker.signatureToString(signature, typedClass, ts.TypeFormatFlags.NoTruncation)}`)
    })
  }
  const sourceEvents = [...text.matchAll(/['"]([A-Za-z]+\.trm\.[a-z-]+)['"]/g)].map(match => match[1])
  const constantEvents = [...text.matchAll(/const EVENT_[A-Z_]+\s*=\s*`([A-Za-z]+)\$\{EVENT_KEY\}`/g)].map(match => `${match[1]}.trm.${name}`)
  const eventConstants = Object.fromEntries(
    [...text.matchAll(/const (EVENT_[A-Z_]+)\s*=\s*['"]([A-Za-z]+)['"]/g)].map(match => [match[1], match[2]])
  )
  const triggeredEvents = [...text.matchAll(/EventHandler\.trigger\([^,\n]+,\s*this\.constructor\.eventName\((EVENT_[A-Z_]+)\)/g)]
    .map(match => eventConstants[match[1]])
    .filter(Boolean)
    .map(event => `${event}.trm.${name}`)
  const inheritedEvents = [
    ...(extendsDialogBase ? dialogBaseEvents : []),
    ...(extendsTooltip ? tooltipEvents : [])
  ].map(event => `${event}.trm.${name}`)
  const events = [...new Set([...sourceEvents, ...constantEvents, ...triggeredEvents, ...inheritedEvents])].sort()
  const sourceHooks = [...new Set([...text.matchAll(/dataset\.trm([A-Z][A-Za-z0-9]*)/g)].map(match => `data-trm-${kebab(match[1])}`))]
  const literalHooks = [...new Set([...text.matchAll(/data-trm-([a-z0-9-]+)/g)].map(match => `data-trm-${match[1]}`))]
  const optionHooks = options.map(option => `data-trm-${kebab(option.name)}`)
  const dataAttributes = [...sourceHooks, ...literalHooks, ...optionHooks]
  if (toggleTargets.has(name)) dataAttributes.unshift(`data-trm-toggle="${name}"`)
  if (toggleTargets.has(name) && !['carousel', 'menu', 'datepicker', 'popover'].includes(name)) dataAttributes.push('data-trm-target')

  components.push({ name, className: classNode?.name?.text ?? '', options, methods, events, dataAttributes: [...new Set(dataAttributes)].sort() })
}

const contract = {
  $schema: './api.schema.json',
  framework: 'Tremplin',
  version: JSON.parse(await readFile('package.json', 'utf8')).version,
  commonMethods: ['getInstance(element)', 'getOrCreateInstance(element, options?)', 'dispose()'],
  components
}

await writeFile('metadata/api.json', `${JSON.stringify(contract, null, 2)}\n`)
if (process.argv.includes('--snapshot')) throw new Error('Review metadata/strict-api-baseline.json explicitly; build:api never changes the strict baseline')
process.stdout.write(`Generated API metadata for ${components.length} components.\n`)
