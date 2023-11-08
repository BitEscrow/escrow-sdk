import { Buff }          from '@cmdcode/buff'
import { parse_program } from '../lib/parse.js'
import { now, regex }    from '../lib/util.js'
import { update_path }   from './state.js'
import { debug }         from './util.js'
import methods           from './methods/index.js'

import {
  ProgramTerms,
  ProgramEntry,
  StateData,
  StoreEntry,
  WitnessData,
  ProgramList
} from '../types/index.js'

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
    const { method, actions, paths, params } = program
    const img = [ method, ...params ]
    const id  = Buff.json(img).digest.hex
    const arr = params.map(e => String(e))
    entries.push([ id, actions, paths, method, arr ])
  }
  return entries
}

export function init_stores (
  prog_ids : string[]
) : StoreEntry[] {
  return prog_ids.map(e => [ e, new Array() ])
}

export function run_program (
  state   : StateData,
  witness : WitnessData
) {
  const { programs, store } = state
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

  const [ _, actions, paths, method, params ] = prog

  if (!regex(action, actions)) {
    throw 'program does not have access to this action: ' + action
  }

  if (!regex(path, paths)) {
    throw 'program does not have access to this path: ' + path
  }

  const exec = methods[method as keyof ProgramList]

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
