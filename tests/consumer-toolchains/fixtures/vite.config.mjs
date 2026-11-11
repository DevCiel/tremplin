import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as sass from 'sass'
const here=path.dirname(fileURLToPath(import.meta.url))
export default {
  base:'./',
  resolve:{alias:{'../icons/datepicker-chevron.svg':path.resolve(here,'../../node_modules/tremplin/dist/icons/datepicker-chevron.svg')}},
  css:{preprocessorOptions:{scss:{importers:[new sass.NodePackageImporter(here)]}}},
  build:{assetsInlineLimit:0}
}
