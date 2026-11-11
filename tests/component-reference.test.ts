import { existsSync } from 'node:fs'
import { compile, compileString } from 'sass'
import { describe, expect, it } from 'vitest'
import api from '../metadata/api.json'
import { documentedTokenNames } from '../site/src/data/documented-tokens'
import { coreComponentTopics, documentedComponents, implementationName, componentExample, componentDetail, componentSource, componentTarget, componentImport, additionalComponentDetails, componentNavigationGroups } from '../site/src/data/component-reference'

describe('Bootstrap component documentation coverage', () => {
  it('covers all 29 reference topic routes and preserves the 42 original routes', () => {
    expect(coreComponentTopics).toHaveLength(29)
    expect(documentedComponents).toHaveLength(47)
    expect(new Set(documentedComponents.map(component => component.name)).size).toBe(47)
    const links = Object.values(componentNavigationGroups).flat()
    expect(new Set(links).size).toBe(47)
    for (const topic of coreComponentTopics) expect(links).toContain(topic)
    for (const component of documentedComponents) {
      expect(existsSync(componentSource(component.name)), component.name).toBe(true)
      expect(componentExample(component.name), component.name).toBeTruthy()
      expect(componentDetail(component.name), component.name).toBeTruthy()
    }
  })
  it('shares alias implementations instead of creating duplicate APIs', () => {
    expect(implementationName('placeholder')).toBe('skeleton')
    expect(implementationName('toasts')).toBe('toast')
    expect(componentDetail('toasts')).toBe(componentDetail('toast'))
    expect(componentExample('placeholder')).toBe(componentExample('skeleton'))
  })
  it('uses real JavaScript targets and export-compatible individual imports', async () => {
    for (const component of api.components) {
      if (component.name === 'command-palette') continue
      const source = componentExample(component.name)!
      const holder = document.createElement('div')
      holder.innerHTML = source
      expect(holder.querySelector(componentTarget(component.name)), component.name).not.toBeNull()
      const exports = await import(`../src/js/${component.name}.ts`) as Record<string, unknown>
      const code = componentImport(component.name, component.className)
      expect(code).toContain(`'tremplin/${component.name}'`)
      expect(typeof (code.includes('import {') ? exports[component.className] : exports.default), component.name).toBe('function')
    }
  })
  it('documents only variables present in the relevant source or global tokens', () => {
    for (const [name, detail] of Object.entries(additionalComponentDetails)) {
      expect(detail.variants.length).toBeGreaterThanOrEqual(3)
      expect(detail.guidelines.length).toBeGreaterThanOrEqual(4)
      for (const variable of detail.variables) expect(documentedTokenNames(name).has(variable.name), `${name}: ${variable.name}`).toBe(true)
      if (detail.sass) {
        const source = detail.sass.replaceAll("'tremplin/scss/", "'src/scss/")
        const css = compileString(source, { loadPaths: [process.cwd()] }).css
        expect(css.trim()).not.toBe('')
        if (name === 'nav') expect(css).toContain('--trm-nav-link-padding-x: 1rem')
      }
    }
  })
  it('provides the pinned SVG-masked native close control without an authored glyph', () => {
    const css = compile('src/scss/tremplin.scss').css
    expect(css).toContain('mask-image: var(--trm-btn-close-icon)')
    expect(css).toContain('--trm-btn-close-icon: url(')
    const holder = document.createElement('div')
    holder.innerHTML = componentExample('close-button')!
    const button = holder.querySelector('button')!
    expect(button.textContent).toBe('')
    expect(button.getAttribute('aria-label')).toBe('Close example')
    expect(button.type).toBe('button')
  })
})
