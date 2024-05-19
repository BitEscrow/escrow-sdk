import { print_banner } from '@scrow/test'
import { config }       from './00_demo_config.js'
import { client }       from './01_create_client.js'
import { publish_req }  from './04_finish_proposal.js'

const DEMO_MODE = process.env.VERBOSE === 'true'

// Unpack the default script engine and server policy.
const { engine, policy } = config
// Deliver proposal and endorsements to server.
const res = await client.contract.create(publish_req, engine, policy.proposal)
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
