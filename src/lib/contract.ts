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
 * Returns a new ContractData object using the provided params.
 */
export function create_contract (
  config : ContractConfig
) : ContractData {
  const { agent_fee, feerate, proposal: terms } = config
  const outputs    = get_spend_templates(terms, [ agent_fee ])
  const published  = config.published  ?? now()
  const signatures = config.signatures ?? []
  const subtotal   = terms.value + agent_fee[0]
  const vout_size  = outputs[0][1].length / 2
  const txfee      = vout_size * feerate

  return sort_record({
    ...config.agent,
    activated   : null,
    agent_fee   : agent_fee,
    balance     : 0,
    cid         : config.cid,
    deadline    : get_deadline(terms, published),
    est_txfee   : txfee,
    est_txsize  : vout_size,
    expires_at  : null,
    feerate     : feerate,
    moderator   : config.moderator ?? null,
    outputs     : outputs,
    pending     : 0,
    prop_id     : get_proposal_id(terms).hex,
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
