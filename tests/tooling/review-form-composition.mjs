// Local QA captures only; does not publish or accept screenshot expectations.
import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, relative } from 'node:path'

const output = resolve('test-results/form-composition-review')
if (relative(resolve('.'),output).startsWith('..')) throw new Error('QA output must stay in the checkout')
await mkdir(output,{recursive:true})
const browser = await chromium.launch()
const context = await browser.newContext({viewport:{width:1280,height:900},locale:'en-US',colorScheme:'light',reducedMotion:'reduce'})
const page = await context.newPage(), captures = []
const capture = async (name,target=page) => {
  const file=resolve(output,name+'.png')
  await target.screenshot({path:file,animations:'disabled'})
  captures.push(relative(resolve('.'),file).replaceAll('\\','/'))
}
const targets = {'input-group':'#composition-menu-start','floating-labels':'#forms-floating-email','form-adorn':'#forms-adorn-site',layout:'#forms-layout-first',validation:'#forms-validation-email'}
try {
  for (const topic of Object.keys(targets)) {
    for (const theme of ['light','dark','rtl']) {
      await page.goto('http://127.0.0.1:4177/forms/'+topic+'/')
      await page.locator('html').evaluate((el,state)=>{el.setAttribute('dir',state==='rtl'?'rtl':'ltr');el.setAttribute('data-trm-theme',state==='dark'?'dark':'light')},theme)
      await page.evaluate(()=>document.fonts.ready)
      await capture('composition-'+topic+'-'+theme,page.locator('main'))
    }
    await page.goto('http://127.0.0.1:4177/forms/'+topic+'/')
    const examples=await page.locator('.docs-example').all()
    for(let i=0;i<examples.length;i++)await capture(topic+'-example-'+(i+1),examples[i])
    await page.setViewportSize({width:390,height:844})
    await page.locator('html').evaluate(el=>{el.setAttribute('dir','rtl');el.setAttribute('data-trm-theme','dark')})
    await examples[0].scrollIntoViewIfNeeded();await capture(topic+'-mobile')
    const target=page.locator(targets[topic]);await target.scrollIntoViewIfNeeded();await target.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');await capture(topic+'-mobile-focus')
    if(topic==='input-group') {await page.locator('#composition-menu-start').click();await capture('input-group-mobile-menu');await page.keyboard.press('Escape')}
    if(topic==='validation') {await page.locator('#forms-validation-demo').getByRole('button',{name:'Check details',exact:true}).click();await capture('validation-mobile-error')}
    await page.setViewportSize({width:1280,height:900})
  }
} finally { await browser.close() }
await writeFile('artifacts/form-composition-review-captures.json',JSON.stringify({date:'2026-11-08',captures},null,2)+'\n')
console.log(JSON.stringify({captures:captures.length,output}))
