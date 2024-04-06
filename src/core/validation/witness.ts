/* Local Imports */

import { verify_sig } from '@cmdcode/crypto-tools/signer'

/* Module Imports */

import { get_witness_id } from '../lib/witness.js'
import { assert, regex }  from '../util/index.js'

import {
  Literal,
  ProgramData,
  VMData,
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
  if (!machine.methods.includes(method)) {
    throw new Error('invalid program method: ' + method)
  }

  const err = machine.check(method, params)

  if (err !== null) throw new Error(err)
}

export function verify_witness (
  vmdata  : VMData,
  witness : WitnessData
) {
  // Unpack data objects.
  const { active_at, commit_at, expires_at, output, pathnames } = vmdata
  const { sigs, wid, ...tmpl }                   = witness
  const { action, path, prog_id, method, stamp } = tmpl
  // Find the matching program from the list via prog_id.
  const program = vmdata.programs.find(e => e.prog_id === prog_id)
  // Assert that the program exists.
  assert.ok(program !== undefined,     'program not found: ' + prog_id)
  // Unpack the program data object.
  const { actions, paths } = program
  // Compute witness id hash.
  const hash = get_witness_id(tmpl)
  // Assert that all conditions are valid.
  assert.ok(hash === wid,              'computed hash does not equal witness id')
  assert.ok(method === program.method, 'method does not match program')
  assert.ok(regex(action, actions),    'action not allowed in program')
  assert.ok(regex(path, paths),        'path not allowed in program')
  assert.ok(pathnames.includes(path),  'path does not exist in vm')
  assert.ok(stamp >= active_at,        'stamp exists before active date')
  assert.ok(stamp >= commit_at,        'stamp exists before latest commit')
  assert.ok(stamp < expires_at,        'stamp exists on or after close date')
  assert.ok(output === null,           'vm has already closed on an output')
  verify_witness_sigs(program, witness)
}

export function verify_witness_sigs (
  program : ProgramData,
  witness : WitnessData
) {
  const { params, prog_id } = program
  const { sigs, wid }       = witness
  assert.ok(prog_id === witness.prog_id, 'program id does not match witness')
  sigs.forEach(e => {
    const pub = e.slice(0, 64)
    const sig = e.slice(64)
    assert.ok(params.includes(pub), 'pubkey not included in program: ' + pub)
    const is_valid = verify_sig(sig, wid, pub)
    assert.ok(is_valid, 'signature verifcation failed')
  })
}
