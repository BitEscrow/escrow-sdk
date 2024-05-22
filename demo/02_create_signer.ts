import { EscrowSigner } from '@scrow/sdk/client'
import { print_banner } from '@scrow/test'

import { config } from './00_demo_config.js'

const DEMO_MODE = process.env.VERBOSE === 'true'

/**
 * Create a list of signing devices to use.
 */
export const signers = config.members.map(alias => {
  return EscrowSigner.import(config.client).from_phrase(alias)
})

if (DEMO_MODE) {
  print_banner('signing members')
  console.log(config.members)
}
