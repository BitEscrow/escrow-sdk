import { DraftSession }   from '@scrow/core'
import { print_banner }   from '@scrow/test'

import {
  secret_id,
  policy,
  signer
} from './00_config.js'

// Create a draft session
const session = new DraftSession(signer)

// Print the store data on update.
session.on('ready', async () => {
  await session.membership.create(policy)
  print_banner('draft update')
  console.dir(session.data, { depth : null })
})

// Wait for the session to connect.
await session.connect('wss://relay.damus.io', secret_id)
