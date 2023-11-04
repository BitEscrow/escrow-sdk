import { run_schedule } from './schedule.js'
import { init_paths }   from './state.js'
import { debug, err_handler }        from './util.js'
import { now }          from '../lib/util.js'

import {
  init_programs,
  init_stores,
  run_program
} from './program.js'

import {
  ProgramTerms,
  ScheduleTerms,
  PathStatus,
  PayPath,
  StateData,
  WitnessData
} from '../types/index.js'

const INIT_STATE = {
  commits : [],
  error   : null,
  result  : null,
  status  : 'init' as PathStatus,
  steps   : 0,
  store   : []
}

export function eval_witness (
  state   : StateData,
  witness : WitnessData,
  marker  = now()
) {
  /**
   * Evaluate witness data using the vm state.
   */
  // Return early if there is already a result.
  if (state.result !== null) return state
  // Try to run the scheduler and program.
  try {
    debug('[vm] eval witness data:', witness)
    // Evaluate the schedule for due events.
    run_schedule(state, marker)
    // If there is a result, return early.
    if (state.result !== null) return state
    // Fetch the program by id, then run the program.
    run_program(state, witness)
  } catch (err) {
    // Handle raised errors.
    state.error = err_handler(err)
  }
  // Update the state timestamp.
  state.updated = marker
  // Return the current state.
  return state
}

export function eval_schedule (
  state  : StateData,
  marker : number = now()
) {
  /**
   * Run scheduler using the vm state.
   */
  // Return early if there is already a result.
  if (state.result !== null) return state
  // Evaluate the schedule for due events.
  run_schedule(state, marker)
  // Return the current state.
  return state
}

export function init_vm (
  contract_id : string,
  paypaths    : PayPath[],
  progterms   : ProgramTerms[],
  published   : number,
  schedule    : ScheduleTerms[]
) : StateData {
  /**
   * Initialize the state of 
   * the contract virtal machine.
   */
  const head     = contract_id
  const paths    = init_paths(paypaths, progterms)
  const programs = init_programs(progterms)
  const store    = init_stores(programs.map(e => e[0]))
  const start    = published
  const tasks    = schedule.sort((a, b) => a[0] - b[0])
  const updated  = start
  return { ...INIT_STATE, head, paths, programs, start, store, tasks, updated }
}
