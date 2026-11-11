---
"tremplin": minor
---

Route the root and focused core imports to canonical native ES modules and
declarations under `js/dist/`. Remove the old root main/module/types fields and
82 redundant root/component entry facades. Keep automatic data API registration
through bundler side-effect metadata, and preserve the established source/API
baseline through a narrow reversible export-path projection. Optional-product
exports and remaining internal formats are deferred to the next cleanup batch.
