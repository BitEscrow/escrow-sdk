/* Local Imports */

import { verify_sig } from '@cmdcode/crypto-tools/signer'

/* Module Imports */

import { get_path_names } from '../lib/proposal.js'
import { create_program } from '../lib/vm.js'
import { get_witness_id } from '../lib/witness.js'
import { assert, regex }  from '../util/index.js'

import {
  ContractData,
  Literal,
  VirtualMachineAPI,
  WitnessData
} from '../types/index.js'

import WitSchema from '../schema/witness.js'

export function validate_witness (
  witness : unknown
) : asserts witness is WitnessData {
  WitSchema.data.parse(witness)
}

export function verify_program (
  machine : VirtualMachineAPI,
  method  : string,
  params  : Literal[]
) {
  if (!machine.VALID_METHODS.includes(method)) {
    throw new Error('invalid program method: ' + method)
  }

  const err = machine.check(method, params)

  if (err !== null) throw new Error(err)
}

export function verify_witness (
  contract : ContractData,
  witness  : WitnessData
) {
  // Unpack contract and witness objects.
  const { active_at, expires_at, status, terms } = contract
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
  assert.ok(stamp >= active_at,        'stamp exists before published date')
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
