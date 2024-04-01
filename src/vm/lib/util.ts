import {
  VMData,
  WitnessData
} from '@/core/types/index.js'

import { VMState } from '../types.js'

const DEBUG = false

export class VMError extends Error {
  constructor (msg : string) {
    super(msg)
  }
}

export function debug (...msg : unknown[]) {
  if (DEBUG) {
    console.log('[vm]', ...msg)
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

export function get_vmdata (vmstate : VMState) : VMData {
  const { activated, error, head, output, step, updated, vmid } = vmstate
  return { activated, error, head, output, step, updated, vmid }
}
