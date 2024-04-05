/* Global Imports */

import { ScheduleEntry }   from '@/core/types/index.js'
import { get_access_list } from '@/core/util/index.js'

/* Module Imports */

import { VALID_ACTIONS }      from '../const.js'
import { TaskEntry, VMState } from '../types.js'

/* Local Imports */

import { update_spend_state } from './state.js'
import { debug }              from '../util/base.js'

export function init_tasks (
  schedule : ScheduleEntry[]
) {
  const tasks = [ ...schedule ]
  return tasks.sort((a, b) => a[0] - b[0])
}

export function run_schedule (
  state   : VMState,
  stop_at : number
) {
  /**
   * Run all available tasks that fall
   * within the current vm schedule.
   */
  debug('[vm] running tasks up to date:', stop_at)
  const tasks = get_tasks(state, stop_at)
  for (const task of tasks) {
    run_task(state, task)
    state.tasks.shift()
    if (state.output !== null) return
  }
}

/**
 * Run a task within the virtual machine.
 */
function run_task (
  state : VMState,
  task  : TaskEntry
) {
  const [ ts, actions, paths ] = task
  const PATHS = state.paths.map(e => e[0])
  const alist = get_access_list(actions, VALID_ACTIONS).wlist
  const plist = get_access_list(paths, PATHS).wlist
  for (const action of alist) {
    for (const path of plist) {
      try {
        debug('[vm] running task:', task)
        const stamp = state.active_at + ts
        const input = { action, path, stamp, wid: state.vmid }
        update_spend_state(input, state)
        if (state.output !== null) return
      } catch (err) {
        debug('[cvm] task failed to execute:' + String(err))
      }
    }
  }
}

/**
 * Get tasks that fall within
 * the current vm schedule.
 */
function get_tasks (
  state   : VMState,
  stop_at : number
) {
  const { active_at, updated_at, tasks } = state
  return tasks.filter(e => {
    const stamp = e[0] + active_at
    return (stamp >= updated_at && stamp <= stop_at)
  })
}
