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
  WitnessTemplate,
  WitnessReceipt,
  VMData
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

export function create_receipt (
  data   : VMData,
  signer : SignerAPI,
  created_at = now()
) : WitnessReceipt {
  const hash   = get_receipt_hash(data)
  const pubkey = signer.pubkey
  const id     = get_receipt_id(hash, pubkey, created_at)
  const sig    = signer.sign(id)
  return sort_record({ ...data, created_at, hash, id, pubkey, sig })
}

export function get_receipt_hash (data : VMData) {
  const err   = Buff.str(data.error  ?? 'null')
  const head  = Buff.hex(data.head, 32)
  const out   = Buff.str(data.output ?? 'null')
  const stamp = Buff.num(data.stamp, 4)
  const step  = Buff.num(data.step, 4)
  const vmid  = Buff.hex(data.vmid, 32)
  return Buff.join([ err, head, out, stamp, step, vmid ]).digest.hex
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

export function get_receipt_id (
  hash   : string,
  pubkey : string,
  stamp  : number
) {
  const cat = Buff.num(stamp, 4)
  const dig = Buff.hex(hash, 32)
  const pub = Buff.hex(pubkey, 32)
  return Buff.join([ cat, dig, pub ]).digest.hex
}
