import { Buff } from '@cmdcode/buff'

import {
  EscrowSigner,
  ProposalTemplate,
  RoleTemplate,
  WitnessTemplate,
  create_policy,
  create_proposal
} from '@scrow/core'

import { config } from '@scrow/demo/00_demo_config.js'

/** ========== [ USER CONFIG ] ========== **/

const SECRET_PASS   : string = 'test_draft3'

const USER_ALIAS    : string = 'carol'

const ROLE_POLICY   : RoleTemplate = {
  title    : 'escrow',
  payment  : 3000,
  programs : [
    [ 'endorse', 'resolve', '*', 1 ]
  ]
}

const PROP_TEMPLATE : ProposalTemplate = {
  title     : 'Basic two-party contract with third-party arbitration.',
  duration  : 14400,
  schedule  : [[ 7200, 'close|resolve', '*' ]],
  value     : 15000,
}

const WIT_STATEMENT : WitnessTemplate = {
  action : 'resolve',
  method : 'endorse',
  path   : 'return'
}

/** ========== [ MAIN EXPORT ] ========== **/

export const alias     = USER_ALIAS
// Compute draft id for nostr store.
export const secret_id = Buff.str(SECRET_PASS).digest.hex
// Derive signing device from the user alias.
export const signer    = EscrowSigner.import(config).from_phrase(USER_ALIAS)
// Define a proposal template.
export const template = create_proposal({
  ...PROP_TEMPLATE,
  network   : config.network,
  moderator : signer.pubkey
})
// Define a role policy for yourself.
export const policy = create_policy(ROLE_POLICY)
//
export const wit_tmpl = WIT_STATEMENT
