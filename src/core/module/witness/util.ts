import { Buff } from '@cmdcode/buff'

import {
  ReceiptPreImage,
  WitnessPreImage
} from '../../types/index.js'

/**
 * Returns a serialized preimage
 * for signing a witness statement.
 */
export function get_witness_id (
  preimg : WitnessPreImage
) {
  const { action, args, content, method, path, prog_id, stamp, vmid } = preimg
  const argstr = JSON.stringify(args)
  return Buff.json([ action, argstr, content, method, path, prog_id, stamp, vmid ]).digest.hex
}

export function get_receipt_id (
  preimage : ReceiptPreImage
) {
  const { receipt_at, agent_pk, vm_hash, wid } = preimage
  const rat = Buff.num(receipt_at, 4)
  return Buff.join([ wid, rat, agent_pk, vm_hash ]).digest.hex
}
