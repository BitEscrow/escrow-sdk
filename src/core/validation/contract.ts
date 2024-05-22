import { decode_tx, encode_tx }     from '@scrow/tapscript/tx'
import { assert }                   from '@/core/util/index.js'
import { get_machine_config }       from '@/core/module/machine/util.js'
import { create_txinput, get_txid } from '@/core/lib/tx.js'

import {
  get_proposal_id,
  verify_endorsement
} from '../lib/proposal.js'

import {
  validate_proposal_data,
  verify_proposal_data
} from './proposal.js'

import {
  create_spend_templates,
  get_contract_id,
  get_spend_template,
  tabulate_funds,
  verify_contract_sig
} from '../module/contract/util.js'

import {
  ContractData,
  ContractPublishRequest,
  FundingData,
  ProposalData,
  MachineData,
  ScriptEngineAPI,
  WitnessInput,
  ProposalPolicy,
  ContractSession
} from '../types/index.js'

import ContractSchema from '../schema/contract.js'
import DepositSchema  from '../schema/deposit.js'

export function validate_publish_req (
  request : unknown
) : asserts request is ContractPublishRequest {
  void ContractSchema.publish_req.parse(request)
}

export function validate_contract_data (
  contract : unknown
) : asserts contract is ContractData {
  void ContractSchema.data.parse(contract)
}

export function validate_contract_funds (
  funds : FundingData[]
) {
  void DepositSchema.fund.array().parse(funds)
}

export function validate_contract_session (
  session : unknown
) : asserts session is ContractSession {
  void ContractSchema.session.parse(session)
}

export function verify_publish_req (
  machine : ScriptEngineAPI,
  policy  : ProposalPolicy,
  request : ContractPublishRequest
) {
  const { endorsements, proposal } = request
  validate_proposal_data(proposal)
  verify_proposal_data(machine, policy, proposal)
  verify_endorsements(proposal, endorsements)
}

export function verify_contract_publishing (
  contract : ContractData,
  proposal : ProposalData
) {
  const { created_at, fees } = contract
  const out = create_spend_templates(proposal, fees)
  const pid = get_proposal_id(proposal)
  const cid = get_contract_id(out, pid, created_at)
  assert.ok(pid === contract.prop_id, 'computed proposal id does not match contract')
  assert.ok(cid === contract.cid,     'computed contract id id does not match contract')
  for (const [ label, txhex ] of out) {
    const tmpl = contract.outputs.find(e => e[0] === label)
    assert.ok(tmpl !== undefined,     'output template does not exist for label: ' + label)
    assert.ok(tmpl[1] === txhex,      'tx hex does not match output for label: ' + label)
  }
}

export function verify_endorsements (
  proposal   : ProposalData,
  signatures : string[] = []
) {
  // List all pubkeys in proposal.
  const prop_id = get_proposal_id(proposal)
  for (const sig of signatures) {
    const pub = sig.slice(0, 64)
    const is_valid = verify_endorsement(prop_id, sig)
    assert.ok(is_valid, 'signature is invalid for pubkey: ' + pub)
  }
}

export function verify_contract_data (contract : ContractData) {
  const { created_at, outputs, terms } = contract
  const pid = get_proposal_id(terms)
  const cid = get_contract_id(outputs, pid, created_at)
  assert.ok(pid === contract.prop_id, 'computed terms id does not match contract')
  assert.ok(cid === contract.cid,     'computed cid id does not match contract')
  for (const [ label, txhex ] of outputs) {
    const tmpl = contract.outputs.find(e => e[0] === label)
    assert.ok(tmpl !== undefined,     'output template does not exist for label: ' + label)
    assert.ok(tmpl[1] === txhex,      'tx hex does not match output for label: ' + label)
  }
}

export function verify_contract_sigs (
  contract : ContractData,
  pubkey : string
) {
  verify_contract_sig(contract, pubkey, 'published')
  if (contract.canceled)  verify_contract_sig(contract, pubkey, 'canceled')
  if (contract.secured)   verify_contract_sig(contract, pubkey, 'secured')
  if (contract.activated) verify_contract_sig(contract, pubkey, 'active')
  if (contract.closed)    verify_contract_sig(contract, pubkey, 'closed')
  if (contract.spent)     verify_contract_sig(contract, pubkey, 'spent')
  if (contract.settled)   verify_contract_sig(contract, pubkey, 'settled')
}

export function verify_contract_funding (
  contract : ContractData,
  funds    : FundingData[]
) {
  const { funds_pend, funds_conf, tx_fees, tx_total, tx_vsize, vin_count } = contract
  const tab    = tabulate_funds(contract, funds)
  const vtotal = funds_pend + funds_conf
  assert.ok(vin_count  === tab.vin_count,  'tabulated funds count does not match contract')
  assert.ok(vtotal     === tab.fund_value, 'tabulated funds value does not match contract')
  assert.ok(tx_fees    === tab.tx_fees,    'tabulated tx fees does not match contract')
  assert.ok(tx_total   === tab.tx_total,   'tabulated tx total does not match contract')
  assert.ok(tx_vsize   === tab.tx_vsize,   'tabulated tx size does not match contract')
}

