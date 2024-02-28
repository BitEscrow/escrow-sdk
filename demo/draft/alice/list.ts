import { DraftSession } from '@scrow/core'

import { signer } from './config.js'

/** ========== [ Draft Session ] ========== **/

// Create a draft session

console.log(signer.pubkey)

const session = new DraftSession(signer, {
  socket_config : { verbose : true, debug : true },
  store_config  : { verbose : true, debug : false },
  verbose : true
})

const drafts = await session.list('wss://relay.damus.io')

console.dir(drafts, { depth : null })

session.delete(drafts[0].store_id)
