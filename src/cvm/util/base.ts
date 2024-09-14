import { WitnessData }  from '@/core/types/index.js'
import { ENGINE_LABEL } from '../const.js'

const DEBUG = false

export class VMError extends Error {
  constructor (msg : string) {
    super(msg)
  }
}

export function debug (...msg : unknown[]) {
  const label = ENGINE_LABEL
  if (DEBUG) {
    console.log(`[${label}]`, ...msg)
  }
}

export function err_handler (
  err : unknown
) : string {
  /**
   * Handle the different types of
   * errors returned from the vm.
   */
  if (err instanceof VMError) {
    return err.message
  } else {
    throw err
  }
}

export function get_statements (
  witness : WitnessData | WitnessData[]
) {
 const arr = (Array.isArray(witness)) ? witness : [ witness ]
 return arr.sort((a, b) => a.stamp - b.stamp)
}
