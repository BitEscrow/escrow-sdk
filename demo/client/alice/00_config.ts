import { Buff } from '@cmdcode/buff'

import {
  EscrowSigner,
  RoleTemplate,
  WitnessTemplate,
  create_policy,
} from '@scrow/core'

import { config } from '@scrow/demo/00_demo_config.js'

/** ========== [ USER CONFIG ] ========== **/

const SECRET_PASS  : string = 'test_draft2'

const USER_ALIAS   : string = 'alice'

const ROLE_POLICY  : RoleTemplate = {
  title : 'buyer',
  paths : [
    [ 'return', 10000  ]
  ],
  programs : [
    [ 'endorse', 'close',   '*', 2 ],
    [ 'endorse', 'dispute', '*', 1 ]
  ]
}

const FUND_AMOUNT   : number = 15_000

const WIT_STATEMENT : WitnessTemplate = {
  action : 'close',
  method : 'endorse',
  path   : 'payout'
}

/** ========== [ MAIN EXPORT ] ========== **/

// Compute secret id for nostr session.
export const secret_id = Buff.str(SECRET_PASS).digest.hex
// Derive signing device from the user alias.
export const signer    = EscrowSigner.import(config).from_phrase(USER_ALIAS)
// Define a role policy for yourself.
export const policy    = create_policy(ROLE_POLICY)
// Export the funding amount.
export const fund_amt  = FUND_AMOUNT
// Export the witness template.
export const wit_tmpl  = WIT_STATEMENT
