import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { sheetCommandExamples } from '../../site/src/data/sheet-command-docs'

type Controller={show(opener?:HTMLElement):Promise<void>;hide():Promise<void>;toggle():Promise<void>;dispose():void}
type Runtime={Drawer:{getOrCreateInstance(el:Element):Controller;getInstance(el:Element):Controller|null},CommandPalette:{getOrCreateInstance(el:Element):Controller;getInstance(el:Element):Controller|null}}
test.use({reducedMotion:'reduce'})
const errors=new WeakMap<Page,string[]>()
test.beforeEach(({page})=>{const list:string[]=[];errors.set(page,list);page.on('pageerror',e=>list.push(e.message))})
test.afterEach(({page})=>{expect(errors.get(page)).toEqual([])})
const audit=async(page:Page)=>expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze()).violations).toEqual([])
for(const topic of ['bottom-sheet','command-palette'])for(const theme of ['light','dark'])for(const dir of ['ltr','rtl'])test(`${topic} ${theme}/${dir}: desktop/mobile closed and open WCAG and layout`,async({page})=>{
  await page.goto('/components/'+topic+'/');await page.locator('html').evaluate((el,s)=>{el.setAttribute('data-trm-theme',s.theme);el.setAttribute('dir',s.dir)},{theme,dir})
  await expect(page.locator('head link[href*="tremplin-extensions"]')).toHaveCount(topic==='command-palette'?1:0)
  await expect(page.locator('script[src*="/js/tremplin"]')).toHaveCount(1)
  for(const width of [1280,390]){
    await page.setViewportSize({width,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await audit(page)
    const box=page.locator('.docs-example').first();await box.locator('button[data-trm-toggle]').click();const root=page.locator(topic==='bottom-sheet'?'#actions':'#commands')
    await expect(root).toBeVisible();await audit(page);expect(await root.evaluate(el=>el.getBoundingClientRect().width<=innerWidth)).toBe(true)
    await root.locator('[data-trm-dismiss]').first().click();await expect(root).not.toBeVisible()
  }
})
test('Drawer sheet has native modality, focus return, static rejection and body scrolling',async({page})=>{
  await page.goto('/components/bottom-sheet/');const opener=page.locator('[data-trm-target="#actions"]');await opener.click()
  await expect(page.locator('#actions')).toHaveJSProperty('open',true);expect(await page.locator('#actions').evaluate(el=>el.matches(':modal'))).toBe(true)
  await expect(page.locator('#actions .btn-close')).toBeFocused();await expect(page.locator('html')).toHaveClass(/dialog-open/)
  await page.keyboard.press('Escape');await expect(page.locator('#actions')).not.toBeVisible();await expect(opener).toBeFocused();await expect(page.locator('html')).not.toHaveClass(/dialog-open/)
  await page.locator('[data-trm-target="#sheet-scroll"]').click();const body=page.locator('#sheet-scroll .drawer-body');expect(await body.evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true)
  await body.evaluate(el=>el.scrollTop=el.scrollHeight);expect(await body.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);await page.keyboard.press('Escape')
  await page.locator('[data-trm-target="#sheet-static"]').click();await page.keyboard.press('Escape');await expect(page.locator('#sheet-static')).toBeVisible()
  await page.locator('#sheet-static .btn-close').click();await expect(page.locator('#sheet-static')).not.toBeVisible()
})
test('every authored sheet opens and dismisses without fake visibility overrides',async({page})=>{
  await page.goto('/components/bottom-sheet/')
  for(const trigger of await page.locator('.docs-example [data-trm-toggle="drawer"]').all()){
    const id=await trigger.getAttribute('data-trm-target');await trigger.click();const root=page.locator(id!);await expect(root).toBeVisible();await expect(root.locator('.btn-close')).toBeFocused();await root.locator('.btn-close').click();await expect(root).not.toBeVisible();await expect(trigger).toBeFocused()
  }
})
test('Drawer show/hide veto and disposal preserve native cleanup',async({page})=>{
  await page.goto('/components/bottom-sheet/')
  const state=await page.evaluate(async()=>{
    const el=document.querySelector<HTMLDialogElement>('#actions')!,api=(window as unknown as {TremplinFramework:Runtime}).TremplinFramework.Drawer,instance=api.getOrCreateInstance(el),stop=(e:Event)=>e.preventDefault()
    el.addEventListener('show.trm.drawer',stop);await instance.show();const blocked=!el.open;el.removeEventListener('show.trm.drawer',stop);await instance.show()
    el.addEventListener('hide.trm.drawer',stop);await instance.hide();const retained=el.open;instance.dispose();return{blocked,retained,closed:!el.open,locked:document.documentElement.classList.contains('dialog-open'),owner:api.getInstance(el)!==null}
  });expect(state).toEqual({blocked:true,retained:true,closed:true,locked:false,owner:false})
})
test('Palette filters groups, skips disabled commands and distinguishes disabled-only from empty',async({page})=>{
  await page.goto('/components/command-palette/');await page.locator('[data-trm-target="#palette-groups"]').click();const root=page.locator('#palette-groups'),search=root.locator('input')
  await expect(search).toBeFocused();await search.fill('manual');await expect(root.locator('.command-group:not([hidden])')).toHaveCount(1);await expect(root.locator('.command-item:not([hidden])')).toHaveCount(1)
  await search.press('Enter');await expect(root).toBeHidden();await expect(page.locator('#palette-groups-result')).toContainText('Help preview selected')
  await page.locator('[data-trm-target="#palette-disabled"]').click();const disabled=page.locator('#palette-disabled');await disabled.locator('input').fill('protected');await expect(disabled.locator('.command-item:not([hidden])')).toHaveAttribute('aria-disabled','true');await expect(disabled.locator('input')).not.toHaveAttribute('aria-activedescendant');await expect(disabled.locator('.command-palette-empty')).toBeHidden()
  await disabled.locator('input').fill('not found');await expect(disabled.locator('.command-palette-empty')).toBeVisible();await audit(page);await page.keyboard.press('Escape')
})
test('Palette keyboard, pointer selection, query persistence and explicit docs shortcut guard',async({page})=>{
  await page.goto('/components/command-palette/');const opener=page.locator('[data-trm-target="#commands"]');await opener.click();const root=page.locator('#commands'),input=root.locator('input')
  await input.press('End');await expect(root.locator('.command-item').last()).toHaveAttribute('aria-selected','true');await input.press('ArrowDown');await expect(root.locator('.command-item').first()).toHaveAttribute('aria-selected','true')
  await input.press('Tab');await expect(root.locator('.btn-close')).toBeFocused();await page.keyboard.press('Tab');await expect(input).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(root.locator('.btn-close')).toBeFocused()
  await input.fill('preferences');await input.press('Enter');await expect(root).toBeHidden();await expect(opener).toBeFocused();await expect(page.locator('#commands-result')).toContainText('No preferences were saved')
  await opener.click();await expect(input).toHaveValue('preferences');await input.fill('');await root.locator('.command-item').first().click();await expect(root).toBeHidden();await expect(page.locator('#commands-result')).toContainText('No project was changed')
  await opener.click();await page.keyboard.press('Control+k');await expect(root).toBeHidden();await expect(opener).toBeFocused();await expect(page.locator('[data-trm-command-palette]:not([hidden])')).toHaveCount(0)
})
test('Palette gates, detail payloads, keep-open and dispose bypassing a hide veto',async({page})=>{
  await page.goto('/components/command-palette/');await page.locator('[data-trm-target="#palette-persistent"]').click();const root=page.locator('#palette-persistent');await root.locator('input').press('Enter');await expect(root).toBeVisible();await expect(page.locator('#palette-persistent-result')).toContainText('Project preview selected')
  const result=await page.evaluate(async()=>{
    const el=document.querySelector<HTMLElement>('#palette-persistent')!,api=(window as unknown as {TremplinFramework:Runtime}).TremplinFramework.CommandPalette,instance=api.getOrCreateInstance(el),stop=(e:Event)=>e.preventDefault(),input=el.querySelector('input')!
    let selected=0;el.addEventListener('selected.trm.command-palette',()=>selected++);el.addEventListener('select.trm.command-palette',stop);input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));el.removeEventListener('select.trm.command-palette',stop)
    el.addEventListener('hide.trm.command-palette',stop);await instance.hide();const retained=!el.hidden;instance.dispose();instance.dispose();return{selected,retained,hidden:el.hidden,overflow:document.documentElement.style.overflow,owner:api.getInstance(el)!==null,role:el.getAttribute('role')}
  });expect(result).toEqual({selected:0,retained:true,hidden:true,overflow:'',owner:false,role:'dialog'})
})
test('every authored palette opens and dismisses with one runtime and local feedback',async({page})=>{
  await page.goto('/components/command-palette/')
  for(const trigger of await page.locator('.docs-example [data-trm-toggle="command-palette"]').all()){
    const id=await trigger.getAttribute('data-trm-target');await trigger.click();const root=page.locator(id!);await expect(root).toBeVisible();await expect(root.locator('input')).toBeFocused();await audit(page);await root.locator('.btn-close').click();await expect(root).toBeHidden();await expect(trigger).toBeFocused()
  }
})
test('single isolated extension default shortcut, backdrop and no native modality',async({page})=>{
  const markup=sheetCommandExamples['command-palette'].replace('data-trm-shortcut="false"','')
  await page.route('**/palette-fixture',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Palette fixture</title><link rel="stylesheet" href="/dist/css/tremplin.min.css"><link rel="stylesheet" href="/dist/css/tremplin-extensions.min.css"></head><body><main><h1>Commands</h1>${markup}</main><script type="module" src="/js/tremplin-command-palette.min.js"></script></body></html>`}))
  await page.goto('/palette-fixture');await page.locator('[data-trm-target="#commands"]').focus();await page.keyboard.press('Control+k');const root=page.locator('#commands');await expect(root).toBeVisible()
  expect(await root.evaluate(el=>el.matches(':modal'))).toBe(false);await expect(root).toHaveAttribute('aria-modal','true');await page.keyboard.press('Meta+k');await expect(root).toBeHidden()
  await page.keyboard.press('Control+k');await root.click({position:{x:5,y:5}});await expect(root).toBeHidden()
})
test('Palette API names the optional import, actual defaults and CustomEvent payloads',async({page})=>{
  await page.goto('/api/command-palette/');await expect(page.locator('main')).toContainText("from 'tremplin/extensions/command-palette'");await expect(page.locator('main')).toContainText('CustomEvent.detail');await expect(page.getByRole('region',{name:'Source-verified option defaults'})).toContainText('closeOnSelect');await audit(page)
})
