import {
  VMConfig,
  WitnessData
} from '@/core/types/index.js'

import { now } from '@/util.js'

import {
  init_tasks,
  run_schedule
} from './schedule.js'

import { init_paths } from './state.js'

import {
  init_programs,
  init_stores,
  run_program
} from './program.js'

import {
  debug,
  err_handler
} from '../util.js'

import {
  PathStatus,
  CommitEntry,
  VMData
} from '../types.js'

const GET_INIT_STATE = () => {
  return {
    commits : [] as CommitEntry[],
    error   : null,
    output  : null,
    status  : 'init' as PathStatus,
    steps   : 0
  }
}

/**
 * Evaluates the witness data against the current virtual machine state.
 */
export function eval_witness (
  state   : VMData,
  witness : WitnessData,
  marker  = now()
) : VMData {
  // Return early if there is already a result.
  if (state.output !== null) {
    return state
  }
  // Reset our error varaible.
  state.error = null
  // Try to run the scheduler and program.
  try {
    debug('[vm] eval witness data:', witness)
    // Evaluate the schedule for due events.
    run_schedule(state, marker)
    // If there is a result, return early.
    if (state.output !== null) return state
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

/**
 * Evaluates the schedule of the virtual machine to process due events.
 */
export function eval_schedule (
  state  : VMData,
  marker : number = now()
) : VMData {
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
export function init_vm (
  config : VMConfig
) : VMData {
  const { activated, vmid } = config
  const head     = config.vmid
  const paths    = init_paths(config.pathnames, config.programs)
  const programs = init_programs(config.programs)
  const store    = init_stores(programs.map(e => e.prog_id))
  const start    = config.activated
  const tasks    = init_tasks(config.schedule)
  const updated  = start
  return { ...GET_INIT_STATE(), activated, head, paths, programs, store, tasks, updated, vmid }
}
