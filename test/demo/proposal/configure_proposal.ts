
import { EscrowProposal, RolePolicy } from '@scrow/core'

export const proposal = new EscrowProposal({
  title      : 'Basic two-party contract with third-party dispute resolution.',
  content    : 'n/a',
  expires    : 14400,
  members    : [],
  network    : 'regtest',
  paths      : [],
  payments   : [],
  programs   : [],
  schedule   : [[ 7200, 'close', 'draw' ]],
  value      : 15000,
  version    : 1
})

export const roles : Record<string, RolePolicy> = {
  buyer : {
    label : 'buyer',
    paths : [
      [ 'heads', 10000 ],
      [ 'draw',  5000  ]
    ],
    programs : [
      [ 'endorse', 'close',   'heads|tails', 2 ],
      [ 'endorse', 'dispute', 'heads|tails', 1 ]
    ]
  },
  sales : {
    label : 'sales',
    paths : [
      [ 'tails', 10000 ],
      [ 'draw',  5000  ]
    ],
    programs : [
      [ 'endorse', 'close',   'heads|tails', 2 ],
      [ 'endorse', 'dispute', 'heads|tails', 1 ]
    ]
  },
  agent : {
    label   : 'agent',
    payment : 5000,
    paths   : [],
    programs : [
      [ 'endorse', 'resolve', 'heads|tails', 1 ]
    ]
  }
}
