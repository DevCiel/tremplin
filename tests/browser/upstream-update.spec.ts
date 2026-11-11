import { expect, test, type Page } from '@playwright/test'

async function fixture(page:Page,body:string,dir='ltr'){
  await page.route('**/upstream-update/',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><html lang="en" dir="${dir}"><head><meta charset="utf-8"><title>Reviewed upstream update</title><link rel="stylesheet" href="/dist/css/tremplin.css"><script type="module" src="/tests/browser/runtime.mjs"></script></head><body>${body}</body></html>`}))
  await page.goto('/upstream-update/')
  await page.waitForFunction(()=>Boolean((window as any).TremplinFramework?.Dialog))
}

test('native dialog close, reopened close events and self-target triggers preserve correct scroll ownership',async({page})=>{
  await fixture(page,'<button id="open" data-trm-toggle="dialog" data-trm-target="#dialog">Open</button><dialog id="dialog" class="dialog dialog-instant" aria-labelledby="title"><h2 id="title">Details</h2><button id="same" data-trm-toggle="dialog" data-trm-target="#dialog">Same dialog</button><form method="dialog"><button id="native">Native close</button></form></dialog>')
  await page.locator('#open').click()
  await page.locator('#same').click()
  await expect(page.locator('#dialog')).toHaveAttribute('open')
  await expect(page.locator('html')).toHaveClass(/dialog-open/)
  await page.locator('#native').click()
  await expect(page.locator('#dialog')).not.toHaveAttribute('open')
  await expect(page.locator('html')).not.toHaveClass(/dialog-open/)
  await page.evaluate(async()=>{
    const api=(window as any).TremplinFramework,element=document.querySelector<HTMLDialogElement>('#dialog')!
    await api.Dialog.getInstance(element).show()
    element.close()
    await api.Dialog.getInstance(element).show()
    await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())))
  })
  await expect(page.locator('#dialog')).toHaveAttribute('open')
  await expect(page.locator('html')).toHaveClass(/dialog-open/)
  await page.evaluate(async()=>{await (window as any).TremplinFramework.Dialog.getInstance('#dialog').hide()})
  await expect(page.locator('html')).not.toHaveClass(/dialog-open/)
})

for(const dir of ['ltr','rtl'])test(`${dir}: measured scrollbar compensation keeps normal and full-width fixed content stable`,async({page})=>{
  await fixture(page,'<div id="fixed" class="fixed-top" style="height:40px">Fixed header</div><main id="content" style="max-width:500px;margin-inline:auto;min-height:200vh">Content</main><dialog id="dialog" class="dialog dialog-instant" aria-labelledby="title"><h2 id="title">Details</h2></dialog>',dir)
  const positions=()=>page.evaluate(()=>Object.fromEntries(['fixed','content'].map(id=>{const r=document.getElementById(id)!.getBoundingClientRect();return[id,{left:r.left,right:r.right,width:r.width}]})))
  const before=await positions()
  await page.evaluate(async()=>{await (window as any).TremplinFramework.Dialog.getOrCreateInstance('#dialog').show()})
  const open=await positions()
  for(const id of ['fixed','content'])for(const key of ['left','right','width'])expect(open[id]![key as 'left']).toBeCloseTo(before[id]![key as 'left'],1)
  await page.evaluate(async()=>{await (window as any).TremplinFramework.Dialog.getInstance('#dialog').hide()})
  const closed=await positions()
  for(const id of ['fixed','content'])for(const key of ['left','right','width'])expect(closed[id]![key as 'left']).toBeCloseTo(before[id]![key as 'left'],1)
})

test('Tooltip and Popover retain literal null and boolean-looking data values',async({page})=>{
  await fixture(page,'<button id="tip" data-trm-title="null">Tip</button><button id="popover" data-trm-title="true" data-trm-content="false">Popover</button>')
  await page.evaluate(async()=>{await new (window as any).TremplinFramework.Tooltip('#tip',{trigger:'manual',animation:false}).show()})
  await expect(page.locator('.tooltip-inner')).toHaveText('null')
  await page.evaluate(async()=>{
    const api=(window as any).TremplinFramework
    await api.Tooltip.getInstance('#tip').hide();api.Tooltip.getInstance('#tip').dispose()
    await new api.Popover('#popover',{trigger:'manual',animation:false}).show()
  })
  await expect(page.locator('.popover-header')).toHaveText('true')
  await expect(page.locator('.popover-body')).toHaveText('false')
})

test('NavOverflow does not reserve a More toggle when all original items fit',async({page})=>{
  await fixture(page,'<nav id="nav"><ul class="nav" id="items"><li class="nav-item"><a class="nav-link" href="#a">One</a></li><li class="nav-item"><a class="nav-link" href="#b">Two</a></li><li class="nav-item"><a class="nav-link" href="#c">Three</a></li></ul></nav>')
  await page.evaluate(async()=>{
    const nav=document.querySelector<HTMLElement>('#nav')!,items=document.querySelector<HTMLElement>('#items')!
    const gap=parseFloat(getComputedStyle(items).columnGap)||0
    const children=[...items.children] as HTMLElement[]
    nav.style.width=(children.reduce((sum,item)=>sum+item.offsetWidth,0)+gap*(children.length-1)+1)+'px'
    new (window as any).TremplinFramework.NavOverflow(nav,{collapseBelow:0})
    await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())))
  })
  await expect(page.locator('#nav .nav-overflow-toggle')).toBeHidden()
  for(const name of ['One','Two','Three'])await expect(page.locator('#items > .nav-item > .nav-link').filter({hasText:name})).toBeVisible()
})
