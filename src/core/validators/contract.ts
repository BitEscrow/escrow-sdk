/* Global Imports */

import { verify_sig } from '@cmdcode/crypto-tools/signer'

import {
  decode_tx,
  encode_tx,
  parse_txid
} from '@scrow/tapscript/tx'

/* Module Imports */

import { get_proposal_id } from '../lib/proposal.js'
import { create_txinput }  from '../lib/tx.js'
import { assert }          from '../util/index.js'

import {
  create_spend_templates,
  get_contract_id,
  get_spend_template,
  get_vm_id
} from '../lib/contract.js'

import {
  ContractData,
  ContractRequest,
  ProposalData,
  ServerPolicy,
  TxOutput,
  VMData,
  VirtualMachineAPI,
  WitnessReceipt
} from '../types/index.js'

import ContractSchema from '../schema/contract.js'

/* Local Imports */

import {
  validate_proposal,
  verify_proposal
} from './proposal.js'

import { verify_receipt } from './witness.js'

export function validate_contract (
  contract : unknown
) : asserts contract is ContractData {
  void ContractSchema.data.parse(contract)
}

export function verify_contract_req (
  machine : VirtualMachineAPI,
  policy  : ServerPolicy,
  request : ContractRequest
) {
  const { proposal, signatures } = request
  validate_proposal(proposal)
  verify_proposal(machine, policy, proposal)
  verify_endorsements(proposal, signatures)
}

export function verify_endorsements (
  proposal   : ProposalData,
  signatures : string[] = []
) {
  // List all pubkeys in proposal.
  const prop_id = get_proposal_id(proposal)
  for (const signature of signatures) {
    const pub = signature.slice(0, 64)
    const sig = signature.slice(64)
    assert.ok(verify_sig(sig, prop_id, pub), 'signature is invalid for pubkey: ' + pub)
  }
}

export function verify_contract (contract : ContractData) {
  const { outputs, published, server_pk, server_sig, terms } = contract
  const pid = get_proposal_id(terms)
  const cid = get_contract_id(outputs, pid, published)
  assert.ok(pid === contract.prop_id,         'computed terms id does not match contract')
  assert.ok(cid === contract.cid,             'computed cid id does not match contract')
  for (const [ label, txhex ] of outputs) {
    const tmpl = contract.outputs.find(e => e[0] === label)
    assert.ok(tmpl !== undefined, 'output template does not exist for label: ' + label)
    assert.ok(tmpl[1] === txhex,  'tx hex does not match output for label: ' + label)
  }
  assert.ok(verify_sig(server_sig, cid, server_pk), 'signature is invalid for server pubkey: ' + server_pk)
}

export function verify_publishing (
  contract  : ContractData,
  proposal  : ProposalData
) {
  const out = create_spend_templates(proposal, contract.fees)
  const pid = get_proposal_id(proposal)
  const cid = get_contract_id(out, pid, contract.published)
  assert.ok(pid === contract.prop_id, 'computed proposal id does not match contract')
  assert.ok(cid === contract.cid,     'computed contract id id does not match contract')
  verify_contract(contract)
}

export function verify_activation (
  contract : ContractData,
  state    : VMData
) {
  const { activated, cid } = contract
  assert.ok(activated !== null,            'contract activated date is null')
  const vmid = get_vm_id(cid, activated)
  assert.ok(vmid !== null,                 'contract vmid is null')
  assert.ok(activated === state.activated, 'contract activated date does not match vm')
  assert.ok(vmid === state.vmid,           'contract vmid does not match vm')
}

export function verify_execution (
  contract : ContractData,
  receipt  : WitnessReceipt,
  result   : VMData
) {
  // Verify the activation of the vm.
  verify_activation(contract, result)
  // Verify the final vm state with the receipt.
  verify_receipt(receipt, result)
}

export function verify_settlement (
  contract   : ContractData,
  result     : VMData,
  utxos      : TxOutput[]
) {
  // Unpack the contract object.
  const { spent_at, spent_txid } = contract
  // Assert the spent timestamp and txid exists.
  assert.ok(spent_at !== null,   'contract spent_at is null')
  assert.ok(spent_txid !== null, 'contract spent_txid is null')
  // Verify the activation of the vm.
  verify_activation(contract, result)
  // Run the vm up to the final timestamp.
  assert.ok(result.stamp === spent_at, 'contract spent_at does not match vm result')
  // Assert the state output is not null.
  assert.ok(result.output !== null, 'result vm output is null')
  // Get the spend template for the provided output.
  const output = get_spend_template(result.output, contract.outputs)
  // Convert the output into a txdata object.
  const txdata = decode_tx(output, false)
  // Add each utxo to the txdata object.
  for (const utxo of utxos) {
    const vin = create_txinput(utxo)
    txdata.vin.push(vin)
  }
  // Encode the new tx as a segwit transaction.
  const txhex = encode_tx(txdata)
  // Compute the final transaction id.
  const txid  = parse_txid(txhex)
  // Assert that the transaction id matches.
  assert.ok(txid === contract.spent_txid, 'settlement txid does not match contract')
}
