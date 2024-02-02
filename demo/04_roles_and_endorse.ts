import { print_banner }    from '@scrow/test'
import { signers }         from './02_create_signer.js'
import { roles, template } from './03_build_proposal.js'

const DEMO_MODE = process.env.DEMO_MODE === 'true'

// Unpack our list of signers.
const [ a_signer, b_signer, c_signer ] = signers

// Define our starting proposal.
let proposal = template

// For each member, add their info to the proposal.
proposal = a_signer.proposal.join(proposal, roles.buyer)
proposal = b_signer.proposal.join(proposal, roles.seller)
proposal = c_signer.proposal.join(proposal, roles.agent)

// For each member, collect an endorsement signature.
const signatures = signers.map(mbr => {
  return mbr.proposal.endorse(proposal)
})

/**
 * Define our final proposal and endorsements.
 */
export { proposal, signatures }

if (DEMO_MODE) {
  print_banner('completed proposal')
  console.dir(proposal, { depth : null })
}