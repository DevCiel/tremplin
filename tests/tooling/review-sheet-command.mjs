// Local QA artifacts only. Does not publish, edit core, or accept expectations.
import { chromium } from '@playwright/test'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve, relative } from 'node:path'

const output=resolve('test-results/sheet-command-review'),before=JSON.parse(await readFile('artifacts/sheet-command-before.json','utf8'))
if(relative(resolve('.'),output).startsWith('..'))throw new Error('QA output must stay in this checkout')
await mkdir(output,{recursive:true});await mkdir(resolve('test-results/sheet-command-visual-before'),{recursive:true})
for(const name of ['bottom-sheet-guide.png','bottom-sheet-guide-rtl.png','command-palette-guide.png','command-palette-guide-dark.png']){
  const file='tests/site-visual/snapshots/'+name,bytes=await readFile(file)
  if(createHash('sha256').update(bytes).digest('hex')!==before.snapshots[file])throw new Error('Original expectation already changed: '+name)
  await copyFile(file,resolve('test-results/sheet-command-visual-before',name))
}
const browser=await chromium.launch(),context=await browser.newContext({viewport:{width:1280,height:900},locale:'en-US',colorScheme:'light',reducedMotion:'reduce'}),page=await context.newPage(),captures=[]
const capture=async(name,target=page)=>{const file=resolve(output,name+'.png');await target.screenshot({path:file,animations:'disabled'});captures.push(relative(resolve('.'),file).replaceAll('\\','/'))}
try{
  for(const topic of ['bottom-sheet','command-palette']){
    for(const state of ['light','dark','rtl']){
      await page.goto('http://127.0.0.1:4177/components/'+topic+'/');await page.evaluate(({state})=>{document.documentElement.setAttribute('dir',state==='rtl'?'rtl':'ltr');document.documentElement.setAttribute('data-trm-theme',state==='dark'?'dark':'light')},{state});await page.evaluate(()=>document.fonts.ready)
      await capture(topic+'-guide'+(state==='light'?'':'-'+state),page.locator('main'))
    }
    await page.goto('http://127.0.0.1:4177/components/'+topic+'/')
    const triggers=await page.locator('.docs-example button[data-trm-toggle]').all()
    for(let i=0;i<triggers.length;i++){
      const trigger=triggers[i],selector=await trigger.getAttribute('data-trm-target');await trigger.click();const root=page.locator(selector)
      await root.waitFor({state:'visible'});await capture(topic+'-open-'+(i+1));await root.locator('[data-trm-dismiss]').first().click();await root.waitFor({state:'hidden'})
    }
    await page.setViewportSize({width:390,height:844});await page.locator('html').evaluate(el=>{el.setAttribute('dir','rtl');el.setAttribute('data-trm-theme','dark')})
    await capture(topic+'-mobile',page.locator('main'));await triggers[0].click();await capture(topic+'-mobile-open');await page.locator(topic==='bottom-sheet'?'#actions .btn-close':'#commands .btn-close').click();await page.setViewportSize({width:1280,height:900})
  }
  await page.goto('http://127.0.0.1:4177/api/command-palette/');await capture('command-palette-api',page.locator('main'))
}finally{await browser.close()}
await writeFile('artifacts/sheet-command-review-captures.json',JSON.stringify({date:'2026-11-08',captures},null,2)+'\n')
console.log(JSON.stringify({captures:captures.length,output}))
