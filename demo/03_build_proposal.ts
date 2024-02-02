import { config }  from './00_demo_config.js'
import { signers } from './02_create_signer.js'

import {
  create_policy,
  create_proposal
} from '@scrow/core'

/**
 * Define an (optional) moderator for our proposal.
 */

export const moderator = signers[2]

/**
 * Define our proposal template.
 */
export const template = create_proposal({
  title     : 'Basic two-party contract with third-party arbitration.',
  expires   : 14400,
  moderator : moderator.pubkey,
  network   : config.network,
  schedule  : [[ 7200, 'close', '*' ]],
  value     : 15000,
})

/**
 * Define our role templates.
 */
export const roles = {
  buyer : create_policy({
    paths : [
      [ 'heads', 10000 ],
      [ 'draw',  5000  ]
    ],
    programs : [
      [ 'endorse', 'close',   'heads|tails|draw', 2 ],
      [ 'endorse', 'dispute', 'heads|tails',      1 ]
    ]
  }),
  seller : create_policy({
    paths : [
      [ 'tails', 10000 ],
      [ 'draw',  5000  ]
    ],
    programs : [
      [ 'endorse', 'close',   'heads|tails|draw', 2 ],
      [ 'endorse', 'dispute', 'heads|tails',      1 ]
    ]
  }),
  agent : create_policy({
    payment  : 5000,
    programs : [
      [ 'endorse', 'resolve', 'heads|tails|draw', 1 ]
    ]
  })
}
