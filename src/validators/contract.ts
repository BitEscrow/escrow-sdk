import { get_path_names } from '@/lib/proposal.js'

import {
  eval_schedule,
  eval_witness,
  init_vm
} from '@/vm/main.js'

import {
  validate_witness,
  verify_witness
} from './program.js'

import {
  ContractData,
  StateData,
  WitnessData
} from '@/types/index.js'

import * as assert from '@/assert.js'
import * as schema from '@/schema/index.js'

export function validate_contract (
  contract : unknown
) : asserts contract is ContractData {
  void schema.contract.data.parse(contract)
}

export function validate_vmstate (
  vmstate : unknown
) : asserts vmstate is StateData {
  void schema.vm.data.parse(vmstate)
}

export function verify_execution (
  contract   : ContractData,
  statements : WitnessData[],
  vmstate    : StateData
) {
  const { activated, cid, terms }     = contract
  const { paths, programs, schedule } = terms
  assert.ok(activated !== null, 'contract is not activated')
  const pathnames = get_path_names(paths)
  const config    = { activated, cid, pathnames, programs, schedule }
  const timeout   = contract.updated_at
  let   int_state = init_vm(config)
  // For each signed witness statement:
  for (const wit of statements) {
    validate_witness(contract, wit)
    verify_witness(wit)
    // Evaluate the witness statement.
    int_state = eval_witness(int_state, wit)
    // Unpack the current state results:
    const { error, head, output } = int_state
    if (error !== null) throw new Error(error)
    if (output !== null) {
      assert.ok(head   === vmstate.head,   'internal state head does not match vmstate')
      assert.ok(output === vmstate.output, 'internal state output does not match vmstate')
      return
    }
  }
  // If the vm is still running, eval the timestamp.
  int_state = eval_schedule(int_state, timeout)
  assert.ok(int_state.head   === vmstate.head,   'internal state head does not match vmstate')
  assert.ok(int_state.output === vmstate.output, 'internal state output does not match vmstate')
}
