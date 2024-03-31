/* Global Imports */

import { Buff } from '@cmdcode/buff'

import {
  decode_tx,
  encode_tx
} from '@scrow/tapscript/tx'

/* Module Imports */

import { SPEND_TXIN_SIZE }          from '../const.js'
import { assert, now, sort_record } from '../util/index.js'

import {
  ContractConfig,
  ContractData,
  ContractRequest,
  ContractStatus,
  DepositData,
  PaymentEntry,
  ProposalData,
  ServerPolicy,
  SignerAPI,
  SpendTemplate,
  VMConfig
} from '../types/index.js'

import ContractSchema from '../schema/contract.js'

/* Local Imports */

import { get_covenant_psig, settle_covenant } from './covenant.js'

import { create_txinput, get_vout_txhex } from './tx.js'

import {
  get_path_names,
  get_path_vouts,
  get_pay_total,
  get_proposal_id
} from './proposal.js'

const CONTRACT_DEFAULTS = () => {
  return {
    activated  : null,
    expires_at : null,
    fund_count : 0,
    fund_pend  : 0,
    fund_value : 0,
    settled    : false as const,
    settled_at : null,
    spent      : false as const,
    spent_at   : null,
    spent_txid : null,
    status     : 'published' as ContractStatus
  }
}

export function create_contract_req (
  proposal    : ProposalData,
  signatures ?: string[]
) : ContractRequest {
  return ContractSchema.req.parse({ proposal, signatures })
}

/**
 * Returns a new ContractData object.
 */
export function create_contract (
  config  : ContractConfig,
  policy  : ServerPolicy,
  request : ContractRequest,
  signer  : SignerAPI
) : ContractData {
  // Unpack config object.
  const { fees } = config
  //
  const { DEADLINE_DEF } = policy.proposal
  // Unpack request object.
  const { proposal, signatures = [] } = request
  // Define or create the contract outputs.
  const feerate    = config.feerate   ?? request.proposal.feerate
  // Define the funding input txfee.
  const fund_txfee = feerate * SPEND_TXIN_SIZE
  // Define or create the contract outputs.
  const outputs    = config.outputs   ?? create_spend_templates(proposal, fees)
  // Define or compute the proposal id.
  const prop_id    = config.prop_id   ?? get_proposal_id(proposal)
  // Define or compute the published date.
  const published  = config.published ?? now()
  // Define or compute the contract id.
  const cid        = config.cid       ?? get_contract_id(outputs, prop_id, published)
  // Calculate the subtotal.
  const subtotal   = proposal.value + get_pay_total(fees)
  // Calculate the vout size of the tx output.
  const tx_vsize   = get_max_vout_size(outputs)
  // Calculate the transaction fee.
  const tx_fees    =  tx_vsize * feerate
  // Return a completed contract.
  return sort_record({
    ...CONTRACT_DEFAULTS(),
    cid,
    fees,
    deadline   : get_deadline(proposal, published, DEADLINE_DEF),
    feerate,
    fund_txfee,
    moderator  : request.proposal.moderator ?? null,
    outputs,
    prop_id,
    pubkeys    : signatures.map(e => e.slice(0, 64)),
    published,
    server_pk  : signer.pubkey,
    server_sig : signer.sign(cid),
    signatures,
    subtotal,
    terms      : proposal,
    tx_fees,
    tx_vsize,
    tx_total   : subtotal + tx_fees,
    updated_at : published
  })
}

export function fund_contract (
  contract : ContractData,
  deposit  : DepositData
) {
  const { confirmed, utxo } = deposit
  const fund_value = (confirmed)
    ? contract.fund_value + utxo.value
    : contract.fund_value
  const fund_pend  = (confirmed)
    ? contract.fund_pend
    : contract.fund_pend + utxo.value
  const fund_count  = contract.fund_count + 1
  const tx_fee_data = get_txfee_data(contract, fund_count)
  const tx_fees     = tx_fee_data.tx_total_fee
  const tx_size     = tx_fee_data.tx_total_size
  const tx_total    = contract.subtotal + tx_fees
  return sort_record({ ...contract, fund_count, fund_pend, fund_value, tx_fees, tx_size, tx_total })
}

/**
 * Initializes the vm state and
 * returns the updated contract.
 */
export function activate_contract (
  contract  : ContractData,
  activated : number = now()
) {
  // Define a hard expiration date.
  const expires_at = activated + contract.terms.duration
  const status     = 'active' as ContractStatus
  const vmid       = get_vm_id(contract.cid, activated)
  // Return the new contract and vm config.
  return { ...contract, activated, expires_at, status, vmid }
}

export function settle_contract (
  contract   : ContractData,
  spent_at   : number,
  spent_txid : string
) : ContractData {
  const status = 'spent' as ContractStatus
  return { ...contract, spent_at, status, spent_txid, spent: true }
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
  published : number,
  defaults  : number
) {
  // Unpack the proposal object.
  const { deadline = defaults, effective } = proposal
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

export function get_vm_config (contract : ContractData) : VMConfig {
  assert.exists(contract.activated)
  const { activated, cid, terms } = contract
  const { paths, programs, schedule } = terms
  const pathnames = get_path_names(paths)
  const vmid      = get_vm_id(cid, activated)
  return { activated, pathnames, programs, schedule, vmid }
}

export function get_vm_id (
  cid   : string,
  stamp : number
) {
  const cb = Buff.hex(cid)
  const sb = Buff.num(stamp, 4)
  return Buff.join([ cb, sb ]).digest.hex
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

export function get_txfee_data (
  contract  : ContractData,
  vin_count : number
) {
  const { feerate, outputs } = contract
  const tx_base_size  = get_max_vout_size(outputs)
  const tx_base_fee   = tx_base_size * feerate
  const tx_txin_size  = SPEND_TXIN_SIZE * vin_count
  const tx_txin_fee   = tx_txin_size * feerate
  const tx_total_size = tx_base_fee  + tx_txin_fee
  const tx_total_fee  = tx_base_size + tx_txin_size
  const tx_sats_vbyte = Math.floor(tx_total_size / tx_total_fee)

  return {
    tx_base_fee,
    tx_base_size,
    tx_txin_fee,
    tx_txin_size,
    tx_total_fee,
    tx_total_size,
    tx_sats_vbyte
  }
}
