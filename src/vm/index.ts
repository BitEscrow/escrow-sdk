 import { MANIFEST } from './methods/index.js'

import {
  init_vm,
  eval_schedule,
  eval_witness
} from './lib/main.js'

export * from './types.js'

export * as VMSchema from './schema.js'

export const VM = {
  methods : MANIFEST,
  init    : init_vm,
  eval    : eval_witness,
  run     : eval_schedule
}
