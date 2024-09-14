import { verify_sig }    from '@cmdcode/crypto-tools/signer'
import { assert, regex } from '@/util/index.js'

import {
  get_commit_id,
  get_witness_id
} from '@/core/module/witness/util.js'

import {
  ProgramData,
  MachineData,
  WitnessData,
  WitnessReceipt
} from '@/core/types/index.js'

import WitSchema from '@/core/schema/witness.js'

export function validate_witness_data (
  witness : unknown
) : asserts witness is WitnessData {
  void WitSchema.data.parse(witness)
}

export function validate_witness_receipt (
  witness : unknown
) : asserts witness is WitnessReceipt {
  void WitSchema.receipt.parse(witness)
}

export function verify_witness_data (
  vmdata  : MachineData,
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
  assert.ok(stamp >= active_at,        'stamp exists before active date')
  assert.ok(stamp >= commit_at,        'stamp exists before latest commit')
  assert.ok(stamp < expires_at,        'stamp exists on or after expiration date')
  assert.ok(output === null,           'vm has already closed on an output')

  if (path !== null) {
    assert.exists(paths,                 'paths set to null in program')
    assert.ok(regex(path, paths),        'path not allowed in program')
    assert.ok(pathnames.includes(path),  'path does not exist in vm')
  }

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

export function verify_witness_receipt (
  receipt : WitnessReceipt,
  vminput : WitnessData,
  vmstate : MachineData
) {
  const { commit_id, commit_sig, agent_pk } = receipt

  // Don't forget to check that vm matches commit.
  assert.ok(vminput.wid       === receipt.wid,       'receipt wid does not match witness input')
  assert.ok(vmstate.vmid      === receipt.vmid,      'provided vmstate and witness vmid does not match')
  assert.ok(vmstate.commit_at === receipt.stamp,     'provided vmstate and witness stamp does not match')
  assert.ok(vmstate.head      === receipt.vm_head,   'input vm_head does not match vmstate head')
  assert.ok(vmstate.output    === receipt.vm_output, 'input vm_output does not match vmstate output')
  assert.ok(vmstate.step      === receipt.vm_step,   'input vm_step does not match vmstate step count')

  const int_wid  = get_witness_id(receipt)
  const int_rid  = get_commit_id(receipt)

  assert.ok(int_wid === receipt.wid,       'internal witness id does not match commit')
  assert.ok(int_rid === receipt.commit_id, 'internal commit id does not match commit')

  const is_valid = verify_sig(commit_sig, commit_id, agent_pk)

  assert.ok(is_valid, 'receipt signature is invalid')
}

export default {
  validate : {
    data    : validate_witness_data,
    receipt : validate_witness_receipt
  },
  verify : {
    data       : verify_witness_data,
    receipt    : verify_witness_receipt,
    signatures : verify_witness_sigs
  }
}
