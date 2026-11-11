import { claimRuntime } from './registry.js'

declare const TREMPLIN_BUILD_VERSION: string
const owner = Symbol('tremplin-strict-distribution')
export function assertRuntime(): void { claimRuntime('strict-6', TREMPLIN_BUILD_VERSION, owner) }
assertRuntime()
