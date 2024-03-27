import { verify_sig } from '@cmdcode/crypto-tools/signer'

import * as assert       from '@/assert.js'
import { VALID_METHODS } from '@/config.js'
import { Literal }       from '@/types.js'
import { regex }         from '@/util.js'
import { VM }            from '@/vm/index.js'

import { get_path_names } from '../lib/proposal.js'

import {
  create_program,
  create_vm_hash,
  get_witness_id
} from '../lib/vm.js'

import {
  ContractData,
  ProgramEntry,
  VMBase,
  VMReceipt,
  WitnessData
} from '../types/index.js'

import ProgSchema from '../schema/vm.js'

export function validate_program (
  program : unknown
) : asserts program is ProgramEntry {
  ProgSchema.terms.parse(program)
}

export function validate_witness (
  witness : unknown
) : asserts witness is WitnessData {
  ProgSchema.witness.parse(witness)
}

export function verify_program (
  method : string,
  params : Literal[]
) {
  if (!VALID_METHODS.includes(method)) {
    throw new Error('invalid program method: ' + method)
  }

  const program = VM.methods[method]

  assert.ok(program !== undefined, 'program method does not exist in vm: ' + method)

  const err = program.verify(params)

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

export function verify_vm_receipt (
  receipt   : VMReceipt,
  server_pk : string,
  vm_state  : VMBase
) {
  const { head, updated, vmid } = vm_state
  assert.ok(head    === receipt.head,    'vm commit head does not match receipt')
  assert.ok(updated === receipt.updated, 'vm updated timestamp does not match receipt')
  assert.ok(vmid    === receipt.vmid,    'vm identifier does not match receipt')
  const vm_hash  = create_vm_hash(head, vmid, updated)
  const is_valid = verify_sig(receipt.sig, vm_hash, server_pk)
  assert.ok(is_valid, 'receipt signature is invalid for pubkey: ' + server_pk)
}
