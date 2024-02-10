import { DraftSession } from '@scrow/core'

import {
  alias,
  policy,
  signer
} from './00_config.js'

// Create a draft session
const session = new DraftSession(signer)

// Print the store data on update.
session.on('ready', async (draft) => {
  console.log('session ready')
  if (!draft.is_member) {
    await draft.membership.create(policy)
    console.log(`${alias} joined the draft`)
  }
})

session.on('update', async (draft) => {
  console.log('draft updated')
  if (draft.members.length === 3 && !draft.is_endorsed) {
    await draft.endorse.sign()
    console.log(`${alias} endorsed the draft`)
  }
})

session.on('publish', (cid) => {
  console.log('draft published as cid:', cid)
})

session.on('error', console.log)

export { session }