export function verify_contract_activation (
  contract : ContractData,
  vmdata   : MachineData
) {
  const { activated, active_at, canceled, expires_at, machine_vmid } = contract
  assert.ok(!canceled,                       'contract is flagged as canceled')
  assert.ok(activated,                       'contract is not flagged as active')
  assert.ok(active_at === vmdata.active_at, 'contract activated date does not match vm')
  assert.ok(machine_vmid === vmdata.vmid,    'contract vmid does not match vm internal id')
  const expires_chk = active_at + contract.terms.duration
  assert.ok(expires_at === expires_chk,      'computed expiration date does not match contract')
}

export function verify_contract_execution (
  contract : ContractData,
  engine   : ScriptEngineAPI,
  vmdata   : MachineData,
  witness  : WitnessInput[]
) {
  const config  = get_machine_config(contract)
    let vmstate = engine.init(config)
  witness.forEach(wit => { vmstate = engine.eval(vmstate, wit) })
  assert.ok(vmstate.active_at  === vmdata.active_at,   'vmdata.active_at does not match vm result')
  assert.ok(vmstate.closed     === vmdata.closed,      'vmdata.closed    does not match vm result')
  assert.ok(vmstate.closed_at  === vmdata.closed_at,   'vmdata.closed_at does not match vm result')
  assert.ok(vmstate.commit_at  === vmdata.commit_at,   'vmdata.commit_at does not match vm result')
  assert.ok(vmstate.engine     === vmdata.engine,      'vmdata.engine does not match vm result')
  assert.ok(vmstate.expires_at === vmdata.expires_at,  'vmdata.expires_at does not match vm result')
  assert.ok(vmstate.head       === vmdata.head,        'vmdata.head      does not match vm result')
  assert.ok(vmstate.output     === vmdata.output,      'vmdata.output    does not match vm result')
  assert.ok(vmstate.step       === vmdata.step,        'vmdata.step does not match vm result')
  assert.ok(vmstate.vmid       === vmdata.vmid,        'vmdata.vmid does not match vm result')
}

export function verify_contract_close (
  contract : ContractData,
  vmstate  : MachineData
) {
  assert.ok(vmstate.closed,  'vm state is not closed')
  assert.ok(contract.closed, 'contract is not closed')
  assert.ok(vmstate.closed_at === contract.closed_at,   'contract closed_at does not match vm result')
  assert.ok(vmstate.head      === contract.machine_head, 'contract active_head does not match vm result')
  assert.ok(vmstate.output    === contract.machine_vout, 'contract closed_path does not match vm result')
}

export function verify_contract_spending (
  contract   : ContractData,
  funds      : FundingData[]
) {
  assert.ok(contract.closed,          'contract is not closed')
  assert.ok(contract.spent,           'contract is not settled')
  assert.exists(contract.machine_vout, 'contract has null output')
  // Get the spend template for the provided output.
  const output = get_spend_template(contract.machine_vout, contract.outputs)
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
  assert.ok(txid === contract.spent_txid, 'spent txid does not match contract')
}

export function verify_contract_settlement (
  contract   : ContractData,
  engine     : ScriptEngineAPI,
  funds      : FundingData[],
  statements : WitnessInput[],
  vmdata     : MachineData
) {
  verify_contract_data(contract)
  verify_contract_funding(contract, funds)
  verify_contract_activation(contract, vmdata)
  verify_contract_execution(contract, engine, vmdata, statements)
  verify_contract_close(contract, vmdata)
  verify_contract_spending(contract, funds)
}

export function verify_contract_session (session : ContractSession) {
  const { contract, engine, funds, statements, vmdata } = session

  validate_contract_session(session)
  verify_contract_data(contract)

  let vmstate = vmdata

  if (engine !== undefined) {
    const config = get_machine_config(contract)
    vmstate = engine.init(config)
  }

  const can_exec = (
    engine     !== undefined &&
    statements !== undefined &&
    vmstate    !== undefined
  )

  if (can_exec && vmstate !== undefined) {
    vmstate = engine.eval(vmstate, statements)
  }

  if (contract.secured && funds !== undefined) {
    verify_contract_funding(contract, funds)
  }

  if (contract.activated && vmstate !== undefined) {
    verify_contract_activation(contract, vmstate)
  }

  if (contract.activated && can_exec && vmstate !== undefined) {
    verify_contract_execution(contract, engine, vmstate, statements)
  }

  if (contract.closed && vmstate !== undefined) {
    verify_contract_close(contract, vmstate)
  }

  if (contract.spent && funds !== undefined) {
    verify_contract_spending(contract, funds)
  }
}

export default {
  validate : {
    request : validate_publish_req,
    data    : validate_contract_data,
    session : validate_contract_session
  },
  verify : {
    request      : verify_publish_req,
    published    : verify_contract_publishing,
    endorsements : verify_endorsements,
    data         : verify_contract_data,
    secured      : verify_contract_funding,
    active       : verify_contract_activation,
    execution    : verify_contract_execution,
    closed       : verify_contract_close,
    spend        : verify_contract_spending,
    session      : verify_contract_session,
    settlement   : verify_contract_settlement,
    signatures   : verify_contract_sigs
  }
}
