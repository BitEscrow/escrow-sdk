import { EscrowContract } from '@scrow/core'

import { client } from '@scrow/demo/01_create_client.js'
import { draft }  from '@scrow/demo/04_finish_draft.js'

export const contract = await EscrowContract.create(client, draft)
