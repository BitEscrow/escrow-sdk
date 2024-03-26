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
