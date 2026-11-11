import { afterEach, describe, expect, it, vi } from 'vitest'
import { lockScroll, unlockScroll } from '../src/js/util/scroll-lock'

const created:HTMLDialogElement[]=[]
const owner=()=>{const dialog=document.createElement('dialog');document.body.append(dialog);dialog.open=true;created.push(dialog);return dialog}
afterEach(()=>{
  for(const dialog of created){dialog.open=false;unlockScroll(dialog);dialog.remove()}
  created.length=0
  vi.restoreAllMocks()
  document.documentElement.classList.remove('dialog-open')
  document.documentElement.removeAttribute('style')
  document.body.innerHTML=''
})

describe('reviewed upstream reference-counted scroll lock',()=>{
  it('retains the lock until the final modal owner is released',()=>{
    const first=owner(),second=owner()
    lockScroll(first);lockScroll(second);unlockScroll(first)
    expect(document.documentElement.classList.contains('dialog-open')).toBe(true)
    unlockScroll(second)
    expect(document.documentElement.classList.contains('dialog-open')).toBe(false)
  })

  it.each(['closed','removed'])('reclaims a %s owner without unlocking a newer dialog',state=>{
    const first=owner();lockScroll(first)
    if(state==='closed')first.open=false;else first.remove()
    const second=owner();lockScroll(second);unlockScroll(first)
    expect(document.documentElement.classList.contains('dialog-open')).toBe(true)
    unlockScroll(second)
    expect(document.documentElement.classList.contains('dialog-open')).toBe(false)
  })

  it('preserves an application-owned pre-existing lock',()=>{
    document.documentElement.classList.add('dialog-open')
    const dialog=owner();lockScroll(dialog);unlockScroll(dialog)
    expect(document.documentElement.classList.contains('dialog-open')).toBe(true)
  })

  it.each(['left','right'] as const)('compensates measured %s expansion and restores inline priorities',side=>{
    const root=document.documentElement,dialog=owner(),fixed=document.createElement('div')
    fixed.className='fixed-top';fixed.style.position='fixed';document.body.append(fixed)
    root.style.setProperty('padding-'+side,'5px')
    fixed.style.setProperty('margin-'+side,'3px','important')
    vi.spyOn(root,'offsetWidth','get').mockImplementation(()=>root.classList.contains('dialog-open')?1000:980)
    vi.spyOn(root,'clientWidth','get').mockReturnValue(980)
    vi.spyOn(root,'getBoundingClientRect').mockImplementation(()=>new DOMRect(side==='left'&&!root.classList.contains('dialog-open')?20:0,0,1000,800))
    vi.spyOn(fixed,'clientWidth','get').mockReturnValue(980)
    vi.spyOn(fixed,'offsetWidth','get').mockImplementation(()=>root.classList.contains('dialog-open')?1000:980)
    lockScroll(dialog)
    expect(root.style.getPropertyValue('padding-'+side)).toBe('25px')
    expect(root.style.getPropertyPriority('padding-'+side)).toBe('important')
    expect(fixed.style.getPropertyValue('margin-'+side)).toBe('23px')
    unlockScroll(dialog)
    expect(root.style.getPropertyValue('padding-'+side)).toBe('5px')
    expect(root.style.getPropertyPriority('padding-'+side)).toBe('')
    expect(fixed.style.getPropertyValue('margin-'+side)).toBe('3px')
    expect(fixed.style.getPropertyPriority('margin-'+side)).toBe('important')
  })
})
