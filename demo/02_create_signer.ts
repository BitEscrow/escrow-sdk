import { Buff }         from '@cmdcode/buff'
import { EscrowSigner } from '@scrow/core/client'
import { config }       from './00_demo_config.js'

/**
 * Utility method for creating a list of
 * signers from a list of strings.
 */
function create_signer (alias : string) {
  // Simple hash of a string. For testing only.
  const seed = Buff.str(alias).digest
  // Return an escrow signer.
  return EscrowSigner.create(config.client, seed)
}

/**
 * Define our list of signers.
 */
export const signers = config.members.map(e => create_signer(e))
