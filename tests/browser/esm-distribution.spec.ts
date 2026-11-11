import { expect, test } from '@playwright/test'

const imports = { '@floating-ui/dom': '/artifacts/documentation-assets/dist/vendor/floating-ui.js', 'vanilla-calendar-pro': '/artifacts/documentation-assets/dist/vendor/vanilla-calendar-pro.js' }
const plugins = ['Alert','Button','Carousel','Chips','Collapse','Combobox','Datepicker','Dialog','Drawer','Menu','NavOverflow','OtpInput','Popover','Range','ScrollSpy','Strength','Tab','Toast','Toggler','Tooltip'].sort()

for (const filename of ['tremplin.js','tremplin.min.js','tremplin.bundle.js','tremplin.bundle.min.js']) {
  test(`${filename}: native ESM exports, no global and declarative startup before DOMContentLoaded`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.route('**/esm-fixture', route => route.fulfill({ contentType:'text/html', body:`<!doctype html><html lang="en"><head><title>ESM distribution</title>
      <script type="importmap">${JSON.stringify({imports})}</script>
      <script type="module">import * as framework from '/dist/js/${filename}';
        document.documentElement.dataset.exports=JSON.stringify(Object.keys(framework).sort());
        document.documentElement.dataset.readyState=document.readyState;
        document.addEventListener('DOMContentLoaded',()=>document.documentElement.dataset.domReady='true',{once:true});
      </script></head><body><button id="toggle" data-trm-toggle="button" aria-pressed="false">Toggle</button></body></html>` }))
    await page.goto('/esm-fixture')
    await expect(page.locator('html')).toHaveAttribute('data-dom-ready','true')
    expect(JSON.parse((await page.locator('html').getAttribute('data-exports'))!)).toEqual(plugins)
    await expect(page.locator('html')).toHaveAttribute('data-ready-state','interactive')
    expect(await page.evaluate(()=>Object.hasOwn(window,'TremplinFramework'))).toBe(false)
    await page.getByRole('button',{name:'Toggle'}).click()
    await expect(page.locator('#toggle')).toHaveAttribute('aria-pressed','true')
    expect(errors).toEqual([])
  })
}

test('one canonical module graph shares root/component identities and instances', async ({ page }) => {
  await page.route('**/esm-identity',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><html lang="en"><head><title>ESM identities</title><script type="importmap">${JSON.stringify({imports})}</script></head><body><button id="target">Target</button></body></html>`}))
  await page.goto('/esm-identity')
  const result=await page.evaluate(async()=>{
    const url='/js/dist/index.js', root=await import(url), repeat=await import(url)
    const entries=['alert','button','carousel','chips','collapse','combobox','datepicker','dialog','drawer','menu','nav-overflow','otp-input','popover','range','scrollspy','strength','tab','toast','toggler','tooltip']
    const matching=[]
    for(const name of entries){const component=await import('/js/dist/'+name+'.js');matching.push(Object.values(root).includes(component.default))}
    const button=root.Button.getOrCreateInstance('#target')
    const buttonUrl='/js/dist/button.js', component=await import(buttonUrl)
    // Browser downloads are alternative graphs, as upstream documents; do not
    // invent a core guarantee that mixing independent builds must be rejected.
    return {same:root===repeat,matching,sharedInstance:button===component.default.getInstance('#target'),global:Object.hasOwn(window,'TremplinFramework')}
  })
  expect(result).toEqual({same:true,matching:Array(20).fill(true),sharedInstance:true,global:false})
})

test('retired root and component facades are absent rather than compatibility redirects', async ({ request }) => {
  for (const filename of ['tremplin.cjs', 'tremplin.d.ts', 'components/button.js', 'components/button.cjs']) {
    expect((await request.get('/dist/js/' + filename)).status()).toBe(404)
  }
  expect((await request.get('/js/dist/button.js')).ok()).toBe(true)
})
