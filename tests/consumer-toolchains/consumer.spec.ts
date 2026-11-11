import {expect,test} from '@playwright/test'
import {readFileSync} from 'node:fs'
const cases=['vite-css','vite-sass','webpack-css','webpack-sass','parcel-css','rollup-js','starter-vite','starter-react','starter-vue','starter-html']
const metadata=JSON.parse(readFileSync('metadata/api.json','utf8')) as {components:{name:string;className:string}[]}
const names=metadata.components.filter(item=>item.name!=='command-palette').map(item=>item.className).sort()
type ConsumerQA={version:string;exports:string[];sameClass:boolean;sameInstance:boolean;dispose:()=>boolean}
for(const [index,name]of cases.entries())test(name+': installed consumer styles, assets and real interactions',async({page,request})=>{
  const errors:string[]=[],badResponses:string[]=[]
  page.on('pageerror',error=>errors.push(error.message))
  page.on('response',response=>{if(response.status()>=400&&!response.url().endsWith('/favicon.ico'))badResponses.push(response.url()+' '+response.status())})
  const origin='http://127.0.0.1:'+(4180+index)
  await page.goto(origin+'/')
  await expect(page.locator('h1')).toBeVisible()
  const button=page.locator('button.btn-solid').first()
  await expect(button).toBeVisible()
  expect(await button.evaluate(element=>parseFloat(getComputedStyle(element).minHeight))).toBeGreaterThan(30)
  expect(await page.evaluate(()=>Object.hasOwn(window,'TremplinFramework'))).toBe(false)
  if(!name.startsWith('starter-')){
    await expect(page.locator('html')).toHaveAttribute('data-consumer-ready','true')
    const state=await page.evaluate(()=>{const qa=(window as unknown as {ConsumerQA:ConsumerQA}).ConsumerQA;return {version:qa.version,exports:qa.exports,sameClass:qa.sameClass,sameInstance:qa.sameInstance}})
    expect(state).toEqual({version:'0.8.0-beta.0',exports:names,sameClass:true,sameInstance:true})
    await expect(page.locator('#spacing-probe')).toHaveCSS('padding-top',name.endsWith('sass')||name==='rollup-js'?'32px':'16px')
    await button.click();await expect(button).toHaveAttribute('aria-expanded','true');await expect(page.locator('#details')).toBeVisible()
    await button.click();await expect(button).toHaveAttribute('aria-expanded','false');await expect(page.locator('#details')).toBeHidden()
    await page.locator('#date').click()
    const calendar=page.locator('[data-vc="calendar"][data-vc-input]')
    await expect(calendar).toBeVisible()
    const mask=await calendar.locator('[data-vc-arrow="next"]').evaluate(element=>getComputedStyle(element,'::before').maskImage)
    const url=mask.match(/url\(["']?([^"')]+)["']?\)/)?.[1]
    expect(url,'Calendar arrows must use a real, same-origin emitted SVG').toBeTruthy()
    expect(new URL(url!).origin).toBe(origin)
    const asset=await request.get(url!);expect(asset.status()).toBe(200);expect(await asset.text()).toContain('viewBox="0 0 24 24"')
    await page.keyboard.press('Escape')
    expect(await page.evaluate(()=>(window as unknown as {ConsumerQA:ConsumerQA}).ConsumerQA.dispose())).toBe(true)
  }else if(name==='starter-vite'){
    // A consumer-authored dynamic target verifies that the real starter imported
    // the data APIs; no framework implementation or test runtime is injected.
    await page.evaluate(()=>{const node=document.createElement('button');node.id='dynamic-control';node.type='button';node.textContent='Dynamic control';node.setAttribute('data-trm-toggle','button');node.setAttribute('aria-pressed','false');document.querySelector('main')!.append(node)})
    await page.locator('#dynamic-control').click();await expect(page.locator('#dynamic-control')).toHaveAttribute('aria-pressed','true')
  }else{
    const target=page.locator(name==='starter-html'?'#welcome':'#details')
    await expect(target).toBeHidden();await button.click();await expect(target).toBeVisible();await button.click();await expect(target).toBeHidden()
    await expect(button).toHaveAttribute('aria-controls',name==='starter-html'?'welcome':'details')
    await expect(button).toHaveAttribute('aria-expanded','false')
  }
  expect(errors).toEqual([]);expect(badResponses).toEqual([])
})
