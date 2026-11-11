// Copied into a temporary installed consumer by tests/tooling/test-package.mjs.
// jsdom belongs to the QA host; the framework imports resolve from the consumer.
import assert from 'node:assert/strict'
import { JSDOM } from '__DOM_HOST__'

const dom = new JSDOM('<!doctype html><html lang="en"><body><button id="probe" type="button">Toggle</button></body></html>',{url:'https://consumer.test/'})
Object.assign(globalThis,{window:dom.window,document:dom.window.document,Document:dom.window.Document,Node:dom.window.Node,Element:dom.window.Element,HTMLElement:dom.window.HTMLElement,Event:dom.window.Event,CustomEvent:dom.window.CustomEvent})
try {
  const framework=await import('tremplin')
  const components=JSON.parse('__COMPONENTS__')
  for(const component of components) {
    assert.equal(framework[component.className],(await import('tremplin/'+component.name)).default)
    assert.equal(framework[component.className],(await import('tremplin/js/dist/'+component.name+'.js')).default)
  }
  assert(import.meta.resolve('tremplin').endsWith('/node_modules/tremplin/js/dist/index.js'))
  const component=await import('tremplin/button')
  assert.equal(framework.Button,component.default)
  const button=component.default.getOrCreateInstance('#probe')
  assert.equal(framework.Button.getInstance('#probe'),button)
  button.toggle()
  assert.equal(document.querySelector('#probe').getAttribute('aria-pressed'),'true')
  button.dispose()
  assert.equal(component.default.getInstance('#probe'),null)
  const css=import.meta.resolve('tremplin/css')
  const sass=import.meta.resolve('tremplin/scss')
  assert(css.endsWith('/node_modules/tremplin/dist/css/tremplin.css'))
  assert(sass.endsWith('/node_modules/tremplin/src/scss/tremplin.scss'))
  console.log(JSON.stringify({plugins:Object.keys(framework).length,componentsChecked:components.length,version:framework.Button.VERSION,canonicalPaths:true,rootEntry:'js/dist/index.js',sharedIdentity:true,sharedInstanceCache:true,toggleAndDispose:true,cssExport:true,sassExport:true}))
} finally {dom.window.close()}
