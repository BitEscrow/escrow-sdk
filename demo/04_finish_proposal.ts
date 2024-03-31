import { print_banner }       from '@scrow/test'
import { create_role_policy } from '@scrow/sdk/client'

import { signers }         from './02_create_signer.js'
import { proposal, roles } from './03_create_proposal.js'

const DEMO_MODE = process.env.DEMO_MODE === 'true'

// Unpack our list of signers.
const [ a_signer, b_signer, c_signer ] = signers

// Define our negotiation session.
const policies = roles.map(e => create_role_policy(e))
let   draft    = { ...proposal }

// For each member, add their info to the proposal.
draft = a_signer.proposal.join(policies[0], draft)
draft = b_signer.proposal.join(policies[1], draft)
draft = c_signer.proposal.join(policies[2], draft)

// For each member, collect an endorsement signature.
const signatures = signers.map(mbr => mbr.proposal.endorse(draft))

if (DEMO_MODE) {
  print_banner('final draft')
  console.dir(draft, { depth : null })
}

export { draft, signatures }