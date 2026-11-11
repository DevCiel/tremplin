import { createApp } from 'vue'
import 'tremplin/css'
import { Collapse } from 'tremplin'
import { createTremplinDirective } from 'tremplin/vue'

const app = createApp({
  methods: { toggle() { Collapse.getOrCreateInstance('#details').toggle() } },
  template: `<main class="container py-5"><h1>Tremplin + Vue</h1><p class="text-lg">Use Tremplin classes in templates and let the directive own plugin lifecycle.</p><button class="btn-solid theme-primary" @click="toggle">Toggle details</button><section v-collapse="{ toggle: false }" id="details" class="collapse card mt-3"><div class="card-body">Accessible framework behavior, Vue rendering.</div></section></main>`
})
app.directive('collapse', createTremplinDirective(Collapse))
app.mount('#app')
