const DEBUG = false

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
  if (err instanceof Error) {
    throw err
  } else if (typeof err !== 'string') {
    throw new Error('Unknown error: ' + String(err))
  } else {
    return err
  }
}
