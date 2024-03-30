/* Global Imports */

import { Buff } from '@cmdcode/buff'

import {
  decode_tx,
  encode_tx
} from '@scrow/tapscript/tx'

/* Module Imports */

import * as assert          from '@/assert.js'
import { ServerPolicy }     from '@/types.js'
import { now, sort_record } from '@/util.js'

/* Local Imports */

import { get_covenant_psig, settle_covenant } from './covenant.js'

import { create_txinput, get_vout_txhex } from './tx.js'

import {
  get_path_names,
  get_path_vouts,
  get_pay_total,
  get_proposal_id
} from './proposal.js'

import {
  ContractConfig,
  ContractData,
  ContractRequest,
  ContractStatus,
  DepositData,
  PaymentEntry,
  ProposalData,
  SignerAPI,
  SpendTemplate,
  VMConfig
} from '../types/index.js'

import ContractSchema from '../schema/contract.js'

const CONTRACT_DEFAULTS = () => {
  return {
    activated  : null,
    balance    : 0,
    expires_at : null,
    pending    : 0,
    settled    : false as const,
    settled_at : null,
    spent      : false as const,
    spent_at   : null,
    spent_txid : null,
    status     : 'published' as ContractStatus,
    txin_count : 0,
    vmid       : null
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
  const feerate   = config.feerate   ?? request.proposal.feerate
  // Define or create the contract outputs.
  const outputs   = config.outputs   ?? create_spend_templates(proposal, fees)
  // Define or compute the proposal id.
  const prop_id   = config.prop_id   ?? get_proposal_id(proposal)
  // Define or compute the published date.
  const published = config.published ?? now()
  // Define or compute the contract id.
  const cid       = config.cid       ?? get_contract_id(outputs, prop_id, published)
  // Calculate the subtotal.
  const subtotal  = proposal.value + get_pay_total(fees)
  // Calculate the vout size of the tx output.
  const vout_size = get_max_vout_size(outputs)
  // Calculate the transaction fee.
  const txfee     = vout_size * feerate
  // Return a completed contract.
  return sort_record({
    ...CONTRACT_DEFAULTS(),
    cid,
    fees,
    deadline   : get_deadline(proposal, published, DEADLINE_DEF),
    est_txfee  : txfee,
    est_txsize : vout_size,
    feerate,
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
    total      : subtotal + txfee,
    updated_at : published,
    vout_size
  })
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
  const lens = outputs.map(e => e[1].length)
  return Math.max(...lens) / 2
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
  const { activated, terms, vmid } = contract
  const { paths, programs, schedule } = terms
  const pathnames = get_path_names(paths)
  assert.exists(activated)
  assert.exists(vmid)
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
