import { DraftSession } from '@scrow/core'
import { signer }       from './config.js'

console.log(signer.pubkey)

const addr   = 'wss://relay.damus.io'
const drafts = await DraftSession.list(addr, signer)

console.dir(drafts, { depth : null })
