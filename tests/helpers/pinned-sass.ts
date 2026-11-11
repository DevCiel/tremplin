import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { compileString } from 'sass'
import postcss, { type AtRule, type ChildNode, type Node, type Root, type Rule } from 'postcss'

const read = (file: string) => JSON.parse(readFileSync(file, 'utf8'))
export const sassPin = read('metadata/bootstrap6-reference.json') as { commit: string; expectedCoreModules: { scss: number } }
const stage = path.resolve('artifacts/bootstrap6-strict', sassPin.commit)
const cache = new Map<string, string>()
let verified = false

function verifyReference() {
  if (verified) return
  const manifest = read(path.join(stage, 'stage-manifest.json')) as { commit: string; productVersion: string; modules: { path: string; sha256: string }[] }
  if (manifest.commit !== sassPin.commit || manifest.productVersion !== read('package.json').version) throw new Error('Stale pinned Sass stage; explicitly prepare with audit:tremplin -- --fetch --stage --check, then validate:tremplin-stage')
  const modules = manifest.modules.filter(entry => entry.path.startsWith('scss/'))
  if (modules.length !== sassPin.expectedCoreModules.scss) throw new Error('Incomplete pinned Sass stage')
  for (const entry of modules) {
    if (!/^scss\/(?:[\w-]+\/)*[\w.-]+\.scss$/.test(entry.path)) throw new Error('Unsafe Sass reference path')
    const actual = createHash('sha256').update(readFileSync(path.join(stage, entry.path))).digest('hex')
    if (actual !== entry.sha256) throw new Error(`Modified pinned Sass reference: ${entry.path}`)
  }
  verified = true
}

/** Independent upstream stage, never populated from production source.
 * Datepicker's approved SVG value patch is checked by check:production-css;
 * layout-only output has no source exceptions and can be compared exactly.
 */
export function sass(source: string, reference = false): string {
  if (reference) verifyReference()
  const key = `${reference}:${source}`
  if (!cache.has(key)) {
    // Sass treats a Windows drive prefix as a URL scheme inside @use.
    const referencePath = path.relative(process.cwd(), stage).replaceAll('\\', '/')
    const input = reference ? source.replaceAll('src/scss/', `${referencePath}/scss/`) : source
    cache.set(key, compileString(input, {
      loadPaths: [process.cwd()],
      // Suppress only the pinned color-channel-name compiler deprecation.
      silenceDeprecations: ['color-4-api']
    }).css)
  }
  return cache.get(key)!
}

export const sheet = (entry: string, reference = false) => sass(`@use 'src/scss/${entry}';`, reference)
export const ast = (source: string) => postcss.parse(source)
export function rules(selector: string, source: string | Root): Rule[] {
  const found: Rule[] = []
  const root = typeof source === 'string' ? ast(source) : source
  root.walkRules(rule => { if (rule.selectors.includes(selector)) found.push(rule) })
  return found
}
export function values(selector: string, property: string, source: string | Root): string[] {
  return rules(selector, source).flatMap(rule => rule.nodes.filter(node => node.type === 'decl' && node.prop === property).map(node => node.type === 'decl' ? node.value : ''))
}
export function ancestors(node: ChildNode, kind?: string): string[] {
  const result: string[] = []
  for (let parent: Node | undefined = node.parent; parent && parent.type !== 'root'; parent = parent.parent) {
    if (parent.type === 'atrule' && (!kind || (parent as AtRule).name === kind)) result.unshift(kind ? (parent as AtRule).params : `@${(parent as AtRule).name} ${(parent as AtRule).params}`)
  }
  return result
}
export function topology(source: string) {
  const result: { selector: string; context: string[] }[] = []
  ast(source).walkRules(rule => { result.push({ selector: rule.selector, context: ancestors(rule) }) })
  return result
}
export function cssTree(source: string): string {
  const root = ast(source)
  root.walkComments(comment => { comment.remove() })
  return root.toString().trim()
}
