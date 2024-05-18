import { get_receipt_id } from './util.js'

import {
  now,
  sort_record
} from '../../util/index.js'

import {
  SignerAPI,
  VMData,
  WitnessData,
  WitnessReceipt
} from '../../types/index.js'

export function create_receipt (
  data    : VMData,
  signer  : SignerAPI,
  witness : WitnessData,
  receipt_at = now()
) : WitnessReceipt {
  const server_pk   = signer.pubkey
  const vm_closed   = data.closed
  const vm_hash     = data.head
  const vm_output   = data.output
  const vm_step     = data.step
  const preimg      = { ...witness, receipt_at, server_pk, vm_closed, vm_hash, vm_output, vm_step }
  const receipt_id  = get_receipt_id(preimg)
  const receipt_sig = signer.sign(receipt_id)
  return sort_record({ ...preimg, receipt_id, receipt_sig })
}
