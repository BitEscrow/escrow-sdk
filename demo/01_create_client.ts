import { EscrowClient } from '@scrow/core/client'

import { config } from './00_demo_config.js'

// Create a new client.
export const client = new EscrowClient(config)
