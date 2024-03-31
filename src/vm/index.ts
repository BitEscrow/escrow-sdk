import { VALID_ACTIONS, VALID_METHODS } from './const.js'

import { check_params } from './lib/program.js'

import {
  eval_schedule,
  eval_witness,
  init_vm
} from './lib/main.js'

export * as VMUtil   from './lib/main.js'
export * as VMSchema from './schema.js'

export * from './types.js'

export const VirtualMachine = {
  VALID_ACTIONS,
  VALID_METHODS,
  check : check_params,
  eval  : eval_witness,
  init  : init_vm,
  run   : eval_schedule
}
