import { assert, now, sort_record } from '@/core/util/index.js'
import { get_machine_id }           from '@/core/module/machine/util.js'
import { SPEND_TXIN_SIZE }          from '@/core/const.js'
import { GET_PUBLISH_STATE }        from './state.js'

import {
  ContractCreateConfig,
  ContractData,
  ContractPublishRequest,
  ContractStatus,
  DepositData,
  SignerAPI,
  MachineData
} from '@/core/types/index.js'

import {
  get_pay_total,
  get_proposal_id
} from '@/core/lib/proposal.js'

import {
  create_spend_templates,
  get_contract_id,
  get_deadline,
  get_max_vout_size,
  notarize_contract
} from './util.js'

/**
 * Returns a new ContractData object.
 */
export function create_contract (
  config  : ContractCreateConfig,
  request : ContractPublishRequest,
  signer  : SignerAPI
) : ContractData {
  // Unpack config object.
  const { created_at = now(), feerate, fees } = config
  // Unpack request object.
  const { endorsements = [], proposal } = request
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
  // Calculate the transaction fees.
  const tx_fees    = tx_bsize * feerate
  // Return a completed contract.
  const template   = {
    ...GET_PUBLISH_STATE(),
    agent_pk    : signer.pubkey,
    cid,
    created_at,
    fees,
    deadline_at : get_deadline(proposal, created_at),
    endorsements,
    feerate,
    moderator   : request.proposal.moderator ?? null,
    outputs,
    prop_id,
    subtotal,
    terms       : sort_record(proposal),
    tx_bsize,
    tx_fees,
    tx_total    : subtotal + tx_fees,
    tx_vsize    : tx_bsize,
    updated_at  : created_at,
    vin_txfee   : feerate * SPEND_TXIN_SIZE
  }
  const proof = notarize_contract(template, signer, 'published')
  return sort_record({ ...template, created_sig: proof })
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
  const proof    = notarize_contract(updated, signer, status)
  return sort_record({ ...updated, canceled_sig: proof })
}

export function add_contract_funds (
  contract : ContractData,
  deposit  : DepositData
) {
  let { funds_pend, funds_conf, vin_count, vin_txfee, tx_fees, tx_total, tx_vsize } = contract
  if (deposit.confirmed) {
    funds_conf += deposit.utxo.value
    tx_fees    += vin_txfee
    tx_total   += deposit.utxo.value + vin_txfee
    tx_vsize   += SPEND_TXIN_SIZE
    vin_count  += 1
  } else {
    funds_pend += deposit.utxo.value
  }
  return sort_record({ ...contract, funds_pend, funds_conf, tx_fees, tx_total, tx_vsize, vin_count })
}

export function confirm_contract_funds (
  contract : ContractData,
  deposit  : DepositData
) {
  assert.ok(deposit.confirmed, 'deposit is not confirmed')
  const updated = add_contract_funds(contract, deposit)
  updated.funds_pend -= deposit.utxo.value
  return updated
}

export function rem_contract_funds (
  contract : ContractData,
  deposit  : DepositData
) {
  let { funds_pend, funds_conf, vin_count, vin_txfee, tx_fees, tx_total, tx_vsize } = contract
  if (deposit.confirmed) {
    funds_conf -= deposit.utxo.value
    tx_fees    -= vin_txfee
    tx_total   -= deposit.utxo.value + vin_txfee
    tx_vsize   -= SPEND_TXIN_SIZE
    vin_count  -= 1
  } else {
    funds_pend -= deposit.utxo.value
  }
  return sort_record({ ...contract, funds_pend, funds_conf, tx_fees, tx_total, tx_vsize, vin_count })
}

export function secure_contract (
  contract : ContractData,
  deposits : DepositData[],
  signer   : SignerAPI,
  updated_at = now()
) {
  assert.ok(!contract.canceled,               'contract has been canceled')
  assert.ok(deposits.every(e => e.confirmed), 'not all deposits are confirmed')

  const { feerate, subtotal, tx_bsize, vin_txfee } = contract

  const funds_conf = deposits.reduce((acc, nxt) => acc + nxt.utxo.value, 0)
  const tx_fees    = (feerate * tx_bsize) + (vin_txfee * deposits.length)
  const tx_vsize   = tx_bsize + (deposits.length * SPEND_TXIN_SIZE)
  const tx_total   = subtotal + tx_fees
  const vin_count  = deposits.length

  assert.ok(funds_conf >= tx_total, `contract is under-funded: ${funds_conf} < ${tx_total}`)

  const secured      = true as const
  const status       = 'secured' as ContractStatus
  const effective_at = contract.terms.effective ?? updated_at
  const tabs         = { vin_count, funds_pend: 0, funds_conf }
  const changes      = { secured, effective_at, tx_fees, tx_total, tx_vsize }
  const updated      = { ...contract, ...tabs, ...changes, status, updated_at }
  const proof        = notarize_contract(updated, signer, status)
  return sort_record({ ...updated, secured_sig: proof })
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
  const machine_vmid = get_machine_id(active_at, contract.cid, expires_at)
  const machine_head = machine_vmid
  const status      = 'active' as ContractStatus
  const updated_at  = active_at
  // Return the new contract and vm config.
  const changes = { activated, active_at, expires_at, machine_head, machine_vmid }
  const updated = { ...contract, ...changes, status, updated_at }
  const proof   = notarize_contract(updated, signer, status)
  return sort_record({ ...updated, active_sig: proof })
}

export function close_contract (
  contract : ContractData,
  vmdata   : MachineData,
  signer   : SignerAPI
) : ContractData {
  assert.ok(contract.activated, 'contract is not active')
  assert.ok(vmdata.closed,      'vm state is not closed')
  const closed      = true as const
  const closed_at   = vmdata.closed_at
  const machine_head = vmdata.head
  const machine_vout = vmdata.output
  const status      = 'closed' as ContractStatus
  const updated_at  = closed_at
  const changes     = { closed, closed_at, machine_head, machine_vout }
  const updated     = { ...contract, ...changes, status, updated_at }
  const proof       = notarize_contract(updated, signer, status)
  return sort_record({ ...updated, closed_sig: proof })
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
  const proof      = notarize_contract(updated, signer, status)
  return sort_record({ ...updated, spent_sig: proof })
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
  const proof   = notarize_contract(updated, signer, status)
  return sort_record({ ...updated, settled_sig: proof })
}
