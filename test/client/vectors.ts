import { Buff }           from '@cmdcode/buff'
import { Signer, Wallet } from '@cmdcode/signer'

import {
  EscrowProposal,
  RolePolicy
} from '@scrow/core'

import {
  EscrowClient,
  EscrowSigner
} from '@scrow/core/client'

const config = {
  hostname : 'http://localhost:3000',
  oracle   : 'http://172.21.0.3:3000'
}

const aliases = [ 'alice', 'bob', 'carol', 'david' ]

export const client  = new EscrowClient(config)

export const members = aliases.map(alias => {
  // Freeze the idx generation at 0 for testing.
  const idxgen = () => 0
  // Create a basic deterministic seed for testing.
  const seed   = Buff.str(alias).digest
  // Create a new signer using the seed.
  const signer = new Signer({ seed })
  // Create a new wallet using the seed.
  const wallet = Wallet.create({ seed, network : 'regtest' })
  // Return an escrow signer.
  return new EscrowSigner({ ...config, idxgen, signer, wallet })
})

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
    payment : 5000,
    paths   : [],
    programs : [
      [ 'endorse', 'resolve', 'heads|tails', 1 ]
    ]
  }
}
