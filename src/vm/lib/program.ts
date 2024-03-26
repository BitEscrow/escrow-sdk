import { create_program } from '@/core/lib/vm.js'
import { regex }          from '@/util.js'

import {
  ProgramEntry,
  ProgramData,
  WitnessData
} from '@/core/types/index.js'

import { MANIFEST }    from '../methods/index.js'
import { update_path } from './state.js'
import { debug }       from '../util.js'

import {
  VMData,
  StoreEntry,
  ProgramReturn
} from '../types.js'

export function init_stores (
  prog_ids : string[]
) : StoreEntry[] {
  return prog_ids.map(e => [ e, '[]' ])
}

export function init_programs (
  terms : ProgramEntry[]
) : ProgramData[] {
  return terms.map(e => create_program(e))
}

export function run_program (
  state   : VMData,
  witness : WitnessData
) {
  const { programs, store } = state
  const { action, path } = witness
  const exec = load_program(programs, store, witness)
  if (exec(witness)) {
    const hash = witness.wid
    update_path(action, hash, path, state)
  }
}

function load_program (
  progs   : ProgramData[],
  stores  : StoreEntry[],
  witness : WitnessData
) : ProgramReturn {
  const { prog_id, action, path } = witness

  const prog  = progs.find(e  => e.prog_id === prog_id)
  const store = stores.find(e => e[0] === prog_id)

  if (prog === undefined) {
    throw new Error('program not found for id ' + prog_id)
  } else if (store === undefined) {
    throw new Error('store not found for id ' + prog_id)
  }

  debug('[vm] loading witness program:', prog_id)

  const { actions, method, params, paths } = prog

  if (!regex(action, actions)) {
    throw new Error('program does not have access to action ' + action)
  }

  if (!regex(path, paths)) {
    throw new Error('program does not have access to path ' + path)
  }

  const program = MANIFEST[method]

  if (program === undefined) {
    throw new Error('program method does not exist in manifest ' + method)
  }

  return program.exec(params, store)
}
