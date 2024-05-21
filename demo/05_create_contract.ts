import CVM              from '@scrow/sdk/cvm'
import { print_banner } from '@scrow/test'

import { client }       from './01_create_client.js'
import { publish_req }  from './04_finish_proposal.js'

const DEMO_MODE = process.env.VERBOSE === 'true'

/**
 * We will need to pass in a reference to the scripting engine 
 * defined in the proposal, so that it can verify the terms set
 * for each program.
 */
const engine = CVM

/**
 * Request to create a new contract on the escrow server.
 */
const res = await client.contract.create(publish_req, engine)
// Check the server response is valid.
if (!res.ok) throw new Error(res.error)

/**
 * The server will respond with a new contract. This contract
 * will be published under a contract id (cid), which can be
 * referenced for reading and funding.
 */
const new_contract = res.data.contract

if (DEMO_MODE) {
  print_banner('new contract')
  console.dir(new_contract, { depth : null })
}

export { new_contract }