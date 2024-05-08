import { SPEND_TXIN_SIZE }          from '../../const.js'
import { assert, now, sort_record } from '../../util/index.js'
import { GET_INIT_SPEND_STATE }     from '../../lib/tx.js'
import { get_vm_id }                from '../../lib/vm.js'

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
  get_max_vout_size
} from './util.js'

export const GET_INIT_CANCEL_STATE = () => {
  return {
    canceled    : false as const,
    canceled_at : null
  }
}

export const GET_INIT_ACTIVE_STATE = () => {
  return {
    activated   : false as const,
    active_at   : null,
    active_head : null,
    expires_at  : null,
    vmid        : null
  }
}

export const GET_INIT_CLOSE_STATE = () => {
  return {
    closed      : false as const,
    closed_at   : null,
    closed_path : null
  }
}

const GET_CONTRACT_DEFAULTS = () => {
  return {
    ...GET_INIT_CANCEL_STATE(),
    ...GET_INIT_ACTIVE_STATE(),
    ...GET_INIT_CLOSE_STATE(),
    ...GET_INIT_SPEND_STATE(),
    fund_count : 0,
    fund_pend  : 0,
    fund_value : 0,
    status     : 'published' as ContractStatus
  }
}

/**
 * Returns a new ContractData object.
 */
export function create_contract (
  config  : ContractCreateConfig,
  request : ContractRequest,
  signer  : SignerAPI
) : ContractData {
  // Unpack config object.
  const { feerate, fees } = config
  // Unpack request object.
  const { proposal, signatures = [] } = request
  // Define the funding input txfee.
  const fund_txfee = feerate * SPEND_TXIN_SIZE
  // Define or create the contract outputs.
  const outputs    = create_spend_templates(proposal, fees)
  // Define or compute the proposal id.
  const prop_id    = get_proposal_id(proposal)
  // Define or compute the published date.
  const created_at = config.created_at ?? now()
  // Define or compute the contract id.
  const cid        = get_contract_id(outputs, prop_id, created_at)
  // Calculate the subtotal.
  const subtotal   = proposal.value + get_pay_total(fees)
  // Calculate the vout size of the tx output.
  const tx_bsize   = get_max_vout_size(outputs)
  // Calculate the fee rate of the contract tx.
  const tx_fees    = tx_bsize * feerate
  // Return a completed contract.
  return sort_record({
    ...GET_CONTRACT_DEFAULTS(),
    cid,
    created_at,
    fees,
    deadline_at  : get_deadline(proposal, created_at),
    effective_at : proposal.effective ?? null,
    feerate,
    fund_txfee,
    moderator    : request.proposal.moderator ?? null,
    outputs,
    prop_id,
    pubkeys      : signatures.map(e => e.slice(0, 64)),
    server_pk    : signer.pubkey,
    server_sig   : signer.sign(cid),
    signatures,
    subtotal,
    terms        : proposal,
    tx_fees,
    tx_bsize,
    tx_vsize     : tx_bsize,
    tx_total     : subtotal + tx_fees,
    updated_at   : created_at
  })
}

export function fund_contract (
  contract : ContractData,
  deposit  : DepositData
) {
  const fund_value = (deposit.confirmed)
    ? contract.fund_value + deposit.utxo.value
    : contract.fund_value
  const fund_pend  = (deposit.confirmed)
    ? contract.fund_pend
    : contract.fund_pend + deposit.utxo.value
  const fund_count = contract.fund_count + 1
  const tx_fees    = contract.tx_fees    + contract.fund_txfee
  const tx_vsize   = contract.tx_vsize   + SPEND_TXIN_SIZE
  const tx_total   = contract.subtotal   + tx_fees
  return sort_record({ ...contract, fund_count, fund_pend, fund_value, tx_fees, tx_vsize, tx_total })
}

/**
 * Initializes the vm state and
 * returns the updated contract.
 */
export function activate_contract (
  contract  : ContractData,
  active_at : number = now()
) : ContractData {
  // Define a hard expiration date.
  const expires_at  = active_at + contract.terms.duration
  const vmid        = get_vm_id(active_at, contract.cid, expires_at)
  const active_head = vmid
  const status      = 'active' as ContractStatus
  // Return the new contract and vm config.
  return { ...contract, activated: true, active_at, active_head, expires_at, status, vmid }
}

export function close_contract (
  contract : ContractData,
  vmdata   : VMData
) : ContractData {
  assert.ok(contract.activated, 'contract is not active')
  assert.ok(vmdata.closed,      'vm state is not closed')
  const status      = 'closed' as ContractStatus
  const active_head = vmdata.head
  const closed_at   = vmdata.closed_at
  const closed_path = vmdata.output
  const updated_at  = closed_at
  return { ...contract, active_head, closed_at, closed_path, status, updated_at, closed: true }
}

export function spend_contract (
  contract    : ContractData,
  spent_txhex : string,
  spent_txid  : string,
  spent_at    = now()
) : ContractData {
  const status     = 'spent' as ContractStatus
  const updated_at = spent_at
  return { ...contract, spent_txhex, spent_txid, spent_at, status, updated_at, spent: true }
}
