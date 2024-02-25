import { Buff }         from 'https://unpkg.com/@cmdcode/buff@latest/dist/module.mjs'
import { EscrowSigner } from 'https://unpkg.com/@scrow/core@latest/dist/module.mjs'
import { config }       from '../../src/config.js'

export const signers = config.members.map(alias => {
  // Simple hash of a string. For testing only.
  const seed = Buff.str(alias).digest
  // Return an escrow signer.
  return EscrowSigner.create(config.client, seed)
})
