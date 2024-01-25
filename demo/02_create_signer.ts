import { Seed, Signer, Wallet } from '@cmdcode/signer'
import { EscrowSigner }         from '@scrow/core/client'

import { config, members }      from './00_demo_config.js'


function create_signer (alias : string) {

  const seed = Seed.import.from_char(alias)

  const xpub = Wallet.create({ seed }).xpub

  const signer_config = {
    ...config,
    signer : new Signer({ seed }),
    wallet : new Wallet(xpub)
  }

  return new EscrowSigner(signer_config)
}

export const signers = members.map(e => create_signer(e))
