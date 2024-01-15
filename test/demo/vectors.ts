import {
  EscrowProposal,
  RolePolicy
} from "@/index.js"

import { get_member } from "./utils.js"

export const clients = [ 'alice', 'bob', 'carol', 'david' ].map(e => get_member(e))

export function get_proposal () : EscrowProposal {
  return new EscrowProposal({
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
}

export const roles : RolePolicy[] = [
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
    label : 'seller',
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
