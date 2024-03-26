import { verify_sig } from '@cmdcode/crypto-tools/signer'

import * as assert from '@/assert.js'

import { get_path_names, get_proposal_id } from '../lib/proposal.js'

import {
  validate_witness,
  verify_witness
} from './vm.js'

import {
  validate_proposal,
  verify_proposal
} from './proposal.js'

import {
  ContractData,
  ContractRequest,
  ProposalData,
  WitnessData
} from '../types/index.js'

import ContractSchema from '../schema/contract.js'

export function validate_contract (
  contract : unknown
) : asserts contract is ContractData {
  void ContractSchema.data.parse(contract)
}

export function verify_contract_req (
  request : ContractRequest
) {
  const { proposal, signatures } = request
  validate_proposal(proposal)
  verify_proposal(proposal)
  verify_endorsements(proposal, signatures)
}

export function verify_contract (
  contract  : ContractData,
  proposal  : ProposalData,
  server_pk : string
) {
  // Verify proposal id and cid.
  // Verify contract outputs.
  // Verify contract signature.
}

export function verify_settlement (
  contract   : ContractData,
  statements : WitnessData[],
  txid       : string
) {
  // verify execution of vm, and on-chain transaction.
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

export function verify_endorsements (
  proposal   : ProposalData,
  signatures : string[]
) {
  // List all pubkeys in proposal.
  const prop_id = get_proposal_id(proposal)
  for (const signature of signatures) {
    const pub = signature.slice(0, 64)
    const sig = signature.slice(64)
    assert.ok(verify_sig(sig, prop_id, pub), 'signature is invalid for pubkey: ' + pub)
  }
}
