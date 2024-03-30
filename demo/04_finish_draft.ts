import { print_banner }    from '@scrow/test'
import { create_draft }    from '@scrow/sdk/proposal'
import { signers }         from './02_create_signer.js'
import { proposal, roles } from './03_create_draft.js'

const DEMO_MODE = process.env.DEMO_MODE === 'true'

// Unpack our list of signers.
const [ a_signer, b_signer, c_signer ] = signers

// Define our negotiation session.
export let draft = create_draft({ proposal, roles })

// For each member, add their info to the proposal.
draft = a_signer.draft.join(draft.roles[0], draft)
draft = b_signer.draft.join(draft.roles[1], draft)
draft = c_signer.draft.join(draft.roles[2], draft)

// For each member, collect an endorsement signature.
signers.map(mbr => {
  const approve = mbr.draft.approve(draft)
  const endorse = mbr.draft.endorse(draft)
  draft.approvals.push(approve)
  draft.signatures.push(endorse)
})

if (DEMO_MODE) {
  print_banner('final draft')
  console.dir(draft, { depth : null })
}
