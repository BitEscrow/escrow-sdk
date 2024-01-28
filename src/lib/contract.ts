import { Buff }             from '@cmdcode/buff'
import { sha256 }           from '@cmdcode/crypto-tools/hash'
import { create_txhex }     from './tx.js'
import { now, sort_record } from './util.js'
import { DEFAULT_DEADLINE } from '../config.js'
import { init_vm }          from '../vm/main.js'

import {
  get_path_names,
  get_path_vouts,
  get_proposal_id,
} from './proposal.js'

import {
  ContractConfig,
  ContractData,
  PaymentEntry,
  ProposalData,
  SpendTemplate
} from '../types/index.js'

/**
 * Returns a new ContractData object.
 */
export function create_contract (
  config     : ContractConfig,
  terms      : ProposalData,
  signatures : string[] = []
) : ContractData {
  // Unpack the contract config object.
  const { agent_fee, feerate, published, session } = config
  // Define or create the contract outputs.
  const outputs   = config.outputs ?? get_spend_templates(terms, [ agent_fee ])
  // Define or compute the proposal id.
  const prop_id   = config.prop_id ?? get_proposal_id(terms)
  // Define or compute the contract id.
  const cid       = config.cid     ?? get_contract_id(prop_id, published, outputs)
  // Calculate the subtotal.
  const subtotal  = terms.value + agent_fee[0]
  // Calculate the vout size of the tx output.
  const vout_size = outputs[0][1].length / 2
  // Calculate the transaction fee.
  const txfee     = vout_size * feerate
  // Return a completed contract.
  return sort_record({
    ...session,
    activated   : null,
    agent_fee   : agent_fee,
    balance     : 0,
    cid         : cid,
    deadline    : get_deadline(terms, published),
    est_txfee   : txfee,
    est_txsize  : vout_size,
    expires_at  : null,
    feerate     : feerate,
    moderator   : config.moderator ?? null,
    outputs     : outputs,
    pending     : 0,
    prop_id     : prop_id,
    pubkeys     : signatures.map(e => e.slice(0, 64)),
    published   : published,
    settled     : false,
    settled_at  : null,
    signatures  : signatures,
    spent       : false,
    spent_at    : null,
    spent_txid  : null,
    status      : 'published',
    subtotal    : subtotal,
    terms       : terms,
    total       : subtotal + txfee,
    updated_at  : published,
    vm_state    : null,
    vout_size   : vout_size
  })
}

/**
 * Compute the hash identifier
 * for an escrow contract.
 */
export function get_contract_id (
  prop_id   : string,
  published : number,
  templates : SpendTemplate[]
) {
  // Collect template hex and sort.
  const outhex = templates.map(e => e[1]).sort()
  // Convert published stamp into bytes.
  const stamp  = Buff.num(published, 4)
  // Assemble the pre-image template.
  const preimg = Buff.join([ prop_id, stamp, ...outhex ])
  // Hash the image and return as hex.
  return sha256(preimg).hex
}

/**
 * Initializes the vm state and 
 * returns the updated contract.
 */
export function activate_contract (
  contract  : ContractData,
  activated : number = now()
) : ContractData {
  // Unpack contract object.
  const { cid, terms } = contract
  // Unpack terms object.
  const { expires, paths, programs, schedule } = terms
  // Define a hard expiration date.
  const expires_at = activated + expires
  // Collect the path names.
  const pathnames = get_path_names(paths)
  // Initialize the virtual machine.
  const vm_state = init_vm({ activated, cid, pathnames, programs, schedule })
  // Return the activated contract state.
  return { ...contract, activated, expires_at, status : 'active', vm_state }
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
    return published + (deadline ?? DEFAULT_DEADLINE)
  }
}

/**
 * Convert each spending path in the proposal
 * into a transaction output template.
 */
export function get_spend_templates (
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
    const txhex = create_txhex(vout)
    // Return the txhex as an array entry.
    return [ pathname, txhex ]
  })
}
