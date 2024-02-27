import { EscrowSigner } from '@scrow/core/client'
import { config }       from './00_demo_config.js'

/**
 * Utility method for creating a list of
 * signers from a list of strings.
 */
function create_signer (alias : string) {
  // Return an escrow signer.
  return EscrowSigner.import(config).from_phrase(alias)
}

/**
 * Define our list of signers.
 */
export const signers = config.members.map(e => create_signer(e))
