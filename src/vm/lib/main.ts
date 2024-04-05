/* Global Imports */

import { now } from '@/core/util/index.js'

import {
  VMConfig,
  VMData,
  WitnessData
} from '@/core/types/index.js'

/* Module Imports */

import {
  debug,
  err_handler,
  get_statements,
  revive_vmstate,
  serialize_vmstate
} from '../util/index.js'

import {
  PathStatus,
  CommitEntry,
  VMState
} from '../types.js'

/* Local Imports */

import { init_spend_state }         from './state.js'
import { init_tasks, run_schedule } from './schedule.js'

import {
  init_programs,
  init_stores,
  run_program
} from './program.js'

const GET_INIT_DATA = () => {
  return {
    error  : null,
    output : null,
    step   : 0
  }
}

const GET_INIT_STATE = () => {
  return {
    commits : [] as CommitEntry[],
    status  : 'init' as PathStatus
  }
}

/**
 * Evaluates the witness data against the current virtual machine state.
 */
export function eval_witness (
  data    : VMData,
  witness : WitnessData | WitnessData[]
) : VMData {
  // Return early if there is already a result.
  if (data.output !== null) return data
  // Revive the vm state data.
  const vm_state = revive_vmstate(data)
  try {
    // Reset our error varaible.
    vm_state.error = null
    // Get a sorted stack of witness statements.
    const stack = get_statements(witness)
    // Try to run the scheduler and program.
    for (const wit of stack) {
      //
      debug('[vm] eval witness data:', witness)
      // Evaluate the schedule for due events.
      run_schedule(vm_state, wit.stamp)
      // If there is a result, return early.
      if (vm_state.output !== null) {
        return serialize_vmstate(vm_state)
      }
      // Fetch the program by id, then run the program.
      run_program(vm_state, wit)
      // If there is a result, return early.
      if (vm_state.error !== null || vm_state.output !== null) {
        return serialize_vmstate(vm_state)
      }
    }
  } catch (err) {
    // Handle raised errors.
    vm_state.error = err_handler(err)
  }
  // Return the current state.
  return serialize_vmstate(vm_state)
}

/**
 * Evaluates the schedule of the virtual machine to process due events.
 */
export function eval_schedule (
  data    : VMData,
  stop_at : number = now()
) : VMData {
  // Return early if there is already a result.
  if (data.output !== null) return data
  // Revive the vm state data.
  const vm_state = revive_vmstate(data)
  // Evaluate the schedule for due events.
  run_schedule(vm_state, stop_at)
  // Return the current state.
  return serialize_vmstate(vm_state)
}

/**
 * Initializes the virtual machine with the given parameters.
 */
export function init_vm (config : VMConfig) : VMData {
  const { active_at, closes_at, vmid } = config
  const programs = init_programs(config.programs)

  const state : VMState = {
    ...GET_INIT_DATA(),
    ...GET_INIT_STATE(),
    active_at,
    closes_at,
    programs,
    vmid,
    head       : config.vmid,
    paths      : init_spend_state(config.pathnames, config.programs),
    store      : init_stores(programs.map(e => e.prog_id)),
    tasks      : init_tasks(config.schedule),
    updated_at : config.active_at
  }

  return serialize_vmstate(state)
}
