import { verify_sig }    from '@cmdcode/crypto-tools/signer'
import { assert, regex } from '@/core/util/index.js'

import {
  get_commit_id,
  get_witness_id
} from '@/core/module/witness/util.js'

import {
  Literal,
  ProgramData,
  ProgramEntry,
  MachineData,
  ScriptEngineAPI,
  WitnessInput,
  WitnessData
} from '@/core/types/index.js'

import PropSchema from '@/core/schema/proposal.js'
import VMSchema   from '@/core/schema/machine.js'
import WitSchema  from '@/core/schema/witness.js'

export function validate_program_entry (
  program : unknown
) : asserts program is ProgramEntry {
  void PropSchema.program.parse(program)
}

export function validate_vm_data (
  vmdata : MachineData
) {
 void VMSchema.data.parse(vmdata)
}

export function validate_witness_data (
  witness : unknown
) : asserts witness is WitnessInput {
  void WitSchema.data.parse(witness)
}

export function verify_program_entry (
  machine : ScriptEngineAPI,
  method  : string,
  params  : Literal[]
) {
  if (!machine.methods.includes(method)) {
    throw new Error('invalid program method: ' + method)
  }

  const err = machine.verify(method, params)

  if (err !== null) throw new Error(err)
}

export function verify_witness_data (
  vmdata  : MachineData,
  witness : WitnessInput
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
  assert.ok(stamp < expires_at,        'stamp exists on or after expiration date')
  assert.ok(output === null,           'vm has already closed on an output')
  verify_witness_sigs(program, witness)
}

export function verify_witness_sigs (
  program : ProgramData,
  witness : WitnessInput
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

export function verify_witness_commit (
  commit  : WitnessData,
  vmstate : MachineData,
  witness : WitnessInput
) {
  const { commit_id, commit_sig, agent_pk } = commit

  // Don't forget to check that vm matches commit.
  assert.ok(witness.vmid  === vmstate.vmid,       'provided vmstate and witness vmid does not match')
  assert.ok(witness.stamp === vmstate.commit_at,  'provided vmstate and witness stamp does not match')
  assert.ok(witness.vmid  === commit.vmid,       'commit vmid does not match witness')
  assert.ok(vmstate.head   === commit.vm_head,    'commit vm_head does not match vmstate head')
  assert.ok(vmstate.output === commit.vm_output,  'commit vm_output does not match vmstate output')
  assert.ok(vmstate.step   === commit.vm_step,    'commit vm_step does not match vmstate step count')

  const int_wid  = get_witness_id(commit)
  const int_rid  = get_commit_id(commit)

  assert.ok(int_wid === witness.wid,             'internal witness id does not match commit')
  assert.ok(int_rid === commit.commit_id,        'internal commit id does not match commit')

  const is_valid = verify_sig(commit_sig, commit_id, agent_pk)

  assert.ok(is_valid, 'commit signature is invalid')
}

export default {
  validate : {
    program : validate_program_entry,
    witness : validate_witness_data
  },
  verify : {
    program    : verify_program_entry,
    data       : verify_witness_data,
    commit     : verify_witness_commit,
    signatures : verify_witness_sigs
  }
}
