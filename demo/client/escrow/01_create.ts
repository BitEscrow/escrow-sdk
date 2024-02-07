import { print_banner } from '@scrow/test'
import { DraftSession } from '@scrow/core'
import { create_draft } from '@scrow/core/proposal'

import { policy, secret_id, signer, template } from './00_config.js'

const new_draft = create_draft({
  proposal : template,
  roles    : [ policy ]
})

// Create the initial proposal (with your role info).
const session = new DraftSession(signer, { verbose : false })

session.on('ready', async () => {
  // Join the proposal using the existing policy.
  await session.membership.join(policy)
  print_banner('draft update')
  console.dir(session.data, { depth : null })
})

// Initialize the draft session.
await session.init('wss://relay.damus.io', secret_id, new_draft)
