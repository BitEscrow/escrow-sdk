/* Global Imports */

import { ScheduleEntry }   from '@/core/types/index.js'
import { get_access_list } from '@/core/util/index.js'

/* Module Imports */

import { VALID_ACTIONS } from '../const.js'
import { VMState }       from '../types.js'

/* Local Imports */

import { update_path } from './state.js'
import { debug }       from './util.js'

export function init_tasks (
  schedule : ScheduleEntry[]
) {
  const tasks = [ ...schedule ]
  return tasks.sort((a, b) => a[0] - b[0])
}

export function run_schedule (
  state  : VMState,
  marker : number
) {
  /**
   * Run all available tasks that fall
   * within the current vm schedule.
   */
  debug('[vm] running tasks up to marker:', marker)
  const tasks = get_tasks(state)
  for (const task of tasks) {
    const [ ts, actions, paths ] = task
    const stamp = state.activated + ts
    const prev  = state.stamp
    if (prev <= stamp && stamp <= marker) {
      debug('[vm] running task:', task)
      run_task(actions, paths, stamp, state)
      state.tasks.shift()
      if (state.output !== null) return
    }
  }
}

function run_task (
  actsexp : string,
  pathexp : string,
  stamp   : number,
  state   : VMState
) {
  /**
   * Run a task within the virtual machine.
   */
  const paths = state.paths.map(e => e[0])
  const alist = get_access_list(actsexp, VALID_ACTIONS).wlist
  const plist = get_access_list(pathexp, paths).wlist
  for (const action of alist) {
    for (const path of plist) {
      try {
        const hash = state.vmid
        update_path(action, hash, path, stamp, state)
        if (state.output !== null) return
      } catch (err) {
        debug('[vm] task failed to execute:' + String(err))
      }
    }
  }
}

function get_tasks (
  state : VMState
) {
  /**
   * Filters tasks that fall within
   * the current vm schedule.
   */
  const { activated, stamp } = state
  return state.tasks.filter(e => e[0] + activated > stamp)
}
