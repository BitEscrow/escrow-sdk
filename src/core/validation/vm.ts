/* Local Imports */

import { verify_sig } from '@cmdcode/crypto-tools/signer'

/* Module Imports */

import {
  get_receipt_id,
  get_vmdata_hash
} from '../lib/vm.js'

import {
  VMData,
  VMReceipt
} from '../types/index.js'

export function verify_receipt (
  receipt : VMReceipt,
  result  : VMData
) {
  const { receipt_id, server_pk, server_sig, updated_at, ...data } = receipt

  const int_hash = get_vmdata_hash(data)
  const int_id   = get_receipt_id(int_hash, server_pk, updated_at)

  if (int_id !== receipt_id) {
    throw new Error('receipt id does not match internal id: ' + int_id)
  }

  const is_valid = verify_sig(server_sig, receipt_id, server_pk)

  if (!is_valid) {
    throw new Error('receipt signature is invalid')
  }

  if (receipt.vmid !== result.vmid) {
    throw new Error('receipt does not match vmid: '      + result.vmid)
  } else if (receipt.step !== result.step) {
    throw new Error('receipt does not match step: '      + result.step)
  } else if (receipt.head !== result.head) {
    throw new Error('receipt does not match head: '      + result.head)
  } else if (receipt.commit_at !== result.commit_at) {
    throw new Error('receipt does not match commit_at: ' + result.commit_at)
  } else if (receipt.error !== result.error) {
    throw new Error('receipt does not match error: '     + result.error)
  } else if (receipt.output !== result.output) {
    throw new Error('receipt does not match output: '    + result.output)
  }
}
