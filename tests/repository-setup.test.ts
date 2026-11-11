import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

const read = (file: string) => readFileSync(file, 'utf8')

describe('repository setup', () => {
  it('uses build tooling while retaining the chosen JavaScript and Sass roots', () => {
    expect(existsSync('build/lib')).toBe(true)
    expect(existsSync('scripts')).toBe(false)
    expect(existsSync('src/js/index.ts')).toBe(true)
    expect(existsSync('src/scss/tremplin.scss')).toBe(true)
    const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string>; sass: string }
    expect(pkg.sass).toBe('src/scss/tremplin.scss')
    for (const command of Object.values(pkg.scripts)) expect(command).not.toContain('scripts/')
    expect(pkg.scripts.clean).toBe('node tests/tooling/clean-distribution.mjs')
  })

  it('includes repository setup and relocated preview assets without shipping them in the package', () => {
    expect(read('.nvmrc').trim()).toBe('24')
    expect(read('.editorconfig')).toContain('end_of_line = lf')
    for (const file of ['.github/ISSUE_TEMPLATE/bug_report.yml','.github/ISSUE_TEMPLATE/feature_request.yml','.github/assets/docs-button-preview.png','.github/assets/docs-install-preview.png']) expect(existsSync(file),file).toBe(true)
    expect(existsSync('docs-button-preview.png')).toBe(false)
    expect(existsSync('docs-install-preview.png')).toBe(false)
    const pkg = JSON.parse(read('package.json')) as { files: string[] }
    expect(pkg.files).not.toContain('.github')
  })

  it('builds generated assets before type-checking consumers on a clean checkout', () => {
    const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string> }
    const steps = pkg.scripts.check!.split(' && ')
    const build = steps.indexOf('npm run build')
    const tests = steps.indexOf('npm run test:typecheck-boundaries')
    expect(build).toBeGreaterThanOrEqual(0)
    expect(tests).toBeGreaterThan(build)
    expect(pkg.scripts.build).toContain('npm run build:manifest')
    expect(pkg.scripts['test:typecheck-boundaries']).toContain('npm run typecheck:tests')
  })

  it('identifies the confirmed repository without changing the release block', () => {
    const pkg = JSON.parse(read('package.json')) as {
      repository: { url: string }
      tremplinMigration: { releaseBlocked: boolean }
    }
    expect(pkg.repository.url).toBe('https://github.com/DevCiel/tremplin.git')
    expect(pkg.tremplinMigration.releaseBlocked).toBe(true)
  })

  it('prepares generated documentation assets before unit scope checks', () => {
    const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string> }
    const steps = pkg.scripts.check!.split(' && ')
    const prepare = steps.indexOf('npm run site:prepare')
    expect(prepare).toBeGreaterThan(steps.indexOf('npm run build'))
    expect(steps.indexOf('npm test')).toBeGreaterThan(prepare)
  })

  it.each(['release', 'docs'])('keeps %s manual-only', name => {
    const workflow = read(`.github/workflows/${name}.yml`).replaceAll('\r', '')
    const triggers = workflow.split('\non:\n')[1]?.split('\npermissions:')[0]?.trim()
    expect(triggers).toBe('workflow_dispatch:')
  })

  it('retains CI for pushes and pull requests', () => {
    const workflow = read('.github/workflows/ci.yml')
    expect(workflow).toMatch(/\n  push:/)
    expect(workflow).toMatch(/\n  pull_request:/)
    expect(workflow).toContain('npm run check')
  })

  it('retains failed browser diagnostics without masking the quality gate', () => {
    const workflow = read('.github/workflows/ci.yml').replaceAll('\r', '')
    const diagnostics = workflow.split('      - name: Upload test failure diagnostics\n')[1]
    expect(diagnostics).toBeDefined()
    expect(diagnostics).toContain('if: failure()')
    expect(diagnostics).toContain('uses: actions/upload-artifact@v4')
    expect(diagnostics).toContain('test-results')
    expect(diagnostics).toContain('playwright-report')
    expect(diagnostics).toContain('retention-days: 7')
    expect(workflow).not.toContain('continue-on-error')
  })

  it('isolates CI browser workers without changing local execution or browser checks', () => {
    const inspect = (ci: boolean) => {
      const env = { ...process.env }
      if (ci) env.CI = '1'
      else delete env.CI
      const script = "import config from './playwright.config.ts'; process.stdout.write(JSON.stringify({ workers: config.workers, timeout: config.timeout, fullyParallel: config.fullyParallel, use: config.use, projects: config.projects }));"
      return JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', script], { encoding: 'utf8', env }))
    }
    const local = inspect(false), ci = inspect(true)
    expect(ci.workers).toBe(1)
    expect(local.workers).toBe(process.platform === 'win32' ? 2 : undefined)
    expect(ci.timeout).toBe(30_000)
    expect(ci.timeout).toBe(local.timeout)
    expect(ci.fullyParallel).toBe(local.fullyParallel)
    expect(ci.use).toEqual(local.use)
    expect(ci.projects).toEqual(local.projects)
    expect(ci.projects.map((project: { name: string }) => project.name)).toEqual(['chromium', 'firefox', 'webkit'])
  })
})
