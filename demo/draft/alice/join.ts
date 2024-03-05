import { DraftSession } from '@scrow/core'
import { signer }       from './config.js'
import { secret_id }    from '../terms.js'

const role = 'buyer'

const session = new DraftSession(signer, {
  debug   : false,
  verbose : false
})

session.on('ready', () => {
  console.log('session ready')
  console.log('session:', session.data)
  if (!session.is_member) {
    if (session.has_role(role)) {
      console.log('joining session as:', role)
      const pol = session.get_role(role)
      session.join(pol.id)
    }
  } else if (session.is_member) {
    console.log('member leaving session:', session.mship.pub)
    session.leave()
  }
})

session.on('update', () => {
  console.log('session updated')
  if (session.is_member) {
    console.log('member leaving session:', session.mship.pub)
    session.leave()
  }
})

session.on('join', (mship) => {
  console.log('member joined:', mship.pub)
})

session.on('leave', (mship) => {
  console.log('member left:', mship.pub)
  session.close()
})

await session.connect('wss://relay.damus.io', secret_id)
