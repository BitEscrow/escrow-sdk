import { print_banner }   from '@scrow/test'
import { create_draft }   from '@/lib/proposal.js'
import { signers }        from './02_create_signer.js'
import { proposal, role } from './03_create_draft.js'

const DEMO_MODE = process.env.DEMO_MODE === 'true'

// Unpack our list of signers.
const [ a_signer, b_signer, c_signer ] = signers

// Define our negotiation session.
const roles   = Object.values(role)
  let session = create_draft({ proposal, roles })

// For each member, add their info to the proposal.
session = a_signer.draft.join(role.buyer, session)
session = b_signer.draft.join(role.seller, session)
session = c_signer.draft.join(role.agent, session)

// For each member, collect an endorsement signature.
signers.map(mbr => {
  const sig = mbr.draft.endorse(session)
  session.signatures.push(sig)
})

/**
 * Define our final proposal and endorsements.
 */
export const draft = session

if (DEMO_MODE) {
  print_banner('final draft')
  console.dir(session, { depth : null })
}