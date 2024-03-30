import { DraftSession } from '@scrow/core'
import { signer }       from './config.js'

import { address, secret_id } from '../terms.js'

const role = 'buyer'

const session = new DraftSession(signer, {
  debug   : false,
  verbose : true
})

session.on('error', console.log)
session.on('reject', console.log)

session.on('ready', () => {
  console.log('session ready')
  console.log('session:', session.data)
  if (!session.is_member) {
    if (session.has_role(role)) {
      console.log('joining session as:', role)
      const pol = session.get_role(role)
      session.join(pol.id)
    }
  } else {
    console.log('you are already a member')
  }
})

session.on('join', (mship) => {
  console.log('member joined:', mship.pub)
  // session.close()
})

await session.connect(address, secret_id)
