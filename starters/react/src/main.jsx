import React from 'react'
import { createRoot } from 'react-dom/client'
import 'tremplin/css'
import { Collapse } from 'tremplin'
import { useTremplin } from 'tremplin/react'

function App() {
  const collapse = useTremplin(Collapse, { toggle: false })
  return <main className="container py-5"><h1>Tremplin + React</h1><p className="text-lg">Use Tremplin classes in JSX and let the adapter own plugin lifecycle.</p><button className="btn-solid theme-primary" onClick={() => collapse.instance.current?.toggle()}>Toggle details</button><section ref={collapse.ref} className="collapse card mt-3" id="details"><div className="card-body">Accessible framework behavior, React rendering.</div></section></main>
}

createRoot(document.querySelector('#root')).render(<App />)
