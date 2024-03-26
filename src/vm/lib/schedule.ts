import { get_access_list } from '@/util.js'
import { VALID_ACTIONS }   from '@/config.js'
import { ScheduleEntry }   from '@/core/types/index.js'

import { update_path }     from './state.js'
import { debug }           from '../util.js'
import { VMData }          from '../types.js'

export function init_tasks (
  schedule : ScheduleEntry[]
) {
  const tasks = [ ...schedule ]
  return tasks.sort((a, b) => a[0] - b[0])
}

export function run_schedule (
  state  : VMData,
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
    const prev  = state.updated
    if (prev <= stamp && stamp <= marker) {
      debug('[vm] running task:', task)
      run_task(actions, paths, state)
      state.tasks.shift()
      if (state.output !== null) return
    }
  }
}

function run_task (
  actsexp : string,
  pathexp : string,
  state   : VMData
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
        const hash = state.head
        update_path(action, hash, path, state)
        if (state.output !== null) return
      } catch (err) {
        debug('[vm] task failed to execute:' + String(err))
      }
    }
  }
}

function get_tasks (
  state : VMData
) {
  /**
   * Filters tasks that fall within
   * the current vm schedule.
   */
  const { activated, updated } = state
  return state.tasks.filter(e => e[0] + activated > updated)
}
