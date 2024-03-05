import { DraftSession } from '@scrow/core'
import { signer }       from './config.js'
import { address }      from '../terms.js'

console.log(signer.pubkey)

const drafts = await DraftSession.list(address, signer)

console.dir(drafts, { depth : null })
