import { ScheduleEntry }   from '@/core/types/index.js'
import { get_access_list } from '@/util/index.js'
import { PATH_ACTIONS, VALID_ACTIONS }   from '../const.js'
import { CVMData }         from '../types/index.js'
import { update_vm_state } from './state.js'
import { debug }           from '../util/base.js'

export function init_tasks (
  schedule : ScheduleEntry[]
) {
  const tasks = [ ...schedule ]
  return tasks.sort((a, b) => a[0] - b[0])
}

export function run_schedule (
  data    : CVMData,
  stop_at : number
) {
  /**
   * Run all available tasks that fall
   * within the current vm schedule.
   */
  debug('[vm] running tasks up to date:', stop_at)
  const tasks = get_tasks(data, stop_at)
  for (const task of tasks) {
    run_task(data, task)
    data.tasks.shift()
    if (data.output !== null) return
  }
}

/**
 * Run a task within the virtual machine.
 */
function run_task (
  data : CVMData,
  task : ScheduleEntry
) {
  const [ ts, actions, paths ] = task
  const PATHS = data.state.paths.map(e => e[0])
  const alist = get_access_list(actions, VALID_ACTIONS).wlist
  const plist = get_access_list(paths, PATHS).wlist
  const stamp = data.active_at + ts
  const wid   = data.vmid
  for (const action of alist) {
    debug('[vm] running task:', task)
    
    try {
      if (PATH_ACTIONS.includes(action)) {
        for (const path of plist) {
          try {
            const input = { action, path, stamp, wid }
            update_vm_state(data, input)
            if (data.output !== null) return
          } catch (err) {
            debug('[cvm] task path failed to execute:' + String(err))
          }
        }
      } else {
        const input = { action, path: null, stamp, wid }
        update_vm_state(data, input)
      }
    } catch (err) {
      debug('[cvm] task action failed to execute:' + String(err))
    }
  }
  
}

/**
 * Get tasks that fall within
 * the current vm schedule.
 */
function get_tasks (
  data    : CVMData,
  stop_at : number
) {
  const { active_at, tasks, updated_at } = data
  return tasks.filter(e => {
    const stamp = e[0] + active_at
    return (stamp >= updated_at && stamp <= stop_at)
  })
}
