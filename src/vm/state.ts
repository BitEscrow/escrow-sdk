import { run_action }     from './action.js'
import { get_path_names } from '../lib/proposal.js'
import { regex }          from '../lib/util.js'
import { debug }          from './util.js'
import { PATH_METHODS }   from '@/config.js'

import {
  PathState,
  PathStatus,
  ProgramTerms,
  StateEntry,
  PayPath,
  StateData
} from '../types/index.js'

const INIT_TERMS = {
  can_dispute : false,
  can_lock    : false,
  can_resolve : false
}

export function init_paths (
  paths    : PayPath[],
  programs : ProgramTerms[]
) {
  const states : StateEntry[] = []
  const pnames = get_path_names(paths)
  for (const path of pnames) {
    const state = init_path_state(path, programs)
    states.push([ path, state ])
  }
  return states
}

export function update_path (
  action : string,
  path   : string,
  state  : StateData
) {
  const pst = get_path(state.paths, path)
  const idx = pst[0]
  const ret = run_action(action, pst[1], state)

  if (ret !== null) {
    state.paths[idx] = [ path, ret ]
    state.status = update_status(state.status, ret)
  }

  if (ret === PathState.closed) {
    state.result = path
  }

  debug('[vm] new state:', state)
}

function get_path (
  ent : StateEntry[],
  key : string
) : [ idx : number, state: PathState ] {
  const idx   = ent.findIndex(e => e[0] === key)
  const state = ent[idx][1]
  if (state === undefined) {
    throw 'Path not found: ' + key
  }
  return [ idx, state ]
}

function init_path_state (
  pathname : string,
  programs : ProgramTerms[]
) : PathState {
  const terms = { ...INIT_TERMS }
  const progs = programs.filter(e => PATH_METHODS.includes(e[0]))
    let state : PathState = PathState.open
  for (const prog of progs) {
    const [ _, actexp, pathexp ] = prog.map(e => String(e))
    if (regex(pathname, pathexp)) {
      if (regex('dispute', actexp)) terms.can_dispute = true
      if (regex('resolve', actexp)) terms.can_resolve = true
      if (regex('lock',    actexp)) terms.can_lock    = true
      if (regex('release', actexp)) state = PathState.locked
    }
  }
  validate_path_terms(pathname, terms)
  return state
}

function update_status (
  status : PathStatus,
  state  : PathState
) : PathStatus {
  if (state === PathState.closed) {
    return 'closed'
  } else if (state === PathState.disputed) {
    return 'disputed'
  } else {
    return status
  }
}

function validate_path_terms (
  path  : string,
  terms : typeof INIT_TERMS
) {
  if (terms.can_dispute && !terms.can_resolve) {
    throw 'Dispute action has no resolve action: ' + path
  }
  // if (terms.can_resolve && !terms.can_dispute) {
  //   throw new Error('Resolve action has no dispute action: ' + path)
  // }
}

export function check_stamp (
  stamp : number,
  state : StateData
) {
  const { updated } = state
  if (stamp < updated) {
    throw `Timestamp occurs before latest update: ${stamp} <= ${updated}`
  }
}

