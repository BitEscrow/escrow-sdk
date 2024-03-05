import { Buff }         from '@cmdcode/buff'
import { create_draft } from '@/lib/proposal.js'
import { config }       from '../00_demo_config.js'

import {
  EscrowSigner,
  ProposalTemplate,
  RoleTemplate,
  create_policy,
  create_proposal
} from '@scrow/core'

const AGENT_ALIAS   : string = 'carol'
const SECRET_PASS   : string = 'test_draft4'
const RELAY_ADDR    : string = 'wss://nos.lol'

const PROP_TEMPLATE : ProposalTemplate = {
  title     : 'Basic two-party contract with third-party arbitration.',
  duration  : 14400,
  schedule  : [[ 7200, 'close|resolve', '*' ]],
  value     : 15000,
}

const PROP_ROLES   : RoleTemplate[] = [
  {
    title : 'buyer',
    paths : [
      [ 'return', 10000  ]
    ],
    programs : [
      [ 'endorse', 'close',   '*', 2 ],
      [ 'endorse', 'dispute', '*', 1 ]
    ]
  },
  {
    title : 'seller',
    paths : [
      [ 'payout', 10000  ]
    ],
    payment : 3000,
    programs : [
      [ 'endorse', 'close',   '*', 2 ],
      [ 'endorse', 'dispute', '*', 1 ]
    ]
  },
  {
    title    : 'agent',
    payment  : 2000,
    programs : [
      [ 'endorse', 'resolve', '*', 1 ]
    ]
  }
]

//
export const address   = RELAY_ADDR
//
export const alias     = AGENT_ALIAS
// Compute draft id for nostr store.
export const secret_id = Buff.str(SECRET_PASS).digest.hex
// Derive signing device from the user alias.
export const signer    = EscrowSigner.import(config).from_phrase(AGENT_ALIAS)
//
const base_draft = create_draft({
  proposal : create_proposal({
    ...PROP_TEMPLATE,
    network   : config.network,
    moderator : signer.pubkey,
  }),
  roles : PROP_ROLES.map(e => create_policy(e))
})

const AGENT_ROLE = base_draft.roles[2]

export const agent_draft = signer.draft.join(AGENT_ROLE, base_draft)
