import {
  EscrowSigner,
  WitnessTemplate
} from '@scrow/core'

import { config } from '@scrow/demo/00_demo_config.js'

/** ========== [ USER CONFIG ] ========== **/

const USER_ALIAS   : string = 'bob'

const USER_ROLE    : string = 'seller'

const FUND_AMOUNT   : number = 15_000

const WIT_STATEMENT : WitnessTemplate = {
  action : 'close',
  method : 'endorse',
  path   : 'payout'
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
