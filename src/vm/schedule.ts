
import { update_path }     from './state.js'
import { debug }           from './util.js'
import { get_access_list } from '../lib/util.js'
import { StateData }       from '../types/index.js'

export function run_schedule (
  state  : StateData,
  marker : number
) {
  /**
   * Run all available tasks that fall
   * within the current vm schedule.
   */
  debug('[vm] running tasks up to marker:', marker)
  const tasks = get_tasks(state)
  for (const task of tasks) {
    const [ ts, action, paths ] = task
    const stamp = state.start + ts
    const prev  = state.updated
    if (prev <= stamp && stamp <= marker) {
      debug('[vm] running task:', task)
      run_task(action, paths, state)
      if (state.result !== null) return
      state.tasks.shift()
    }
  }
}

function run_task (
  action  : string,
  pathexp : string,
  state   : StateData
) {
  /**
   * Run a task within the virtual machine.
   */
  const paths = state.paths.map(e => e[0])
  const expr  = get_access_list(pathexp, paths)
  for (const path of expr.wlist) {
    try {
      update_path(action, path, state)
      if (state.result !== null) return
    } catch (err) {
      debug('[vm] task failed to execute:' + String(err))
    }
  }
}

function get_tasks (
  state : StateData,
) {
  /**
   * Filters tasks that fall within 
   * the current vm schedule.
   */
  const { start, updated } = state
  return state.tasks.filter(e => e[0] + start > updated)
}
