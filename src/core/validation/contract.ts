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
  const { activated, expires_at } = contract
  assert.ok(activated !== null,              'contract activated date is null')
  assert.ok(activated === vmstate.activated, 'contract activated date does not match vm')
  const expires_chk = activated + contract.terms.duration
  assert.ok(expires_at === expires_chk,      'computed expiration date does not match contract')
}

export function verify_settlement (
  contract   : ContractData,
  funds      : FundingData[],
  result     : VMData
) {
  // Unpack the contract object.
  const { spent_at, spent_txid } = contract
  // Assert the spent timestamp and txid exists.
  assert.ok(spent_at !== null,   'contract spent_at is null')
  assert.ok(spent_txid !== null, 'contract spent_txid is null')
  // Verify contract funds.
  verify_funding(contract, funds)
  // Verify the activation of the vm.
  verify_activation(contract, result)
  // Run the vm up to the final timestamp.
  assert.ok(result.updated === spent_at, 'contract spent_at does not match vm result')
  // Assert the state output is not null.
  assert.ok(result.output !== null, 'result vm output is null')
  // Get the spend template for the provided output.
  const output = get_spend_template(result.output, contract.outputs)
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
  const txid  = parse_txid(txhex)
  // Assert that the transaction id matches.
  assert.ok(txid === contract.spent_txid, 'settlement txid does not match contract')
}
