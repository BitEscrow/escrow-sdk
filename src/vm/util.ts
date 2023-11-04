import { Buff }          from '@cmdcode/buff'
import { regex }         from '../lib/util.js'
import { parse_program } from '../lib/parse.js'
import { ProgramTerms }  from '../types/index.js'

const DEBUG = false

export function debug (...msg : unknown[]) {
  if (DEBUG) {
    console.log('[vm]', ...msg)
  }
}

export function get_program_id (
  action   : string,
  path     : string,
  pubkey   : string,
  programs : ProgramTerms[],
) {
  const progs = programs.filter(e => e[2] === 'sign')
  for (const terms of progs) {
    const program = parse_program(terms)
    const { method, actions, paths, params } = program
    if (!regex(action, actions))   continue
    if (!regex(path, paths))       continue
    if (method === 'sign') {
      const [ _, ...members ] = params
      if (!members.includes(pubkey)) {
        continue
      }
    }
    const img = [ method, ...params ]
    return Buff.json(img).digest.hex
  }
  throw new Error('matching witness program not found')
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
