import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { relocateToolPaths, restoreToolPaths, toolMoves } from './tooling/lib/tool-paths.mjs'
import { assertDocumentationPackage, assertDocumentationVisualConfig } from './helpers/documentation-scope'
import {currentToolPath} from './tooling/lib/tremplin-tooling.mjs'

const read=(file:string)=>JSON.parse(readFileSync(file,'utf8'))
const walk=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(dir+'/'+entry.name):[dir+'/'+entry.name]).sort()
const text=(file:string)=>readFileSync(file,'utf8')

describe('production-build and project-QA separation',()=>{
  it('moves every reviewed tool once without leaving wrappers at old paths',()=>{
    expect(Object.keys(toolMoves)).toHaveLength(47)
    expect(Object.values(toolMoves).filter(file=>file.startsWith('tests/tooling/'))).toHaveLength(45)
    for(const [from,to]of Object.entries(toolMoves)){expect(existsSync(from),from).toBe(false);expect(existsSync(currentToolPath(to)),to).toBe(true)}
    const maintenance=read('metadata/core-maintenance-tools.json').buildFiles.map((entry:{path:string})=>entry.path)
    const stages=read('metadata/npm-build-stages.json')
    expect(walk('build')).toHaveLength(21+maintenance.length+stages.restoredBuildTools.length-stages.retiredTools.length-Object.keys(stages.moves).length)
    expect(walk('build').filter(file=>/\/(?:audit-|check-|test-|review-|report-|serve)/.test(file))).toEqual(['build/check-unused-imports.mjs'])
    for(const file of ['build/rolldown.config.mjs','build/generate-sri.mjs','build/copy-site.mjs','build/build-plugins.mjs'])expect(existsSync(file)).toBe(true)
  })

  it('rewrites and reverses only the declared command paths',()=>{
    const source='node build/integrity.mjs && node build/check-core-output.mjs --check'
    expect(relocateToolPaths(source)).toBe('node build/generate-sri.mjs && node tests/tooling/check-core-output.mjs --check')
    expect(restoreToolPaths(relocateToolPaths(source))).toBe(source)
    expect(relocateToolPaths('node build/compile-core.mjs --css')).toBe('node build/compile-core.mjs --css')
    const initial=text('tests/fixtures/documentation-scope/package.initial.json').replaceAll('\r\n','\n')
    const hash=createHash('sha256').update(initial).digest('hex')
    expect(()=>assertDocumentationPackage(text('package.json'),hash)).not.toThrow()
    const pkg=read('package.json');pkg.scripts['test:browser']+=' --ignore-failures'
    expect(()=>assertDocumentationPackage(JSON.stringify(pkg),hash)).toThrow()
  })

  it('runs relocated guards without mutating protected source, outputs, fixtures or snapshots',()=>{
    const files=[...walk('src'),...walk('dist'),...walk('js/dist'),...walk('tests/fixtures/documentation-scope'),...walk('tests/site-visual/snapshots'),'metadata/api.json','metadata/public-api.json','metadata/strict-api-baseline.json','metadata/bootstrap6-security-patches.json','package-lock.json','tsconfig.core.json']
    const hash=(file:string)=>createHash('sha256').update(readFileSync(file)).digest('hex')
    const before=files.map(hash)
    execFileSync(process.execPath,['tests/tooling/audit-tremplin-core.mjs','--check'],{encoding:'utf8'})
    expect(files.map(hash)).toEqual(before)
  })

  it('changes only the Playwright server path while retaining baseline/tolerance settings',()=>{
    const source=text('playwright.docs-visual.config.ts')
    const hash='c3b76624908d33c2a6dd0f9e0e4ae580cc3cb9e72c4236e8b4f41917a8f30d83'
    expect(()=>assertDocumentationVisualConfig(source,hash)).not.toThrow()
    expect(()=>assertDocumentationVisualConfig(source.replace('reuseExistingServer: false','reuseExistingServer: true'),hash)).toThrow()
  })

  it('retains source/API and output guards at their real relocated entry points',()=>{
    expect(execFileSync(process.execPath,['tests/tooling/check-core-output.mjs'],{encoding:'utf8'})).toContain('Core output inventory passed')
    expect(read('metadata/strict-migration-report.json').releaseReady).toBe(false)
    expect(read('package.json').tremplinMigration.releaseBlocked).toBe(true)
    expect(text('build/generate-sri.mjs')).not.toContain('tests/tooling/lib/core-package-scope')
    expect(read('metadata/build-tooling-relocation.json').unimplementedUpstreamMaintenance).toHaveLength(7)
  })
})
