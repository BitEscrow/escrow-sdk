import { create_txhex }     from './tx.js'
import { now, sort_record } from './util.js'
import { parse_program }    from './parse.js'
import { DEFAULT_DEADLINE } from '../config.js'
import { init_vm }          from '../vm/main.js'

import {
  get_path_names,
  get_path_vouts,
  get_pay_total,
  get_proposal_id,
} from './proposal.js'

import {
  ContractConfig,
  ContractData,
  PaymentEntry,
  ProgramEntry,
  ProgramTerms,
  ProposalData,
  SpendTemplate
} from '../types/index.js'

/**
 * Returns a new ContractData object using the provided params.
 */
export function create_contract (
  config : ContractConfig
) : ContractData {
  const terms      = config.proposal
  const fees       = config.fees       ?? []
  const published  = config.published  ?? now()
  const signatures = config.signatures ?? []

  return sort_record({
    ...config.agent,
    activated   : null,
    balance     : 0,
    cid         : config.cid,
    deadline    : get_deadline(terms, published),
    expires_at  : null,
    fees        : fees,
    moderator   : config.moderator ?? null,
    outputs     : get_spend_outputs(terms, fees),
    pending     : 0,
    prop_id     : get_proposal_id(terms).hex,
    programs    : init_programs(terms.programs),
    pubkeys     : signatures.map(e => e.slice(0, 64)),
    published   : published,
    settled     : false,
    settled_at  : null,
    signatures  : signatures,
    spent       : false,
    spent_at    : null,
    spent_txid  : null,
    status      : 'published',
    terms       : terms,
    total       : terms.value + get_pay_total(fees),
    updated_at  : published,
    vm_state    : null
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
  /**
   * Activate a contract.
   */
  const { terms } = contract
  return {
    ...contract,
    activated,
    expires_at : activated + terms.expires,
    status     : 'active',
    vm_state   : init_vm(contract)
  }
}

/**
 * Returns the effective deadline
 * based on the proposal data.
 */
function get_deadline (
  proposal : ProposalData,
  created  : number
) {
  const { deadline, effective } = proposal
  if (effective !== undefined) {
    return effective - created
  } else {
    return created + (deadline ?? DEFAULT_DEADLINE)
  }
}

/**
 * Compute the spending output transactions
 * for each path in the proposal.
 */
export function get_spend_outputs (
  prop : ProposalData,
  fees : PaymentEntry[]
) : SpendTemplate[] {
  const { payments, paths } = prop
  const total_fees = [ ...payments, ...fees ]
  const path_names = get_path_names(paths)
  const outputs : SpendTemplate[] = []
  for (const name of path_names) {
    const vout  = get_path_vouts(name, paths, total_fees)
    const txhex = create_txhex(vout)
    outputs.push([ name, txhex ])
  }
  return outputs
}

function init_programs (
  terms : ProgramTerms[]
) : ProgramEntry[] {
  /**
   * Id each program term and
   * load them into an array.
   */
  const entries : ProgramEntry[] = []
  for (const term of terms) {
    const program = parse_program(term)
    const { method, actions, paths, prog_id, params } = program
    entries.push([ prog_id, method, actions, paths, ...params ])
  }
  return entries
}
