import { parse_addr }   from '@scrow/tapscript/address'
import { create_vout }  from '@scrow/tapscript/tx'
import { TxOutput }     from '@scrow/tapscript'
import { PATH_METHODS } from '@/config.js'

import {
  Payment,
  PayPath,
  ProgramTerms
} from '../types/index.js'
import { parse_program } from './parse.js'

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

export function get_path_methods (
  programs : ProgramTerms[]
) {
  return programs
    .filter(e => PATH_METHODS.includes(e[0]))
    .map(e => parse_program(e))
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
