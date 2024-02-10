import { create_draft } from '@scrow/core/proposal'
import { DraftSession } from '@scrow/core'

import { client } from '@scrow/demo/01_create_client.js'

import { alias, policy, signer, template } from './00_config.js'

const new_draft = create_draft({
  proposal : template,
  roles    : [ policy ]
})

// Create the initial proposal (with your role info).
const session = new DraftSession(signer, { verbose : false })

session.on('error', err => console.log(err))

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
  if (
    draft.members.length === 3   && 
    draft.signatures.length >= 2 &&
    !draft.is_endorsed
  ) {
    await draft.endorse.sign()
    console.log(`${alias} endorsed the draft`)
  }
})

session.on('update', async (draft) => {
  if (draft.signatures.length === 3) {

    // Validate the data is correct.
    console.log('verifying the final draft...')
    draft.verify()

    console.log('publishing draft...')
    draft.publish(client)
  }
})

export { new_draft, session }
