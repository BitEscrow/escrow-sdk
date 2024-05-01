import { print_banner } from '@scrow/test'
import { DraftUtil }    from '@scrow/sdk/client'

import { signers }         from './02_create_signer.js'
import { proposal, roles } from './03_create_proposal.js'

const DEMO_MODE = process.env.VERBOSE === 'true'

// Unpack our list of signers.
const [ a_signer, b_signer, c_signer ] = signers

// Define our negotiation session.
let draft = DraftUtil.create({ proposal, roles }),
    seats = draft.roles.map(e => e.id)

// For each member, add their info to the proposal.
draft = a_signer.draft.join(seats[0], draft)
draft = b_signer.draft.join(seats[1], draft)
draft = c_signer.draft.join(seats[2], draft)

// For each member, collect an endorsement signature.
signers.forEach(mbr => {
  draft = mbr.draft.endorse(draft)
})

DraftUtil.verify(draft)

const publish_req = DraftUtil.publish(draft)

if (DEMO_MODE) {
  print_banner('final draft')
  console.dir(draft, { depth : null })
}

export { publish_req }