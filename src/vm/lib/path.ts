/* Global Imports */

import { regex }        from '@/core/util/index.js'
import { ProgramEntry } from '@/core/types/index.js'

import {
  PathState,
  StateEntry
} from '../types.js'

const INIT_TERMS = {
  can_dispute : false,
  can_lock    : false,
  can_resolve : false
}

export function get_path_state (
  paths : StateEntry[],
  label : string
) : [ state: PathState, idx : number ] {
  const idx    = paths.findIndex(e => e[0] === label)
  const pstate = paths[idx][1]
  if (pstate === undefined) {
    throw new Error('path not found for label: ' + label)
  }
  return [ pstate, idx ]
}

export function init_path_state (
  pathname : string,
  programs : ProgramEntry[]
) : PathState {
  const terms = { ...INIT_TERMS }
    let pstate : PathState = PathState.open
  for (const prog of programs) {
    const [ _, actexp, pathexp ] = prog.map(e => String(e))
    if (regex(pathname, pathexp)) {
      if (regex('dispute', actexp)) terms.can_dispute = true
      if (regex('resolve', actexp)) terms.can_resolve = true
      if (regex('lock',    actexp)) terms.can_lock    = true
      if (regex('unlock',  actexp)) pstate = PathState.locked
    }
  }
  validate_path_terms(pathname, terms)
  return pstate
}

function validate_path_terms (
  path  : string,
  terms : typeof INIT_TERMS
) {
  if (terms.can_dispute && !terms.can_resolve) {
    throw new Error('dispute action has no resolve action for path ' + path)
  }
}
