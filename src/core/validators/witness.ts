import { verify_sig } from '@cmdcode/crypto-tools/signer'

import * as assert        from '@/assert.js'
import { Literal }        from '@/types.js'
import { regex }          from '@/util.js'
import { VirtualMachine } from '@/vm/index.js'

import { get_path_names } from '../lib/proposal.js'

import {
  create_program,
  get_receipt_hash,
  get_receipt_id,
  get_witness_id
} from '../lib/witness.js'

import {
  ContractData,
  VMConfig,
  VMData,
  WitnessData,
  WitnessReceipt
} from '../types/index.js'

import WitSchema from '../schema/witness.js'

export function validate_witness (
  witness : unknown
) : asserts witness is WitnessData {
  WitSchema.data.parse(witness)
}

export function verify_program (
  method : string,
  params : Literal[],
  policy : string[]
) {
  if (!policy.includes(method)) {
    throw new Error('invalid program method: ' + method)
  }

  const err = VirtualMachine.check(method, params)

  if (err !== null) throw new Error(err)
}

export function verify_witness (
  contract : ContractData,
  witness  : WitnessData
) {
  // Unpack contract and witness objects.
  const { expires_at, published, status, terms } = contract
  const { action, path, prog_id, method, stamp } = witness
  // Assert that contract is active.
  assert.ok(status === 'active',      'contract is not active')
  // Get available pathnames from the contract terms.
  const pathnames = get_path_names(contract.terms.paths)
  // Get available programs from the contract terms.
  const programs  = terms.programs.map(e => create_program(e))
  // Find the matching program from the list via prog_id.
  const program   = programs.find(e => e.prog_id === prog_id)
  // Assert that the program exists.
  assert.ok(program !== undefined,    'program not found: ' + prog_id)
  // Unpack the program data object.
  const { actions, paths } = program
  // Assert that all conditions are valid.
  assert.ok(method === program.method, 'method does not match program')
  assert.ok(regex(action, actions),    'action not allowed in program')
  assert.ok(regex(path, paths),        'path not allowed in program')
  assert.ok(pathnames.includes(path),  'path does not exist in contract')
  assert.exists(expires_at)
  assert.ok(stamp >= published,        'stamp exists before published date')
  assert.ok(stamp < expires_at,        'stamp exists on or after expiration date')
  // Verify id and signatures of witness statement.
  verify_witness_sigs(witness)
}

export function verify_witness_sigs (
  witness : WitnessData
) {
  const { sigs, wid, ...tmpl } = witness
  const hash = get_witness_id(tmpl)

  assert.ok(hash === wid, 'computed hash does not equal witness id')

  const is_valid = sigs.every(e => {
    const pub = e.slice(0, 64)
    const sig = e.slice(64)
    return verify_sig(sig, wid, pub)
  })

  assert.ok(is_valid,     'signature verifcation failed')
}

export function verify_receipt (
  receipt : WitnessReceipt,
  result  : VMData
) {
  const { created_at, hash, id, pubkey, sig, ...data } = receipt

  const int_hash = get_receipt_hash(data)

  if (int_hash !== hash) {
    throw new Error('receipt hash does not match internal hash: ' + int_hash)
  }

  const int_id = get_receipt_id(hash, pubkey, created_at)

  if (int_hash !== hash) {
    throw new Error('receipt id does not match internal id: ' + int_id)
  }

  const is_valid = verify_sig(sig, id, pubkey)

  if (!is_valid) {
    throw new Error('receipt signature is invalid')
  }

  if (receipt.vmid !== result.vmid) {
    throw new Error('receipt does not match vmid: '   + result.vmid)
  } else if (receipt.step !== result.step) {
    throw new Error('receipt does not match step: '   + result.step)
  } else if (receipt.head !== result.head) {
    throw new Error('receipt does not match head: '   + result.head)
  } else if (receipt.stamp !== result.stamp) {
    throw new Error('receipt does not match stamp: '  + result.stamp)
  } else if (receipt.error !== result.error) {
    throw new Error('receipt does not match error: '  + result.error)
  } else if (receipt.output !== result.output) {
    throw new Error('receipt does not match output: ' + result.output)
  }
}

export function verify_exec (
  config     : VMConfig,
  receipt    : WitnessReceipt,
  statements : WitnessData[] = []
) {
  //
  const VM = new VirtualMachine(config)
  //
  for (const witness of statements) {
    //
    const eval_state = VM.eval(witness)
    //
    if (
      eval_state.error !== null ||
      eval_state.output !== null
    ) {
      verify_receipt(receipt, eval_state)
      return
    }
  }
  //
  const run_state = VM.run(receipt.stamp)
  //
  verify_receipt(receipt, run_state)
}
