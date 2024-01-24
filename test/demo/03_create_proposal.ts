import { EscrowProposal, RolePolicy } from'@scrow/core'

import { client } from './01_create_client.js'

export const proposal = new EscrowProposal({
  title    : 'Basic two-party contract with third-party arbitration.',
  expires  : 14400,
  network  : client.network,
  schedule : [[ 7200, 'close', 'draw' ]],
  value    : 15000,
})

export const roles : Record<string, RolePolicy> = {
  buyer : {
    paths : [
      [ 'heads', 10000 ],
      [ 'draw',  5000  ]
    ],
    programs : [
      [ 'endorse', 'close',   'heads|tails|draw', 2 ],
      [ 'endorse', 'dispute', 'heads|tails',      1 ]
    ]
  },
  seller : {
    paths : [
      [ 'tails', 10000 ],
      [ 'draw',  5000  ]
    ],
    programs : [
      [ 'endorse', 'close',   'heads|tails|draw', 2 ],
      [ 'endorse', 'dispute', 'heads|tails',      1 ]
    ]
  },
  agent : {
    payment  : 5000,
    programs : [
      [ 'endorse', 'resolve', 'heads|tails|draw', 1 ]
    ]
  }
}
