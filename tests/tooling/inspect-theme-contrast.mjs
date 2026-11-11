// Read-only browser diagnostics for the complete-site contrast finding.
import { chromium } from '@playwright/test'
const browser=await chromium.launch({channel:'chrome'})
try {
  const page=await browser.newPage()
  for(const route of ['/utilities/theme/','/utilities/background/','/getting-started/install/']) {
    await page.goto('http://127.0.0.1:4175'+route)
    await page.locator('html').evaluate(el=>el.setAttribute('data-trm-theme','dark'))
    for(const wait of [false,true]) {
      if(wait)await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))
      console.log(JSON.stringify({route,wait,...await page.evaluate(()=>Object.fromEntries(['html','body','.docs-sidebar .nav-link','.demo-contrast'].map(selector=>{const el=document.querySelector(selector);if(!el)return[selector,null];const css=getComputedStyle(el);return[selector,{color:css.color,background:css.backgroundColor,scheme:css.colorScheme,fg2:css.getPropertyValue('--trm-fg-2'),navColor:css.getPropertyValue('--trm-nav-link-color')}]})))}))
    }
    await page.waitForTimeout(300)
    console.log(JSON.stringify({route,settled:await page.locator('.docs-sidebar .nav-link').first().evaluate(el=>({color:getComputedStyle(el).color,animations:el.getAnimations().map(animation=>animation.playState)})),sidebarAnimations:await page.locator('#docs-sidebar').evaluate(el=>el.getAnimations({subtree:true}).map(animation=>({type:animation.constructor.name,iterations:animation.effect?.getComputedTiming().iterations,state:animation.playState})))}))
  }
} finally {await browser.close()}
