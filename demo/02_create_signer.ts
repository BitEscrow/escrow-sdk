import { Buff }            from '@cmdcode/buff'
import { Signer, Wallet }  from '@cmdcode/signer'
import { EscrowSigner }    from '@scrow/core/client'
import { config, members } from './00_demo_config.js'

/**
 * Utility method for creating a list of
 * signers from a list of strings.
 */
function create_signer (alias : string) {
  // Simple hash of a string. For testing only.
  const seed = Buff.str(alias).digest
  // Create a wallet and xpub from seed.
  const xpub = Wallet.create({ seed }).xpub
  // Build our escrow signer config.
  const signer_config = {
    ...config,
    signer : new Signer({ seed }),
    wallet : new Wallet(xpub)
  }
  // Return an escrow signer.
  return new EscrowSigner(signer_config)
}

/**
 * Define our list of signers.
 */
export const signers = members.map(e => create_signer(e))
