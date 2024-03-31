import { Buff }  from '@cmdcode/buff'
import { regex } from '../util/index.js'

import {
  ProgramQuery,
  ProgramData,
  ProgramEntry
} from '../types/index.js'

export function create_program (
  entry : ProgramEntry
) : ProgramData {
  const [ method, actions, paths, ...params ] = entry
  const prog_id = get_program_id(entry)
  return { prog_id, method, actions, paths, params }
}

/**
 * Returns a given program from the program terms,
 * based upon the supplied search criteria.
 */
export function get_program (
  query    : ProgramQuery,
  programs : ProgramEntry[]
) : ProgramData | undefined {
  // Unpack all available terms from the query.
  const { action, includes, method, path, params } = query
  // Convert each ProgramTerm into ProgramData.
  let progs = programs.map(e => create_program(e))
  // If defined, filter programs by method.
  if (method !== undefined) {
    progs = progs.filter(e => e.method === method)
  }
  // If defined, filter programs by allowed action.
  if (action !== undefined) {
    progs = progs.filter(e => regex(action, e.actions))
  }
  // If defined, filter programs by allowed path.
  if (path !== undefined) {
    progs = progs.filter(e => regex(path, e.paths))
  }
  // If defined, filter programs by matching params and index.
  if (Array.isArray(params)) {
    progs = progs.filter(e => params.every((x, i) => e.params[i] === x))
  }
  // If defined, filter programs by matching params (any index).
  if (Array.isArray(includes)) {
    progs = progs.filter(e => includes.every(x => e.params.includes(x)))
  }
  // Return the first program that matches all specified criteria.
  return progs.at(0)
}

export function get_program_id (
  entry : ProgramEntry
) : string {
  const [ method, _, __, ...params ] = entry
  return Buff.json([ method, ...params ]).digest.hex
}

export function get_program_idx (
  entries : ProgramEntry[],
  program : ProgramEntry
) {
  const [ method, actions, paths, thold ] = program
  const idx = entries.findIndex(e => {
    return (e[0] === method && e[1] === actions && e[2] === paths && e[3] === thold)
  })
  return (idx !== -1) ? idx : null
}
