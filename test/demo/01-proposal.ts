
import { get_role_policy } from '@/lib/policy.js'
import { get_member }      from './utils.js'

import {
  EscrowProposal,
  RolePolicy
} from '@scrow/core'

export const seeds   = [ 'alice', 'bob', 'carol', 'david' ]
export const members = seeds.map(e => get_member(e))

export const proposal = new EscrowProposal({
  title    : 'Basic two-party contract with third-party dispute resolution.',
  content  : 'n/a',
  expires  : 14400,
  members  : [],
  network  : 'regtest',
  paths    : [],
  payments : [],
  programs : [],
  schedule : [[ 7200, 'close', 'draw' ]],
  value    : 15000,
  version  : 1
})

export const policies : RolePolicy[] = [
  {
    label : 'buyer',
    paths : [
      [ 'heads', 10000 ],
      [ 'draw',  5000  ]
    ],
    programs : [
      [ 'sign', 'close',   'heads|tails', 2 ],
      [ 'sign', 'dispute', 'heads|tails', 1 ]
    ]
  },
  {
    label : 'sales',
    paths : [
      [ 'tails', 10000 ],
      [ 'draw',  5000  ]
    ],
    programs : [
      [ 'sign', 'close',   'heads|tails', 2 ],
      [ 'sign', 'dispute', 'heads|tails', 1 ]
    ]
  },
  {
    label   : 'agent',
    payment : 5000,
    paths   : [],
    programs : [
      [ 'sign', 'resolve', 'heads|tails', 1 ]
    ]
  }
]

export const roles = {
  buyer : get_role_policy(policies, 'buyer'),
  sales : get_role_policy(policies, 'sales'),
  agent : get_role_policy(policies, 'agent'),
}
