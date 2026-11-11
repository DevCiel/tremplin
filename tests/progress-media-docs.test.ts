import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { componentDetails, examples } from '../site/src/data/component-docs'
import manifest from '../metadata/components.json' with { type: 'json' }
import { ast, cssTree, sass, sassPin, sheet } from './helpers/pinned-sass'
import { approvedSass, prepareApprovedSass } from './helpers/approved-sass'
import { guideSource } from './helpers/guide-sass'

let core: string
beforeAll(async () => {
  await prepareApprovedSass()
  core = sheet('tremplin')
}, 90_000)

describe('pinned Stepper and Carousel documentation', () => {
  for (const name of ['stepper', 'carousel']) {
    it(name + ': uses a hash-verified upstream document, without copying stale examples as API', () => {
      const reference = 'artifacts/bootstrap6-reference/' + sassPin.commit + '/'
      const inventory = JSON.parse(readFileSync(reference + 'reference-manifest.json', 'utf8')) as { commit: string; files: { path: string; sha: string }[] }
      expect(inventory.commit).toBe(sassPin.commit)
      const file = inventory.files.find(file => file.path === 'site/src/content/docs/components/' + name + '.mdx')!
      const bytes = readFileSync(reference + file.path)
      const blob = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex')
      expect(blob).toBe(file.sha)
    })

    it(name + ': authors all live example and catalog classes against current core selectors', () => {
      const detail = componentDetails[name]!
      const samples = [examples[name]!, ...detail.variants.map(variant => variant.markup)]
      const root = ast(core)
      for (const markup of samples) {
        const doc = new DOMParser().parseFromString(markup, 'text/html')
        for (const element of doc.querySelectorAll('[class]')) for (const name of element.classList) {
          const pattern = new RegExp('\\.' + name.replaceAll(':', '\\\\:') + '(?![\\w-])')
          let found = false
          root.walkRules(rule => { if (pattern.test(rule.selector)) found = true })
          expect(found, name).toBe(true)
        }
        const properties = new Set<string>()
        root.walkDecls(decl => { properties.add(decl.prop) })
        for (const match of markup.matchAll(/--trm-[\w-]+/g)) expect(properties.has(match[0]), match[0]).toBe(true)
      }
      for (const className of manifest.components.find(component => component.name === name)!.classes) {
        let found = false
        const pattern = new RegExp('\\.' + className.replaceAll(':', '\\\\:') + '(?![\\w-])')
        root.walkRules(rule => { if (pattern.test(rule.selector)) found = true })
        expect(found, className).toBe(true)
      }
    })

    it(name + ': copyable Sass matches the approved pin without ignored invented options', () => {
      const source = guideSource(componentDetails[name]!.sass!)
      const actual = sass(source)
      expect(cssTree(actual)).toBe(cssTree(approvedSass(source)))
      expect(actual.trim()).not.toBe('')
      if (name === 'stepper') expect(actual).toContain('--trm-stepper-size: 2.5rem')
      else expect(actual).toContain('--trm-carousel-control-icon-width: 1.25rem')
    })
  }

  it('teaches native Stepper item/active/current semantics without old wizard classes', () => {
    const doc = new DOMParser().parseFromString(examples.stepper!, 'text/html')
    expect(doc.querySelectorAll('ol.stepper > li.stepper-item')).toHaveLength(3)
    expect(doc.querySelectorAll('.stepper-item.active')).toHaveLength(2)
    expect(doc.querySelectorAll('[aria-current="step"]')).toHaveLength(1)
    for (const variant of componentDetails.stepper!.variants) expect(variant.markup).not.toMatch(/class="[^"]*\b(?:stepper-vertical|step-title|step-description|complete)\b/)
    expect(componentDetails.stepper!.variants.some(variant => variant.markup.includes('contains-inline') && variant.markup.includes('sm:stepper-horizontal'))).toBe(true)
    expect(componentDetails.stepper!.variants.some(variant => variant.markup.includes('stepper-overflow'))).toBe(true)
  })

  it('isolates source and technical tokens without forcing component layouts to LTR', () => {
    const css = ast(readFileSync('site/public/docs.css', 'utf8'))
    for (const selector of ['.docs-main pre', '.docs-main code', '.docs-main kbd', '.docs-code']) {
      let direction = '', bidi = ''
      css.walkRules(rule => {
        if (!rule.selectors.includes(selector)) return
        rule.walkDecls(decl => { if (decl.prop === 'direction') direction = decl.value; if (decl.prop === 'unicode-bidi') bidi = decl.value })
      })
      expect(direction).toBe('ltr')
      expect(bidi).toBe('isolate')
    }
    css.walkRules(rule => {
      if (rule.selector.includes('.docs-example')) rule.walkDecls('direction', () => { throw new Error('Component examples must retain their own document direction') })
    })
  })

  it('connects every native Carousel control to its own root and starts motion only on user request', () => {
    for (const markup of [examples.carousel!, ...componentDetails.carousel!.variants.map(variant => variant.markup)]) {
      const doc = new DOMParser().parseFromString(markup, 'text/html')
      for (const button of doc.querySelectorAll<HTMLButtonElement>('button')) {
        expect(button.type).toBe('button')
        expect(doc.querySelector(button.getAttribute('data-trm-target')!)?.contains(button)).toBe(true)
        expect(button.getAttribute('aria-label') || button.textContent?.trim()).toBeTruthy()
        if (button.hasAttribute('data-trm-slide')) expect(button.querySelector('[aria-hidden="true"]') || button.textContent?.trim()).toBeTruthy()
      }
      expect(doc.querySelectorAll('[data-trm-autoplay="true"]')).toHaveLength(0)
      for (const root of doc.querySelectorAll('.carousel')) expect(root.querySelectorAll('.carousel-inner > .carousel-item.active')).toHaveLength(1)
    }
    expect(componentDetails.carousel!.guidelines.join(' ')).toContain('data-trm-autoplay="true"')
    expect(componentDetails.carousel!.guidelines.join(' ')).toContain('Carousel.getOrCreateInstance')
  })
})
