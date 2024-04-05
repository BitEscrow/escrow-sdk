/* Global Imports */

import { Buff }                 from '@cmdcode/buff'
import { decode_tx, encode_tx } from '@scrow/tapscript/tx'

/* Module Imports */

import { SPEND_TXIN_SIZE }          from '../const.js'
import { assert, now, sort_record } from '../util/index.js'

import {
  ContractCreateConfig,
  ContractData,
  ContractRequest,
  ContractSpendConfig,
  ContractStatus,
  DepositData,
  FundingData,
  PaymentEntry,
  ProposalData,
  SignerAPI,
  SpendTemplate
} from '../types/index.js'

import ContractSchema from '../schema/contract.js'

/* Local Imports */

import { get_vm_id } from './vm.js'

import {
  get_covenant_psig,
  settle_covenant
} from './covenant.js'

import {
  get_path_names,
  get_path_vouts,
  get_pay_total,
  get_proposal_id
} from './proposal.js'

import {
  GET_INIT_SPEND_STATE,
  create_txinput,
  get_vout_txhex
} from './tx.js'

export const GET_INIT_ACTIVE_STATE = () => {
  return {
    activated  : false as const,
    active_at  : null,
    active_vm  : null,
    expires_at : null
  }
}

const CONTRACT_DEFAULTS = () => {
  return {
    ...GET_INIT_ACTIVE_STATE(),
    ...GET_INIT_SPEND_STATE(),
    fund_count : 0,
    fund_pend  : 0,
    fund_value : 0,
    spent_hash : null,
    spent_path : null,
    status     : 'published' as ContractStatus
  }
}

export function create_publish_req (
  proposal    : ProposalData,
  signatures ?: string[]
) : ContractRequest {
  return ContractSchema.publish_req.parse({ proposal, signatures })
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
    ...CONTRACT_DEFAULTS(),
    cid,
    created_at,
    fees,
    deadline   : get_deadline(proposal, created_at),
    feerate,
    fund_txfee,
    moderator  : request.proposal.moderator ?? null,
    outputs,
    prop_id,
    pubkeys    : signatures.map(e => e.slice(0, 64)),
    server_pk  : signer.pubkey,
    server_sig : signer.sign(cid),
    signatures,
    subtotal,
    terms      : proposal,
    tx_fees,
    tx_bsize,
    tx_vsize   : tx_bsize,
    tx_total   : subtotal + tx_fees,
    updated_at : created_at
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
  const expires_at = active_at + contract.terms.duration
  const active_vm  = get_vm_id(active_at, contract.cid, expires_at)
  const status     = 'active' as ContractStatus
  // Return the new contract and vm config.
  return { ...contract, activated: true, active_at, active_vm, expires_at, status }
}

export function spend_contract (
  config   : ContractSpendConfig,
  contract : ContractData
) : ContractData {
  const spent_at = config.spent_at ?? now()
  const status   = 'spent' as ContractStatus
  return { ...contract, ...config, spent_at, status, spent: true }
}

/**
 * Compute the record identifier for a contract.
 */
export function get_contract_id (
  outputs  : SpendTemplate[],
  prop_id  : string,
  stamp    : number
) {
  const hash = Buff.hex(prop_id)
  const stmp = Buff.num(stamp, 4)
  const thex = outputs
    .map(e => e[1])
    .sort()
    .map(e => Buff.hex(e))
  return Buff.join([ hash, stmp, ...thex ]).digest.hex
}

/**
 * Returns a relative deadline (in seconds)
 * for receiving deposits.
 */
function get_deadline (
  proposal  : ProposalData,
  published : number
) {
  // Unpack the proposal object.
  const { deadline, effective } = proposal
  // If an effective date is set:
  if (effective !== undefined) {
    // Return remaining time until effective date.
    return effective - published
  } else {
    // Return published date, plus deadline.
    return published + deadline
  }
}

/**
 * Get the size (in bytes) of the largest tx template.
 */
export function get_max_vout_size (
  outputs : SpendTemplate[]
) {
  const tx_lens = outputs.map(e => e[1].length)
  return Math.max(...tx_lens) / 2
}

/**
 * Convert each spending path in the proposal
 * into a transaction output template.
 */
export function create_spend_templates (
  proposal : ProposalData,
  fees     : PaymentEntry[]
) : SpendTemplate[] {
  // Unpack proposal object.
  const { payments, paths } = proposal
  // Collect and sort path names.
  const pathnames = get_path_names(paths)
  // Collect payments.
  const pay_total = [ ...payments, ...fees ]
  // Return labeled array of spend templates.
  return pathnames.map(pathname => {
    // Get a list of tx outputs.
    const vout  = get_path_vouts(pathname, paths, pay_total)
    // Combine the outputs into a tx template (hex).
    const txhex = get_vout_txhex(vout)
    // Return the txhex as an array entry.
    return [ pathname, txhex ]
  })
}

export function get_spend_template (
  label     : string,
  templates : SpendTemplate[]
) {
  const tmpl = templates.find(e => e[0] === label)

  if (tmpl === undefined) {
    throw new Error('spend template found for label: ' + label)
  }

  return tmpl[1]
}

export function get_settlement_tx (
  contract  : ContractData,
  deposits  : DepositData[],
  pathname  : string,
  server_sd : SignerAPI
) : string {
  const output = get_spend_template(pathname, contract.outputs)
  const txdata = decode_tx(output, false)
  for (const deposit of deposits) {
    assert.exists(deposit.covenant)
    const vin  = create_txinput(deposit.utxo)
    const psig = get_covenant_psig(pathname, deposit.covenant)
    const sig  = settle_covenant(contract, deposit, output, psig, server_sd)
    txdata.vin.push({ ...vin, witness: [ sig ] })
  }
  return encode_tx(txdata).hex
}

export function tabulate_funds (
  contract : ContractData,
  funds    : FundingData[]
) {
  const { feerate, fund_txfee, outputs, subtotal } = contract
  const base_size  = get_max_vout_size(outputs)
  const base_fee   = base_size * feerate
  const fund_count = funds.length
  const fund_value = funds.reduce((val, fund) => val + fund.utxo.value, 0)

  const tx_txin_size  = SPEND_TXIN_SIZE * fund_count
  const tx_txin_fee   = tx_txin_size * feerate
  const tx_total_size = base_fee  + tx_txin_fee
  const tx_total_fee  = base_size + tx_txin_size

  const tx_fees    = base_fee  + (fund_count * fund_txfee)
  const tx_vsize   = base_size + (fund_count * SPEND_TXIN_SIZE)
  const tx_total   = subtotal  + tx_fees
  const sats_vbyte = Math.floor(tx_total_size / tx_total_fee)

  return { fund_count, fund_value, sats_vbyte, tx_fees, tx_vsize, tx_total }
}
