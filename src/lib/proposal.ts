import { Buff }          from '@cmdcode/buff'
import { sha256 }        from '@cmdcode/crypto-tools/hash'
import { parse_addr }    from '@scrow/tapscript/address'
import { create_vout }   from '@scrow/tapscript/tx'
import { TxOutput }      from '@scrow/tapscript'

import {
  PaymentEntry,
  PathEntry,
  ProposalData
} from '../types/index.js'

type PathTotal = [ path: string, total : number ]

/**
 * Returns an array of payment paths
 * that is filtered by a given label.
 */
export function filter_path (
  label : string,
  paths : PathEntry[]
) : PathEntry[] {
  return paths.filter(e => e[0] === label)
}

/**
 * Returns an array of unique path names
 * from an array of payment paths.
 */
export function get_path_names (
  paths : PathEntry[]
) : string[] {
  return [ ...new Set(paths.map(e => e[0])) ]
}

/**
 * Returns the total value 
 * from an array of payments.
 */
export function get_pay_total (
  payments : PaymentEntry[]
) : number {
  return payments.map(e => e[0]).reduce((acc, curr) => acc + curr, 0)
}

/**
 * Returns an array of unique addresses
 * from an array of payment paths.
 */
export function get_addrs (
  paths : PathEntry[]
) : string[] {
  return [ ...new Set(paths.map(e => e[2])) ]
}

/**
 * Returns an array of transaction outputs from
 * an array of payment paths and array of payments.
 */
export function get_path_vouts (
  label   : string,
  paths   : PathEntry[]    = [],
  payouts : PaymentEntry[] = []
) : TxOutput[] {
  const filtered : PaymentEntry[] = filter_path(label, paths).map(e => [ e[1], e[2] ])
  const template : PaymentEntry[] = [ ...filtered.sort(), ...payouts.sort() ]
  return template.map(([ value, addr ]) => {
    const scriptPubKey = parse_addr(addr).asm
    return create_vout({ value, scriptPubKey })
  })
}

/**
 * Returns an array of labeled totals, one
 * for each unique payment path.
 */
export function get_path_total (
  paths : PathEntry[]
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

export function get_proposal_id (
  proposal : ProposalData
) {
  const preimg = Buff.json(proposal)
  return sha256(preimg)
}
