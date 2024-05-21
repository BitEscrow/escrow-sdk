import { print_banner } from '@scrow/test'
import { DraftUtil }    from '@scrow/sdk/client'

import { signers }         from './02_create_signer.js'
import { proposal, roles } from './03_create_proposal.js'

const DEMO_MODE = process.env.VERBOSE === 'true'

/**
 * Unpack our list of signers.
 */
const [ a_signer, b_signer, c_signer ] = signers

/**
 * Create a DraftSession object. This data object is
 * useful for collaboration between signing devices.
 */
let draft = DraftUtil.create({ proposal, roles })

/**
 * For each role in the proposal, we are going to request
 * a member's signing device to join the proposal as that
 * role, adding payment information as needed.
 */
const seats = draft.roles.map(e => e.id)

draft = a_signer.draft.join(seats[0], draft)
draft = b_signer.draft.join(seats[1], draft)
draft = c_signer.draft.join(seats[2], draft)

/**
 * For each signer, we are going to collect a signature
 * endorsement. This step is optional, but we can use it
 * to signal readiness for a proposal to be submitted.
 */
signers.forEach(mbr => {
  draft = mbr.draft.endorse(draft)
})

/**
 * Verify the proposal is complete, all positions are 
 * filled, and endorsements are valid.
 */
DraftUtil.verify(draft)

/**
 * Create a publish request. This is a request body for
 * publishing a contract on the escrow server.
 */
const publish_req = DraftUtil.publish(draft)

if (DEMO_MODE) {
  print_banner('final draft')
  console.dir(draft, { depth : null })
}

export { publish_req }
