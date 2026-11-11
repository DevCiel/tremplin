// Local review captures only; never accepts or overwrites test expectations.
import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, relative } from 'node:path'

const output = resolve('test-results/entry-docs-review')
if (relative(resolve('.'), output).startsWith('..')) throw new Error('QA captures must stay in the checkout')
await mkdir(output, {recursive:true})
const browser = await chromium.launch()
const page = await browser.newPage({viewport:{width:1280,height:900},colorScheme:'light',reducedMotion:'reduce',locale:'en-US'})
const captures = []
const capture = async (name,target=page) => {const file=resolve(output,name+'.png');await target.screenshot({path:file,animations:'disabled'});captures.push(relative(resolve('.'),file).replaceAll('\\','/'))}
try {
  for(const [name,route] of [['homepage','/'],['installation-guide','/getting-started/install/']]) {
    for(const theme of ['light','dark','rtl']) {
      await page.goto('http://127.0.0.1:4177'+route)
      await page.locator('html').evaluate((el,state)=>{el.setAttribute('data-trm-theme',state==='dark'?'dark':'light');el.setAttribute('dir',state==='rtl'?'rtl':'ltr')},theme)
      await page.evaluate(()=>document.fonts.ready)
      await capture(name+(theme==='light'?'':'-'+theme),page.locator('main'))
    }
    await page.setViewportSize({width:390,height:844})
    await page.locator('html').evaluate(el=>{el.setAttribute('data-trm-theme','dark');el.setAttribute('dir','rtl')})
    await capture(name+'-mobile')
    const copy=page.locator('main .docs-copy').first();await copy.scrollIntoViewIfNeeded();await copy.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab')
    await capture(name+'-mobile-copy-focus')
    await page.setViewportSize({width:1280,height:900})
  }
  await page.goto('http://127.0.0.1:4177/getting-started/install/')
  // Isolated section crops must not include the sticky header crossing the crop.
  // Full-page/mobile captures above retain the real header unchanged.
  await page.locator('.docs-header').evaluate(el=>{el.style.visibility='hidden'})
  for(const index of [0,1,6,10,11]) await capture('installation-section-'+index,page.locator('.docs-section').nth(index))
} finally {await browser.close()}
await writeFile('artifacts/entry-docs-review-captures.json',JSON.stringify({date:'2026-11-08',captures},null,2)+'\n')
console.log(JSON.stringify({captures:captures.length,output}))
