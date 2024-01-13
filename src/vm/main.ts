import { run_schedule } from './schedule.js'
import { init_paths }   from './state.js'
import { now }          from '../lib/util.js'

import {
  debug,
  err_handler
} from './util.js'

import {
  init_stores,
  run_program
} from './program.js'

import {
  ProgramTerms,
  ScheduleTerms,
  PathStatus,
  PathEntry,
  StateData,
  WitnessData,
  ProgramEntry
} from '../types/index.js'
import { parse_program } from '@/lib/parse.js'

const INIT_STATE = {
  commits : [],
  error   : null,
  result  : null,
  status  : 'init' as PathStatus,
  steps   : 0,
  store   : []
}

/**
 * Evaluates the witness data against the current virtual machine state.
 */
export function eval_witness (
  state   : StateData,
  witness : WitnessData,
  marker  = now()
) : { error ?: string, state : StateData } {
  // Return early if there is already a result.
  if (state.result !== null) {
    return { state }
  }
  // Define our error varaible.
  let error : string | undefined
  // Try to run the scheduler and program.
  try {
    debug('[vm] eval witness data:', witness)
    // Evaluate the schedule for due events.
    run_schedule(state, marker)
    // If there is a result, return early.
    if (state.result !== null) return { state }
    // Fetch the program by id, then run the program.
    run_program(state, witness)
  } catch (err) {
    // Handle raised errors.
    error = err_handler(err)
  }
  // Update the state timestamp.
  state.updated = marker
  // Return the current state.
  return { error, state }
}

/**
 * Evaluates the schedule of the virtual machine to process due events.
 */
export function eval_schedule (
  state  : StateData,
  marker : number = now()
) : StateData {
  // Return early if there is already a result.
  if (state.result !== null) return state
  // Evaluate the schedule for due events.
  run_schedule(state, marker)
  // Return the current state.
  return state
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

/**
 * Initializes the virtual machine with the given parameters.
 */
export function init_vm (
  contract_id : string,
  paypaths    : PathEntry[],
  progterms   : ProgramTerms[],
  published   : number,
  schedule    : ScheduleTerms[]
) : StateData {
  const head     = contract_id
  const paths    = init_paths(paypaths, progterms)
  const programs = init_programs(progterms)
  const store    = init_stores(programs.map(e => e[0]))
  const start    = published
  const tasks    = schedule.sort((a, b) => a[0] - b[0])
  const updated  = start
  return { ...INIT_STATE, head, paths, programs, start, store, tasks, updated }
}
