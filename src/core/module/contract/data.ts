import { SPEND_TXIN_SIZE }          from '../../const.js'
import { assert, now, sort_record } from '../../util/index.js'
import { get_vm_id }                from '../../lib/vm.js'
import { GET_PUBLISH_STATE }        from './state.js'

import {
  ContractCreateConfig,
  ContractData,
  ContractRequest,
  ContractStatus,
  DepositData,
  SignerAPI,
  VMData
} from '../../types/index.js'

import {
  get_pay_total,
  get_proposal_id
} from '../../lib/proposal.js'

import {
  create_spend_templates,
  get_contract_id,
  get_deadline,
  get_max_vout_size,
  update_contract
} from './util.js'

/**
 * Returns a new ContractData object.
 */
export function create_contract (
  config  : ContractCreateConfig,
  request : ContractRequest,
  signer  : SignerAPI
) : ContractData {
  // Unpack config object.
  const { created_at = now(), feerate, fees } = config
  // Unpack request object.
  const { endorsements = [], proposal } = request
  // Define the funding input txfee.
  const fund_txfee = feerate * SPEND_TXIN_SIZE
  // Define or create the contract outputs.
  const outputs    = create_spend_templates(proposal, fees)
  // Define or compute the proposal id.
  const prop_id    = get_proposal_id(proposal)
  // Define or compute the contract id.
  const cid        = get_contract_id(outputs, prop_id, created_at)
  // Calculate the subtotal.
  const subtotal   = proposal.value + get_pay_total(fees)
  // Calculate the vout size of the tx output.
  const tx_bsize   = get_max_vout_size(outputs)
  // Return a completed contract.
  const template = {
    ...GET_PUBLISH_STATE(),
    cid,
    created_at,
    fees,
    deadline_at : get_deadline(proposal, created_at),
    endorsements,
    feerate,
    fund_txfee,
    moderator   : request.proposal.moderator ?? null,
    outputs,
    prop_id,
    server_pk   : signer.pubkey,
    sigs        : [],
    subtotal,
    terms       : sort_record(proposal),
    tx_bsize,
    updated_at  : created_at
  }
  return update_contract(template, signer, 'published')
}

export function cancel_contract (
  contract : ContractData,
  signer   : SignerAPI,
  canceled_at = now()
) : ContractData {
  const canceled = true as const
  const status   = 'canceled' as ContractStatus
  const changes  = { canceled, canceled_at }
  const updated  = { ...contract, ...changes, status, updated_at: canceled_at }
  return update_contract(updated, signer, status)
}

export function add_contract_funds (
  contract : ContractData,
  deposit  : DepositData
) {
  let { fund_count, fund_pend, fund_value } = contract
  if (deposit.confirmed) {
    fund_value += deposit.utxo.value
    fund_count += 1
  } else {
    fund_pend += deposit.utxo.value
  }
  return sort_record({ ...contract, fund_count, fund_pend, fund_value })
}

export function rem_contract_funds (
  contract : ContractData,
  deposit  : DepositData
) {
  let { fund_count, fund_pend, fund_value } = contract
  if (deposit.confirmed) {
    fund_value -= deposit.utxo.value
    fund_count -= 1
  } else {
    fund_pend -= deposit.utxo.value
  }
  return sort_record({ ...contract, fund_count, fund_pend, fund_value })
}

export function secure_contract (
  contract : ContractData,
  deposits : DepositData[],
  signer   : SignerAPI,
  updated_at = now()
) {
  assert.ok(!contract.canceled,               'contract has been canceled')
  assert.ok(deposits.every(e => e.confirmed), 'not all deposits are confirmed')

  const { feerate, fund_txfee, subtotal, tx_bsize } = contract

  const fund_count = deposits.length
  const fund_value = deposits.reduce((acc, nxt) => acc + nxt.utxo.value, 0)
  const tx_fees    = (feerate * tx_bsize) + (fund_txfee * deposits.length)
  const tx_vsize   = tx_bsize + (deposits.length * SPEND_TXIN_SIZE)
  const tx_total   = subtotal + tx_fees

  assert.ok(fund_value >= tx_total, `contract is under-funded: ${fund_value} < ${tx_total}`)

  const secured      = true as const
  const status       = 'secured' as ContractStatus
  const effective_at = contract.terms.effective ?? updated_at
  const tabs         = { fund_count, fund_pend: 0, fund_value }
  const changes      = { secured, effective_at, tx_fees, tx_total, tx_vsize }
  const updated      = { ...contract, ...tabs, ...changes, status, updated_at }
  return update_contract(updated, signer, status)
}

/**
 * Initializes the vm state and
 * returns the updated contract.
 */
export function activate_contract (
  contract  : ContractData,
  signer    : SignerAPI,
  active_at : number = now()
) : ContractData {
  // Define a hard expiration date.
  const activated   = true as const
  const expires_at  = active_at + contract.terms.duration
  const engine_vmid = get_vm_id(active_at, contract.cid, expires_at)
  const status      = 'active' as ContractStatus
  const updated_at  = active_at
  // Return the new contract and vm config.
  const changes = { activated, active_at, expires_at, engine_vmid }
  const updated = { ...contract, ...changes, status, updated_at }
  return update_contract(updated, signer, status)
}

export function close_contract (
  contract : ContractData,
  vmdata   : VMData,
  signer   : SignerAPI
) : ContractData {
  assert.ok(contract.activated, 'contract is not active')
  assert.ok(vmdata.closed,      'vm state is not closed')
  const closed      = true as const
  const engine_head = vmdata.head
  const closed_at   = vmdata.closed_at
  const engine_vout = vmdata.output
  const status      = 'closed' as ContractStatus
  const updated_at  = closed_at
  const changes     = { closed, closed_at, engine_head, engine_vout }
  const updated     = { ...contract, ...changes, status, updated_at }
  return update_contract(updated, signer, status)
}

export function spend_contract (
  contract    : ContractData,
  spent_txhex : string,
  spent_txid  : string,
  signer      : SignerAPI,
  spent_at    = now()
) : ContractData {
  const spent      = true as const
  const status     = 'spent' as ContractStatus
  const updated_at = spent_at
  const changes    = { spent, spent_txhex, spent_txid, spent_at }
  const updated    = { ...contract, ...changes, status, updated_at }
  return update_contract(updated, signer, status)
}

export function settle_contract (
  contract    : ContractData,
  signer      : SignerAPI,
  settled_at = now()
) : ContractData {
  const settled = true as const
  const status  = 'settled' as ContractStatus
  const changes = { settled, settled_at }
  const updated = { ...contract, ...changes, status, updated_at: settled_at }
  return update_contract(updated, signer, status)
}
