import { DraftSession }           from '@scrow/core'
import { alias, role, signer }    from './config.js'
import { agent_draft, secret_id } from '../terms.js'

/** ========== [ Draft Session ] ========== **/

// Create a draft session
const session = new DraftSession(secret_id, signer, {
  debug   : true,
  verbose : true
})

session.on('error', console.log)
session.on('reject', console.log)

// When the session is ready:
session.on('ready', () => {
  console.log('alice ready')
  // If we are not a member:
  if (!session.is_member) {
    // Grab the buyer policy from the roles list.
    console.log(`fetching role "${role}"...`)
    const policy = session.get_role(role)
    // Join the session as the buyer.
    console.log('joining the session...')
    session.join(policy.id)
    // Print to console.
    console.log(`${alias} joined the draft as role ${policy.title}`)
  }
})

await session.init('wss://relay.damus.io', agent_draft)
