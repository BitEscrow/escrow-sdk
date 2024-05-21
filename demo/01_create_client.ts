import { EscrowClient } from '@scrow/sdk'
import { print_banner } from '@scrow/test'

import { config } from './00_demo_config.js'

const DEMO_MODE = process.env.VERBOSE === 'true'

/**
 * Create a new API client using a ClientConfig object.
 */
export const client = new EscrowClient(config.client)

if (DEMO_MODE) {
  print_banner('client config')
  console.dir(config.client)
}
