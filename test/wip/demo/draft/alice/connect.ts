import { DraftSession } from '@scrow/core'
import { signer }       from './config.js'

import { address, secret_id } from '../terms.js'

/** ========== [ Draft Session ] ========== **/

// Create a draft session
const session = new DraftSession(signer, {
  debug   : false,
  verbose : true
})

session.on('error', console.log)
session.on('reject', console.log)

// When the session is ready:
session.on('ready', () => {
  console.log('session ready')
  console.dir(session.data, { depth : null })
})

session.on('update', () => {
  console.log('session update')
  //console.dir(session.data, { depth : null })
})

session.on('join', (mship) => {
  console.log('member joined:', mship.pub)
})

session.on('leave', (mship) => {
  console.log('member left:', mship.pub)
})



await session.connect('wss://nos.lol', '9112933aec51b7b79da16c64ce17e34fa892dd34acd6a005d7ea8db45fffa38f')
