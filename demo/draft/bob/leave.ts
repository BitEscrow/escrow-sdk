import { DraftSession } from '@scrow/core'
import { signer }       from './config.js'

import { address, secret_id } from '../terms.js'

const session = new DraftSession(signer, {
  debug   : false,
  verbose : true
})

session.on('error', console.log)
session.on('reject', console.log)

session.on('ready', () => {
  console.log('session ready')
  if (session.is_member) {
    console.log('member leaving session:', session.mship.pub)
    session.leave()
  } else {
    console.log('you are not a member')
  }
})

session.on('leave', (mship) => {
  console.log('member left:', mship.pub)
})

await session.connect(address, secret_id)
