// Local QA capture helper; never publishes or accepts screenshot expectations.
import { chromium } from '@playwright/test'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve, relative } from 'node:path'

const output=resolve('test-results/forms-overview-review'),before=JSON.parse(await readFile('artifacts/forms-overview-before.json','utf8'))
if(relative(resolve('.'),output).startsWith('..'))throw new Error('QA output must stay in this checkout')
await mkdir(output,{recursive:true});await mkdir(resolve('test-results/forms-overview-visual-before'),{recursive:true})
const old='tests/site-visual/snapshots/forms-guide.png'
if(createHash('sha256').update(await readFile(old)).digest('hex')!==before.snapshots[old])throw new Error('Original Forms expectation already changed')
await copyFile(old,resolve('test-results/forms-overview-visual-before/forms-guide.png'))
const browser=await chromium.launch(),context=await browser.newContext({viewport:{width:1280,height:900},locale:'en-US',colorScheme:'light',reducedMotion:'reduce'}),page=await context.newPage(),captures=[]
const capture=async(name,target=page)=>{const file=resolve(output,name+'.png');await target.screenshot({path:file,animations:'disabled'});captures.push(relative(resolve('.'),file).replaceAll('\\','/'))}
try{
  for(const item of [{route:'/components/forms/',name:'forms-guide',validation:'forms-validation'},{route:'/forms/overview/',name:'forms-overview',validation:'forms-overview-validation'}]){
    for(const theme of ['light','dark','rtl']){
      await page.goto('http://127.0.0.1:4177'+item.route);await page.locator('html').evaluate((el,s)=>{el.setAttribute('dir',s==='rtl'?'rtl':'ltr');el.setAttribute('data-trm-theme',s==='dark'?'dark':'light')},theme);await page.evaluate(()=>document.fonts.ready)
      await capture(item.name+(item.name==='forms-guide'&&theme==='light'?'':'-'+theme),page.locator('main'))
    }
    await page.goto('http://127.0.0.1:4177'+item.route)
    const examples=await page.locator('.docs-example').all()
    for(let i=0;i<examples.length;i++)await capture(item.name+'-example-'+(i+1),examples[i])
    const form=page.locator('#'+item.validation);await form.locator('[type="submit"]').click();await capture(item.name+'-validation-errors',form);await form.getByRole('button',{name:'Reset validation'}).click()
    await page.setViewportSize({width:390,height:844});await page.locator('html').evaluate(el=>{el.setAttribute('dir','rtl');el.setAttribute('data-trm-theme','dark')})
    await page.locator('.docs-example').first().scrollIntoViewIfNeeded();await capture(item.name+'-mobile')
    await form.locator('[type="submit"]').click();await capture(item.name+'-mobile-errors');await form.getByRole('button',{name:'Reset validation'}).click()
    await page.setViewportSize({width:1280,height:900})
  }
}finally{await browser.close()}
await writeFile('artifacts/forms-overview-review-captures.json',JSON.stringify({date:'2026-11-08',captures},null,2)+'\n')
console.log(JSON.stringify({captures:captures.length,output}))
