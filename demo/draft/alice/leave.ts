import { DraftSession } from '@scrow/core'
import { signer }       from './config.js'

import { address, secret_id } from '../terms.js'

const session = new DraftSession(signer, {
  debug   : false,
  verbose : false
})

session.on('ready', () => {
  console.log('session ready')
  console.log('session:', session.data)
  if (session.is_member) {
    console.log('member leaving session:', session.mship.pub)
    session.leave()
  }
})

session.on('leave', (mship) => {
  console.log('member left:', mship.pub)
  session.close()
})

await session.connect(address, secret_id)
