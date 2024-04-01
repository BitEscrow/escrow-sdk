import { print_banner } from '@scrow/test'
import { client }       from './01_create_client.js'
import { publish_req }  from './04_finish_proposal.js'

const DEMO_MODE = process.env.DEMO_MODE === 'true'

// Deliver proposal and endorsements to server.
const res = await client.contract.create(publish_req)
// Check if response is valid.
if (!res.ok) throw new Error(res.error)

/**
 * Define our published contract.
 */
export const new_contract = res.data.contract

if (DEMO_MODE) {
  print_banner('new contract')
  console.dir(new_contract, { depth : null })
}
