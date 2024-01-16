import { Buff }          from '@cmdcode/buff'
import { now, regex }    from '../lib/util.js'
import { MANIFEST }      from '../lib/programs/index.js'
import { update_path }   from './state.js'
import { debug }         from './util.js'

import {
  ProgramEntry,
  StateData,
  WitnessData,
  MethodManifest,
  StoreEntry
} from '../types/index.js'

export function init_stores (
  prog_ids : string[]
) : StoreEntry[] {
  return prog_ids.map(e => [ e, '[]' ])
}

export function run_program (
  programs : ProgramEntry[],
  state    : StateData,
  witness  : WitnessData
) {
  const { store } = state
  const { action, path } = witness
  const exec = load_program(programs, store, witness)
  if (exec(witness)) {
    update_path(action, path, state)
  }
  commit_witness(state, witness)
}

function load_program (
  progs   : ProgramEntry[],
  stores  : StoreEntry[],
  witness : WitnessData
) {
  const { prog_id, action, path } = witness

  const prog  = progs.find(e  => e[0] === prog_id)
  const store = stores.find(e => e[0] === prog_id)

  if (prog === undefined) {
    throw 'program not found: ' + prog_id
  }
  if (store === undefined) {
    throw 'store not found:' + prog_id
  }
  
  debug('[vm] loading witness program:', prog_id)

  const [ _, method, actions, paths, ...params ] = prog

  if (!regex(action, actions)) {
    throw 'program does not have access to this action: ' + action
  }

  if (!regex(path, paths)) {
    throw 'program does not have access to this path: ' + path
  }

  const exec = MANIFEST[method as keyof MethodManifest]

  return exec(params, store)
}

function commit_witness (
  state   : StateData,
  witness : WitnessData
) {
  const head = state.head
  const mark = now()
  const step = state.steps
  const wid  = Buff.json(witness).digest.hex
  state.commits.push([ step, mark, wid, head ])
  state.head    = get_hash_tip(step, mark, wid, head)
  state.updated = mark
  state.steps  += 1
}

function get_hash_tip (
  step : number,
  mark : number,
  wid  : string,
  head : string
) {
  return Buff.json([ step, mark, wid, head ]).digest.hex
}
