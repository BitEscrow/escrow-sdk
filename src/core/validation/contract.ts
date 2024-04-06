/* Global Imports */

import { verify_sig } from '@cmdcode/crypto-tools/signer'

import {
  decode_tx,
  encode_tx
} from '@scrow/tapscript/tx'

/* Module Imports */

import { get_proposal_id } from '../lib/proposal.js'
import { assert }          from '../util/index.js'

import {
  create_txinput,
  get_txid
} from '../lib/tx.js'

import {
  create_spend_templates,
  get_contract_id,
  get_spend_template,
  tabulate_funds
} from '../lib/contract.js'

import {
  ContractData,
  ContractRequest,
  FundingData,
  ProposalData,
  ServerPolicy,
  VMData,
  VirtualMachineAPI
} from '../types/index.js'

import ContractSchema from '../schema/contract.js'

/* Local Imports */

import { validate_proposal, verify_proposal } from './proposal.js'

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
  const { created_at, outputs, server_pk, server_sig, terms } = contract
  const pid = get_proposal_id(terms)
  const cid = get_contract_id(outputs, pid, created_at)
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
  const cid = get_contract_id(out, pid, contract.created_at)
  assert.ok(pid === contract.prop_id, 'computed proposal id does not match contract')
  assert.ok(cid === contract.cid,     'computed contract id id does not match contract')
  verify_contract(contract)
}

export function verify_funding (
  contract : ContractData,
  funds    : FundingData[]
) {
  const { fund_count, fund_pend, fund_value, tx_fees, tx_total, tx_vsize } = contract
  const tab    = tabulate_funds(contract, funds)
  const vtotal = fund_pend + fund_value
  assert.ok(fund_count === tab.fund_count, 'tabulated funds count does not match contract')
  assert.ok(vtotal     === tab.fund_value, 'tabulated funds value does not match contract')
  assert.ok(tx_fees    === tab.tx_fees,    'tabulated tx fees does not match contract')
  assert.ok(tx_total   === tab.tx_total,   'tabulated tx total does not match contract')
  assert.ok(tx_vsize   === tab.tx_vsize,   'tabulated tx size does not match contract')
}

export function verify_activation (
  contract : ContractData,
  vmstate  : VMData
) {
  const { activated, active_at, active_vm, expires_at } = contract
  assert.ok(activated,                       'contract is not flagged as active')
  assert.ok(active_at === vmstate.active_at, 'contract activated date does not match vm')
  assert.ok(active_vm === vmstate.vmid,      'contract vmid does not match vm internal id')
  const expires_chk = active_at + contract.terms.duration
  assert.ok(expires_at === expires_chk,      'computed expiration date does not match contract')
}

export function verify_closing (
  contract : ContractData,
  vmstate  : VMData
) {
  assert.ok(vmstate.updated_at === contract.closed_at,   'contract closed_at does not match vm result')
  assert.ok(vmstate.head       === contract.closed_hash, 'contract closed_hash does not match vm result')
  assert.ok(vmstate.output     === contract.closed_path, 'contract closed_path does not match vm result')
}

export function verify_settlement (
  contract   : ContractData,
  funds      : FundingData[],
  vmstate    : VMData
) {
  assert.ok(contract.closed,         'contract is not closed')
  assert.ok(contract.spent,          'contract is not settled')
  assert.ok(vmstate.output !== null, 'vmstate is not closed')
  // Verify contract funds.
  verify_funding(contract, funds)
  // Verify the activation of the vm.
  verify_activation(contract, vmstate)
  // Verify the closing of the vm.
  verify_closing(contract, vmstate)
  // Get the spend template for the provided output.
  const output = get_spend_template(vmstate.output, contract.outputs)
  // Convert the output into a txdata object.
  const txdata = decode_tx(output, false)
  // Collect utxos from funds.
  const utxos = funds.map(e => e.utxo)
  // Add each utxo to the txdata object.
  for (const utxo of utxos) {
    const vin = create_txinput(utxo)
    txdata.vin.push(vin)
  }
  // Encode the new tx as a segwit transaction.
  const txhex = encode_tx(txdata)
  // Compute the final transaction id.
  const txid  = get_txid(txhex)
  // Assert that the transaction id matches.
  assert.ok(txid === contract.spent_txid, 'settlement txid does not match contract')
}
