
import { get_client } from './utils.js'

import {
  ProposalData,
  RolePolicy
} from '@scrow/core'

export const seeds   = [ 'alice', 'bob', 'carol', 'david' ]
export const clients = seeds.map(e => get_client(e))

export let proposal : ProposalData = {
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
