/* Global Imports */

import { now, sort_record } from '@/core/util/index.js'

import {
  VMConfig,
  WitnessData
} from '@/core/types/index.js'

/* Module Imports */

import { debug, err_handler, get_statements } from './util.js'

import {
  PathStatus,
  CommitEntry,
  VMState
} from '../types.js'

/* Local Imports */

import { init_tasks, run_schedule } from './schedule.js'
import { init_paths }               from './state.js'

import {
  init_programs,
  init_stores,
  run_program
} from './program.js'

const GET_INIT_STATE = () => {
  return {
    commits : [] as CommitEntry[],
    error   : null,
    output  : null,
    status  : 'init' as PathStatus,
    step    : 0
  }
}

/**
 * Evaluates the witness data against the current virtual machine state.
 */
export function eval_witness (
  state   : VMState,
  witness : WitnessData | WitnessData[]
) : VMState {
  // Return early if there is already a result.
  if (state.output !== null) return state
  // Reset our error varaible.
  state.error = null
  // Get a sorted stack of witness statements.
  const stack = get_statements(witness)
  // Try to run the scheduler and program.
  try {
    for (const wit of stack) {
      //
      debug('[vm] eval witness data:', witness)
      // Evaluate the schedule for due events.
      run_schedule(state, wit.stamp)
      // If there is a result, return early.
      if (state.output !== null) return state
      // Fetch the program by id, then run the program.
      run_program(state, wit)
      // If there is a result, return early.
      if (state.error  !== null || state.output !== null) {
        return state
      }
    }
  } catch (err) {
    // Handle raised errors.
    state.error = err_handler(err)
  }
  // Return the current state.
  return state
}

/**
 * Evaluates the schedule of the virtual machine to process due events.
 */
export function eval_schedule (
  state  : VMState,
  marker : number = now()
) : VMState {
  // Return early if there is already a result.
  if (state.output !== null) return state
  // Evaluate the schedule for due events.
  run_schedule(state, marker)
  // Return the current state.
  return state
}

/**
 * Initializes the virtual machine with the given parameters.
 */
export function init_vm (config : VMConfig) : VMState {
  const { active_at, vmid } = config
  const head     = config.vmid
  const paths    = init_paths(config.pathnames, config.programs)
  const programs = init_programs(config.programs)
  const store    = init_stores(programs.map(e => e.prog_id))
  const updated  = config.active_at
  const tasks    = init_tasks(config.schedule)
  return sort_record({ ...GET_INIT_STATE(), active_at, head, paths, programs, store, tasks, updated, vmid })
}
