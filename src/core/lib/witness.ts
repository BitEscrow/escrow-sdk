import { Buff }        from '@cmdcode/buff'
import { get_program } from './vm.js'

import {
  get_object_id,
  now,
  sort_record
} from '../util/index.js'

import {
  ProgramEntry,
  SignerAPI,
  WitnessData,
  WitnessPreImage,
  WitnessTemplate
} from '../types/index.js'

export function create_witness (
  programs : ProgramEntry[],
  pubkeys  : string | string[],
  template : WitnessTemplate
) : WitnessData {
  const { args = [], action, method, path, stamp = now() } = template

  const keys   = (Array.isArray(pubkeys)) ? pubkeys : [ pubkeys ]
  const query  = { method, action, path, includes: keys }
  const pdata  = get_program(query, programs)

  if (pdata === undefined) {
    throw new Error('matching program not found')
  }

  const prog_id = pdata.prog_id
  const tmpl    = { ...template, args, prog_id, stamp }
  const wid     = get_witness_id(tmpl)
  return sort_record({ ...tmpl, sigs: [], wid })
}

export function can_endorse (
  programs : ProgramEntry[],
  signer   : SignerAPI,
  witness  : WitnessData
) {
  const { action, method, path } = witness
  const pubkey = signer.pubkey
  const query  = { method, action, path, includes: [ pubkey ] }
  const pdata  = get_program(query, programs)
  return pdata !== undefined
}

/**
 * Appends an additional signature
 * to an existing witness statement.
 */
export function endorse_witness (
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

/**
 * Returns a serialized preimage
 * for signing a witness statement.
 */
export function get_witness_id (
  preimg : WitnessPreImage
) {
  return get_object_id(preimg).hex
}
