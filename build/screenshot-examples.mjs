#!/usr/bin/env node
/**
 * Light/dark example thumbnails at 1x and 2x, adapted from Bootstrap.
 * The Bootstrap Authors; MIT, see licenses/third-party-code.txt.
 * Uses a validated catalog and ephemeral loopback server instead of a fixed
 * Astro dev port. Private output never overwrites visual acceptance baselines.
 */
import assert from 'node:assert/strict'
import {lstat,writeFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {chromium} from '@playwright/test'
import sharp from 'sharp'
import {exampleArguments,exampleOutput,loadExamples,projectRoot,startExampleServer} from '../site/build/examples.mjs'
export async function screenshotExamples(root=projectRoot,options={only:null,dryRun:false}){
  const catalog=await loadExamples(root,options.only)
  if(options.dryRun)return {mode:'dry-run',examples:catalog.selected.map(e=>e.slug),images:catalog.selected.length*4}
  const output=await exampleOutput(root,'screenshots'),server=await startExampleServer(root,[...catalog.assets,...catalog.selected.map(e=>e.file)]),files=[]
  let browser
  try{
    browser=await chromium.launch()
    for(const e of catalog.selected){
      const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1})
      await page.route('**/*',route=>new URL(route.request().url()).origin===server.url?route.continue():route.abort())
      await page.goto(server.url+'/'+e.file,{waitUntil:'networkidle'})
      await page.evaluate(()=>document.fonts.ready)
      for(const theme of ['light','dark']){
        await page.emulateMedia({colorScheme:theme,reducedMotion:'reduce'})
        await page.evaluate(value=>document.documentElement.setAttribute('data-trm-theme',value),theme)
        const png=await page.screenshot({type:'png',animations:'disabled'})
        for(const scale of [1,2]){
          const name=e.slug+(theme==='dark'?'-dark':'')+(scale===2?'@2x':'')+'.png',target=path.join(output,name)
          const stat=await lstat(target).catch(error=>{if(error.code==='ENOENT')return null;throw error})
          assert(!stat||stat.isFile()&&!stat.isSymbolicLink(),'Unsafe thumbnail output')
          await writeFile(target,await sharp(png).resize(480*scale,300*scale,{fit:'cover',position:'top'}).toBuffer())
          files.push(path.relative(root,target).replaceAll('\\','/'))
        }
      }
      await page.close()
    }
  }finally{try{await browser?.close()}finally{await server.close()}}
  return {mode:'screenshots',files}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(await screenshotExamples(projectRoot,exampleArguments(process.argv.slice(2))),null,2))
