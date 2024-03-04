import { DraftSession } from '@scrow/core'

import { signer } from './config.js'

/** ========== [ Draft Session ] ========== **/

// Create a draft session

console.log(signer.pubkey)

const drafts = await DraftSession.list('wss://relay.damus.io', signer, { verbose : true })

console.dir(drafts, { depth : null })
