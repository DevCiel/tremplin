import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { foundationExamples, foundationDetails } from '../site/src/data/foundation-component-docs'
import { componentDetails, examples } from '../site/src/data/component-docs'
import { componentExample, componentDetail, componentTarget } from '../site/src/data/component-reference'
import manifest from '../metadata/components.json' with { type: 'json' }
import schema from '../metadata/components.schema.json' with { type: 'json' }
import { ast, cssTree, sass, sassPin, sheet } from './helpers/pinned-sass'
import { approvedSass, prepareApprovedSass } from './helpers/approved-sass'
import { guideSource } from './helpers/guide-sass'

let core: string
let selectors: string
const reference = 'artifacts/bootstrap6-reference/' + sassPin.commit + '/'
const names = ['button', 'alert', 'badge', 'card'] as const
beforeAll(async () => {
  await prepareApprovedSass()
  core = sheet('tremplin')
  const all: string[] = []
  ast(core).walkRules(rule => { all.push(rule.selector) })
  selectors = all.join('\n')
}, 90_000)
const hasClass = (name: string) => {
  const pattern = new RegExp('\\.' + name.replaceAll(':', '\\\\:') + '(?![\\w-])')
  return pattern.test(selectors)
}

describe('canonical foundation component documentation', () => {
  for (const name of names) {
    it(name + ': verifies the raw pinned reference and directly authored classes/tokens', () => {
      const inventory = JSON.parse(readFileSync(reference + 'reference-manifest.json', 'utf8')) as { commit: string; files: { path: string; sha: string }[] }
      expect(inventory.commit).toBe(sassPin.commit)
      const file = inventory.files.find(file => file.path === 'site/src/content/docs/components/' + name + '.mdx')!
      const bytes = readFileSync(reference + file.path)
      expect(createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex')).toBe(file.sha)
      const hooks = name === 'card' ? new Set(['card-title', 'card-text']) : new Set<string>()
      for (const hook of hooks) expect(bytes.toString('utf8')).toContain(hook)
      const properties = new Set<string>()
      ast(core).walkDecls(decl => { properties.add(decl.prop) })
      for (const markup of [foundationExamples[name], ...foundationDetails[name].variants.map(v => v.markup)]) {
        const doc = new DOMParser().parseFromString(markup, 'text/html')
        for (const element of doc.querySelectorAll('[class]')) for (const className of element.classList) expect(hooks.has(className) || hasClass(className), className).toBe(true)
        expect(doc.querySelectorAll('.cluster, .stack, .btn-primary, .btn-outline-primary, .alert-dismissible, [class*="alert-primary"], .bg-light, .text-primary, .text-bg-primary')).toHaveLength(0)
        for (const button of doc.querySelectorAll('button')) expect(button.type).toBe('button')
        for (const token of markup.matchAll(/--trm-[\w-]+/g)) expect(properties.has(token[0]), token[0]).toBe(true)
      }
      for (const className of manifest.components.find(c => c.name === name)!.classes) expect(hooks.has(className) || hasClass(className), className).toBe(true)
    })

    it(name + ': reaches the renderer without needing class-alias translation', () => {
      expect(examples[name]).toBe(foundationExamples[name])
      expect(componentDetails[name]).toBe(foundationDetails[name])
      const samples = [componentExample(name)!, ...componentDetail(name)!.variants.map(v => v.markup)]
      const original = [foundationExamples[name], ...foundationDetails[name].variants.map(v => v.markup)]
      for (let index = 0; index < samples.length; index++) {
        const doc = new DOMParser().parseFromString(samples[index]!, 'text/html')
        const raw = new DOMParser().parseFromString(original[index]!, 'text/html')
        const wrapper = doc.querySelector('.demo-contrast')
        expect((wrapper ?? doc.body).innerHTML.trim()).toBe(raw.body.innerHTML.trim())
      }
    })

    it(name + ': copies supported Sass token overrides that match the approved pin', () => {
      const source = guideSource(foundationDetails[name].sass!)
      const properties = new Set<string>()
      ast(core).walkDecls(decl => { properties.add(decl.prop) })
      for (const token of source.matchAll(/--trm-[\w-]+/g)) expect(properties.has(token[0]), token[0]).toBe(true)
      const actual = sass(source)
      expect(actual.trim()).not.toBe('')
      expect(cssTree(actual)).toBe(cssTree(approvedSass(source)))
    })
  }

  it('uses the real container-group pattern and documents structural hooks honestly', () => {
    const markup = foundationDetails.card.variants.find(v => v.title === 'Card groups')!.markup
    const doc = new DOMParser().parseFromString(markup, 'text/html')
    expect(doc.querySelectorAll('.contains-inline > .card-group > .card')).toHaveLength(3)
    expect(foundationDetails.card.guidelines.join(' ')).toContain('structural hooks')
    expect(foundationDetails.alert.guidelines.join(' ')).toContain('Focus restoration is not automatic')
    expect(foundationDetails.alert.variants.find(v => v.title === 'Dismissible alert')!.description).toContain('removes the element after its exit transition, then emits closed')
    const alert = new DOMParser().parseFromString(foundationExamples.alert, 'text/html')
    expect(alert.querySelector('.btn-close')?.textContent).toBe('')
  })

  it('does not invent Toggler styles or disclose Drawer policy as Navbar behavior', () => {
    const toggler = manifest.components.find(c => c.name === 'toggler')!
    expect(toggler.classes).toEqual([])
    expect(toggler.accessibility).toContain('no fixed CSS class')
    const condition = schema.properties.components.items.allOf[0]!
    expect(condition.if.properties.name.const).toBe('toggler')
    expect(condition.then.properties.classes.maxItems).toBe(0)
    expect(condition.else.properties.classes.minItems).toBe(1)
    const navbar = manifest.components.find(c => c.name === 'navbar')!
    expect(navbar.kind).toBe('css-pattern')
    expect(navbar.accessibility).toContain('Drawer JavaScript')
    for (const name of navbar.classes) expect(hasClass(name), name).toBe(true)
    expect(navbar.classes).not.toContain('navbar-collapse')
  })

  it('targets a real Button toggle rather than a decorative base button', () => {
    const selector = componentTarget('button')
    expect(selector).toBe('[data-trm-toggle="button"]')
    const doc = new DOMParser().parseFromString(foundationExamples.button, 'text/html')
    expect(doc.querySelector(selector)?.textContent).toBe('Toggle example action')
  })
})
