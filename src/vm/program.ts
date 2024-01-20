import { parse_program } from '@/lib/parse.js'
import { regex }         from '@/lib/util.js'
import { MANIFEST }      from '@/lib/programs/index.js'
import { update_path }   from './state.js'
import { debug }         from './util.js'

import {
  ProgramEntry,
  StateData,
  WitnessData,
  MethodManifest,
  StoreEntry,
  ProgramTerms
} from '../types/index.js'

export function init_stores (
  prog_ids : string[]
) : StoreEntry[] {
  return prog_ids.map(e => [ e, '[]' ])
}

export function init_programs (
  terms : ProgramTerms[]
) : ProgramEntry[] {
  /**
   * Id each program term and
   * load them into an array.
   */
  const entries : ProgramEntry[] = []
  for (const term of terms) {
    const program = parse_program(term)
    const { method, actions, paths, prog_id, params } = program
    entries.push([ prog_id, method, actions, paths, ...params ])
  }
  return entries
}

export function run_program (
  state   : StateData,
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
  progs   : ProgramEntry[],
  stores  : StoreEntry[],
  witness : WitnessData
) {
  const { prog_id, action, path } = witness

  const prog  = progs.find(e  => e[0] === prog_id)
  const store = stores.find(e => e[0] === prog_id)

  if (prog === undefined) {
    throw 'program not found for id ' + prog_id
  }
  if (store === undefined) {
    throw 'store not found for id ' + prog_id
  }
  
  debug('[vm] loading witness program:', prog_id)

  const [ _, method, actions, paths, ...params ] = prog

  if (!regex(action, actions)) {
    throw 'program does not have access to action ' + action
  }

  if (!regex(path, paths)) {
    throw 'program does not have access to path ' + path
  }

  const exec = MANIFEST[method as keyof MethodManifest]

  return exec(params, store)
}
