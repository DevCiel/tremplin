# Historical documentation scope fixtures

These tracked fixtures make documentation regression tests reproducible without
the author's ignored `artifacts/*-before.json` files. Each contains the **original**
`protectedInputs` map, capture date, source artifact path, and full source-artifact
SHA-256. Snapshot inventories from those artifacts are not runtime inputs to these
tests and remain in the local historical evidence. No hashes were refreshed.

`package.initial.json` is the exact LF-normalized `package.json` from Tremplin's
initial commit `e19cfe317f3c8634add37a9c4b236d4bdc17bace`, SHA-256
`a79e25ad5bd9643838472289333f7ae83ea1cf03cac27e521e1bd5f046281b11`.
The shared scope helper permits only the subsequently approved repository URL,
build-before-test-typecheck ordering, and generation of the documentation ESM
assets before unit tests inspect them, and the user-approved `scripts/` to
`build/` relocation of command paths. Script names and other arguments do not
change for the relocation. Dependencies, exports, remaining
scripts, and every other package field must still match that initial manifest.
Previously approved ESM follow-up contracts remain explicit in that same helper.
For the protected documentation-visual configuration, only the server command's
`scripts/` to `build/` path is translated back before comparing its original
hash. Screenshot tolerances, ports, worker counts and baseline paths are not
exempted or refreshed.

The separately reviewed upstream move to `9062790` advances eight source/derived
inputs recorded in `metadata/upstream-transition-9062790.json`. Their original
fixture hashes remain unchanged. The scope helper requires the exact old-to-new
hash pair and target pin; unknown files, modified target bytes and substituted
origin hashes still fail. The source gate independently verifies the new Git
blobs and the unchanged literal security/accessibility edit lists.

Do not generate these fixtures from the current checkout or automatically update
them in CI. Deliberate contract changes require review. Generated assets and the
Git-verified upstream reference still come from the normal build/audit steps;
the root `dist/` distribution is now deliberately tracked, while `artifacts/`
and generated documentation copies remain ignored. The normal build/audit
steps must still succeed without pre-existing generated output.
