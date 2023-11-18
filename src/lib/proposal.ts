import { parse_addr }    from '@scrow/tapscript/address'
import { create_vout }   from '@scrow/tapscript/tx'
import { TxOutput }      from '@scrow/tapscript'
import { parse_program } from './parse.js'
import { regex }         from './util.js'

import {
  Payment,
  PayPath,
  ProgramQuery,
  ProgramTerms
} from '../types/index.js'

type PathTotal = [ path: string, total : number ]

export function filter_path (
  label : string,
  paths : PayPath[]
) {
  return paths.filter(e => e[0] === label)
}

export function get_path_names (paths : PayPath[]) {
  return [ ...new Set(paths.map(e => e[0])) ]
}

export function get_pay_total (
  payments : Payment[]
) : number {
  return payments.map(e => e[0]).reduce((acc, curr) => acc + curr, 0)
}

export function get_addrs (paths : PayPath[]) {
  return [ ...new Set(paths.map(e => e[2])) ]
}

export function get_path_vouts (
  label   : string,
  paths   : PayPath[] = [],
  payouts : Payment[] = []
) : TxOutput[] {
  const filtered : Payment[] = filter_path(label, paths).map(e => [ e[1], e[2] ])
  const template : Payment[] = [ ...filtered.sort(), ...payouts.sort() ]
  return template.map(([ value, addr ]) => {
    const scriptPubKey = parse_addr(addr).asm
    return create_vout({ value, scriptPubKey })
  })
}

export function get_path_total (
  paths : PayPath[]
) : PathTotal[] {
  // Setup an array for out totals.
  const path_totals : PathTotal[] = []
  // Collect a set of unique path names.
  const path_names = get_path_names(paths)
  // For each unique name in the set:
  for (const label of path_names) {
    // Collect all values for that path.
    const val = filter_path(label, paths).map(e => e[1])
    // Reduce the values into a total amount.
    const amt = val.reduce((acc, curr) => acc + curr, 0)
    // Add the total to the array.
    path_totals.push([ label, amt ])
  }
  return path_totals
}

export function find_program (
  query : ProgramQuery,
  terms : ProgramTerms[]
) {
  const { action, includes, method, path, params } = query

  let progs = terms.map(e => parse_program(e))

  if (method !== undefined) {
    progs = progs.filter(e => e.method === method)
  }

  if (action !== undefined) {
    progs = progs.filter(e => regex(action, e.actions))
  }

  if (path !== undefined) {
    progs = progs.filter(e => regex(path, e.paths))
  }

  if (Array.isArray(params)) {
    progs = progs.filter(e => params.every((x, i) => e.params[i] === x))
  }

  if (Array.isArray(includes)) {
    progs = progs.filter(e => includes.every(x => e.params.includes(x as any)))
  }

  return progs[0]
}
