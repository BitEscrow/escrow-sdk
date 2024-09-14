import { ENGINE_LABEL, VALID_ACTIONS, VALID_METHODS, VALID_STATES } from './const.js'

import { check_params } from './lib/program.js'

import {
  eval_schedule,
  eval_witness,
  init_vm
} from './lib/main.js'

export * as VMUtil   from './lib/main.js'
export * as VMSchema from './schema.js'

export * from './types/index.js'

export default {
  actions : VALID_ACTIONS,
  methods : VALID_METHODS,
  states  : VALID_STATES,
  label   : ENGINE_LABEL,
  eval    : eval_witness,
  init    : init_vm,
  run     : eval_schedule,
  verify  : check_params
}
