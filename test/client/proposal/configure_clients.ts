import { Seed, Signer, Wallet } from '@cmdcode/signer'

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
  const seed   = Seed.import.from_char(alias)
  // Create a new signer using the seed.
  const signer = new Signer({ seed })
  // Create a new wallet using the seed.
  const wallet = Wallet.create({ seed, network : 'regtest' })
  // Return an escrow signer.
  return new EscrowSigner({ ...config, idxgen, signer, wallet })
})
