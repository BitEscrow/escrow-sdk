import { DraftSession } from '@scrow/core'
import { signer }       from './config.js'

import {
  address,
  agent_draft,
  secret_id
} from '../terms.js'

/** ========== [ Draft Session ] ========== **/

// Create a draft session
const session = new DraftSession(signer, {
  debug   : true,
  verbose : true
})

session.on('error', console.log)
session.on('reject', console.log)

// When the session is ready:
session.on('ready', () => {
  console.log('alice ready')
})

await session.init(address, secret_id, agent_draft)
