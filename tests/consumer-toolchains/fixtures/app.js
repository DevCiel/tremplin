import * as framework from 'tremplin'
import Collapse from 'tremplin/collapse'

document.querySelector('#app').innerHTML = `<main class="container py-5">
  <h1>Installed Tremplin consumer</h1>
  <button type="button" class="btn-solid theme-primary" data-trm-toggle="collapse" data-trm-target="#details" aria-controls="details" aria-expanded="false">Toggle details</button>
  <section class="collapse mt-3" id="details"><div class="card card-body">Installed package interaction works.</div></section>
  <div class="form-field mt-3"><label class="form-label" for="date">Date</label><input class="form-control" id="date" type="text" value="2026-10-25" data-trm-toggle="datepicker"></div>
  <div id="spacing-probe" class="consumer-spacing">Consumer styles</div>
</main>`
const instance=framework.Collapse.getOrCreateInstance('#details',{toggle:false})
framework.Datepicker.getOrCreateInstance('#date')
// Consumer-owned inspection hook, not a framework global or API addition.
window.ConsumerQA={version:framework.Collapse.VERSION,exports:Object.keys(framework).sort(),sameClass:Collapse===framework.Collapse,sameInstance:Collapse.getInstance('#details')===instance,dispose(){instance.dispose();return Collapse.getInstance('#details')===null}}
document.documentElement.dataset.consumerReady='true'
