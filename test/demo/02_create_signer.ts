import { Seed, Signer, Wallet } from '@cmdcode/signer'
import { EscrowSigner }         from '@scrow/core/client'
import { client_config }        from './01_create_client.js'

const aliases = [ 'alice', 'bob', 'carol' ]

function create_signer (alias : string) {

  const seed = Seed.import.from_char(alias)
  const xpub = Wallet.create({ seed }).xpub

  const signer_config = {
    ...client_config,
    signer : new Signer({ seed }),
    wallet : new Wallet(xpub)
  }

  return new EscrowSigner(signer_config)
}

export const members = aliases.map(e => create_signer(e))
