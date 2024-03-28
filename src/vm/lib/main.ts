import {
  VMConfig,
  VMData,
  WitnessData
} from '@/core/types/index.js'

import { now, sort_record } from '@/util.js'

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
  VMState
} from '../types.js'

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
  witness : WitnessData,
  marker  = now()
) : VMState {
  // Return early if there is already a result.
  if (state.output !== null) return state
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
export function init_vm (
  config : VMConfig
) : VMState {
  const { activated, vmid } = config
  const head     = config.vmid
  const paths    = init_paths(config.pathnames, config.programs)
  const programs = init_programs(config.programs)
  const store    = init_stores(programs.map(e => e.prog_id))
  const stamp    = config.activated
  const tasks    = init_tasks(config.schedule)
  return sort_record({ ...GET_INIT_STATE(), activated, head, paths, programs, stamp, store, tasks, vmid })
}

export function get_vmdata (vmstate : VMState) : VMData {
  const { activated, error, head, output, step, stamp, vmid } = vmstate
  return { activated, error, head, output, step, stamp, vmid }
}
