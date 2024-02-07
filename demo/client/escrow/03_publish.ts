import { DraftSession } from '@scrow/core'
import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'

import { secret_id, signer } from './00_config.js'

// Define a proposal store.
const draft = new DraftSession(signer)

// Wait for the store to connect.
await draft.connect('wss://relay.damus.io', secret_id)

// Validate the data is correct.
draft.validate()

const res = await client.contract.create(draft)
//
if (!res.ok) throw new Error(res.error)

const new_contract = res.data.contract

export const cid = new_contract.cid

print_banner('new contract')
console.dir(new_contract, { depth : null })
console.log('\n')
