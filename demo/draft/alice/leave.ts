import { DraftSession } from '@scrow/core'
import { signer }       from './config.js'
import { secret_id }    from '../terms.js'

const session = new DraftSession(secret_id, signer, {
  debug   : false,
  verbose : false
})

session.on('ready', () => {
  console.log('session:', session.data)
  if (session.is_member) {
    session.leave()
  }
})

session.on('leave', (data) => {
  console.log('left:', data)
})

await session.connect('wss://relay.damus.io')
