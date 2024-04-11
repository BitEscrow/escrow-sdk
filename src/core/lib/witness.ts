import { Buff }        from '@cmdcode/buff'
import { get_program } from './vm.js'

import {
  now,
  sort_record
} from '../util/index.js'

import {
  ProgramEntry,
  ReceiptPreImage,
  SignerAPI,
  VMConfig,
  VMData,
  WitnessData,
  WitnessPreImage,
  WitnessReceipt,
  WitnessTemplate
} from '../types/index.js'

export function create_witness (
  config   : VMConfig | VMData,
  pubkeys  : string   | string[],
  template : WitnessTemplate
) : WitnessData {
  const { args = [], action, method, path, stamp = now() } = template

  const keys   = (Array.isArray(pubkeys)) ? pubkeys : [ pubkeys ]
  const query  = { method, action, path, includes: keys }
  const pdata  = get_program(query, config.programs)

  if (pdata === undefined) {
    throw new Error('matching program not found')
  }

  const prog_id = pdata.prog_id
  const vmid    = config.vmid
  const tmpl    = { ...template, args, prog_id, stamp, vmid }
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
  data    : VMData,
  signer  : SignerAPI,
  witness : WitnessData,
  receipt_at = now()
) : WitnessReceipt {
  const server_pk  = signer.pubkey
  const vm_hash    = data.head
  const vm_output  = data.output
  const vm_step    = data.step
  const preimg     = { ...witness, receipt_at, server_pk, vm_hash, vm_output, vm_step }
  const receipt_id = get_receipt_id(preimg)
  const server_sig = signer.sign(receipt_id)
  return sort_record({ ...preimg, receipt_id, server_sig })
}

/**
 * Returns a serialized preimage
 * for signing a witness statement.
 */
export function get_witness_id (
  preimg : WitnessPreImage
) {
  const { action, args, method, path, prog_id, stamp, vmid } = preimg
  const argstr = JSON.stringify(args)
  return Buff.json([ action, argstr, method, path, prog_id, stamp, vmid ]).digest.hex
}

export function get_receipt_id (
  preimage : ReceiptPreImage
) {
  const { receipt_at, server_pk, vm_hash, wid } = preimage
  const rat = Buff.num(receipt_at, 4)
  return Buff.join([ wid, rat, server_pk, vm_hash ]).digest.hex
}
