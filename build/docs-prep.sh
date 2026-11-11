#!/usr/bin/env bash
# Adapted from Bootstrap docs-prep.sh; Copyright 2017-2026 The Bootstrap Authors.
# MIT: https://github.com/twbs/bootstrap/blob/main/LICENSE
# Local review staging ONLY. No Git checkout/reset/pull/branch, deployment or push.
set -euo pipefail
project_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd -- "$project_root"
node tests/tooling/prepare-docs-review.mjs "$@"
