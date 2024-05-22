import { regex }           from '@/core/util/index.js'
import { debug }           from '../util/base.js'
import { update_vm_state } from './state.js'
import EndorseMethod       from './methods/endorse.js'

import {
  Literal,
  ProgramData,
  WitnessInput
} from '@/core/types/index.js'

import {
  StoreEntry,
  ProgramReturn,
  ProgMethodAPI,
  CVMData
} from '../types.js'

export function call_method (method : string) : ProgMethodAPI | null {
  switch (method) {
    case 'endorse':
      return EndorseMethod
    default:
      return null
  }
}

export function check_params (
  method : string,
  params : Literal[]
) {
  const mthd = call_method(method)
  if (mthd === null) {
    return 'method not found'
  }
  return mthd.verify(params)
}

export function init_stores (
  prog_ids : string[]
) : StoreEntry[] {
  return prog_ids.map(e => [ e, '[]' ])
}

export function run_program (
  data    : CVMData,
  witness : WitnessInput
) {
  const { programs, state } = data
  const exec = load_program(programs, state.store, witness)
  if (exec(witness)) {
    update_vm_state(data, witness)
  }
}

function load_program (
  progs   : ProgramData[],
  stores  : StoreEntry[],
  witness : WitnessInput
) : ProgramReturn {
  const { prog_id, action, path } = witness

  const prog  = progs.find(e  => e.prog_id === prog_id)
  const store = stores.find(e => e[0] === prog_id)

  if (prog === undefined) {
    throw new Error('program not found for id: ' + prog_id)
  } else if (store === undefined) {
    throw new Error('store not found for id: ' + prog_id)
  }

  debug('[vm] loading witness program:', prog_id)

  const { actions, method, params, paths } = prog

  if (!regex(action, actions)) {
    throw new Error('program does not have access to action: ' + action)
  }

  if (!regex(path, paths)) {
    throw new Error('program does not have access to path: ' + path)
  }

  const mthd = call_method(method)

  if (mthd === null) {
    throw new Error('program method does not exist: ' + method)
  }

  return mthd.exec(params, store)
}
