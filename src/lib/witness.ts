import { parse_program } from './parse.js'

import {
  get_object_id,
  now,
  regex,
  sort_record
} from './util.js'

import {
  ContractData,
  ProgramData,
  ProgramQuery,
  ProgramTerms,
  SignerAPI,
  WitnessData,
  WitnessParams,
  WitnessTemplate
} from '@/types/index.js'

/**
 * Returns a given program from the program terms,
 * based upon the supplied search criteria.
 */
export function find_program (
  query : ProgramQuery,
  terms : ProgramTerms[]
) : ProgramData | undefined {
  // Unpack all available terms from the query.
  const { action, includes, method, path, params } = query
  // Convert each ProgramTerm into ProgramData.
  let progs = terms.map(e => parse_program(e))
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
    progs = progs.filter(e => includes.every(x => e.params.includes(x as any)))
  }
  // Return the first program that matches all specified criteria.
  return progs.at(0)
}

/**
 * Returns a serialized preimage 
 * for signing a witness statement.
 */
export function get_witness_id (
  stamp    : number,
  template : WitnessTemplate
) {
  return get_object_id({ ...template, stamp }).hex
}

export function create_witness (
  contract : ContractData,
  params   : WitnessParams
) : WitnessTemplate {
  const { programs } = contract.terms
  const { args = [], action, method, path, pubkey } = params

  const query  = { method, action, path, includes: [ pubkey ] }
  const pdata  = find_program(query, programs)

  if (pdata === undefined) {
    throw new Error('matching program not found')
  }

  const prog_id = pdata.prog_id
  return sort_record({ ...params, args, prog_id, pubkey })
}

/**
 * Appends an additional signature 
 * to an existing witness statement.
 */
export function sign_witness (
  signer   : SignerAPI,
  template : WitnessTemplate,
  stamp   ?: number
) : WitnessData {
  const cat = stamp ?? now()
  const wid = get_witness_id(cat, template)
  const sig = signer.sign(wid)

  return sort_record({ ...template, cat, sig, wid })
}
