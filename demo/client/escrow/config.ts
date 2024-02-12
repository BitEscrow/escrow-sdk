import {
  EscrowSigner,
  WitnessTemplate
} from '@scrow/core'

import { config } from '@scrow/demo/00_demo_config.js'

/** ========== [ USER CONFIG ] ========== **/

const USER_ALIAS    : string = 'carol'
const USER_ROLE     : string = 'escrow'

const FUND_AMOUNT   : number = 0

const WIT_STATEMENT : WitnessTemplate = {
  action : 'resolve',
  method : 'endorse',
  path   : 'return'
}

/** ========== [ MAIN EXPORT ] ========== **/

export const alias     = USER_ALIAS
export const role      = USER_ROLE
// Derive signing device from the user alias.
export const signer    = EscrowSigner.import(config).from_phrase(USER_ALIAS)
// Export the funding amount.
export const fund_amt  = FUND_AMOUNT
// Export the witness template.
export const wit_tmpl  = WIT_STATEMENT
