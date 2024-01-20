import { Buff }         from '@cmdcode/buff'
import { find_program } from './proposal.js'

import {
  get_object_id,
  now,
  sort_record
} from './util.js'

import {
  ProgramTerms,
  SignerAPI,
  WitnessData,
  WitnessPreimage,
  WitnessTemplate
} from '@/types/index.js'

/**
 * Returns a serialized preimage 
 * for signing a witness statement.
 */
export function get_witness_id (
  preimg : WitnessPreimage
) {
  return get_object_id(preimg).hex
}

export function create_witness (
  programs : ProgramTerms[],
  pubkey   : string,
  template : WitnessTemplate
) : WitnessData {
  const { args = [], action, method, path, stamp = now() } = template

  const query  = { method, action, path, includes: [ pubkey ] }
  const pdata  = find_program(query, programs)

  if (pdata === undefined) {
    throw new Error('matching program not found')
  }

  const prog_id = pdata.prog_id
  const tmpl    = { ...template, args, prog_id, stamp }
  const wid     = get_witness_id(tmpl)
  return sort_record({ ...tmpl, sigs : [], wid })
}

/**
 * Appends an additional signature 
 * to an existing witness statement.
 */
export function sign_witness (
  signer  : SignerAPI,
  witness : WitnessData
) : WitnessData {
  const { sigs = [], wid } = witness
  const pub = signer.pubkey
  const sig = signer.sign(wid)
  const hex = Buff.join([ pub, sig ]).hex
  sigs.push(hex)
  return sort_record({ ...witness, sigs })
}
