import { print_banner }       from '@scrow/test'
import { DEFAULT_POLICY }     from '@scrow/sdk/client'
import { verify_publish_req } from '@scrow/sdk/verify'
import CVM                    from '@scrow/sdk/cvm'

import { client }      from './01_create_client.js'
import { publish_req } from './04_finish_proposal.js'

const DEMO_MODE = process.env.VERBOSE === 'true'

/**
 * To verify a proposal for publishing, we need to
 * pass in a reference to the scripting engine that
 * will be used, so it can verify the program terms.
 */
const engine = CVM

/**
 * We also need a reference to the server's escrow
 * policy, which may change depending on the server.
 */
const policy = DEFAULT_POLICY.proposal

/**
 * Verify that the publish request is valid, and
 * fits within the policy of the escrow server.
 */
verify_publish_req(engine, policy, publish_req)

/**
 * Request to create a new contract on the escrow server.
 */
const res = await client.contract.create(publish_req)
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