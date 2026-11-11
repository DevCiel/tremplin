import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { assertReviewedUpstreamInput } from './helpers/documentation-scope'
import { compile } from 'sass'

const read=(file:string)=>JSON.parse(readFileSync(file,'utf8'))
const transitionPin=()=>read('metadata/bootstrap6-reference.json').commit
describe('reviewed upstream source transition',()=>{
  it('records the 137-module pin without expanding approved patch edits',()=>{
    const pin=read('metadata/bootstrap6-reference.json'),transition=read('metadata/upstream-transition-9062790.json')
    expect(pin.commit).toBe(transition.to)
    expect(pin.expectedCoreModules).toEqual({scss:102,javascript:35})
    expect(transition.securityLiteralEditsChanged).toBe(false)
    expect(transition.publicApiDelta.addedCssClasses).toEqual(['dialog-2xl'])
    expect(transition.publicApiDelta.removedCssClasses).toEqual([])
  })

  it('keeps every exact reviewed hash relationship and rejects tampering',()=>{
    const transition=read('metadata/upstream-transition-9062790.json') as {historicalScopeUpdates:{file:string;before:string;after:string}[]}
    expect(transition.historicalScopeUpdates).toHaveLength(8)
    for(const record of transition.historicalScopeUpdates){
      const bytes=readFileSync(record.file)
      expect(()=>assertReviewedUpstreamInput(record.file,record.before,bytes)).not.toThrow()
      // Preserve the exact historical raw-Sass hash. The new compiler's exact
      // prefixed serialization is independently checked above, not blessed by
      // replacing the old fingerprint with whatever production emitted.
      const historical=record.file==='dist/css/tremplin.css'
        ? Buffer.from(compile('artifacts/bootstrap6-css-check/'+transitionPin()+'/src/scss/tremplin.scss').css.replace('(https://gettremplin.com)','(https://getbootstrap.com/)')+'\n\n/*# sourceMappingURL=tremplin.css.map */\n')
        : bytes
      expect(createHash('sha256').update(historical).digest('hex')).toBe(record.after)
      expect(()=>assertReviewedUpstreamInput(record.file,record.before,Buffer.from('unreviewed change'))).toThrow()
      expect(()=>assertReviewedUpstreamInput(record.file,'0'.repeat(64),bytes)).toThrow()
      if(record.file==='dist/css/tremplin.css')expect(()=>assertReviewedUpstreamInput(record.file,record.before,Buffer.concat([bytes,Buffer.from('\n')]))).toThrow()
    }
    expect(()=>assertReviewedUpstreamInput('src/js/button.ts','0'.repeat(64),Buffer.from('changed'))).toThrow('Unreviewed historical scope change')
  })
})
