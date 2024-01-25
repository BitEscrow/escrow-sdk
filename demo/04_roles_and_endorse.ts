import { print_banner }    from '@scrow/test'

import { signers }         from './02_create_signer.js'
import { roles, template } from './03_build_proposal.js'

const [ a_signer, b_signer, c_signer ] = signers

let proposal = template

proposal = a_signer.proposal.join(proposal, roles.buyer)
proposal = b_signer.proposal.join(proposal, roles.seller)
proposal = c_signer.proposal.join(proposal, roles.agent)

print_banner('completed proposal')
console.dir(proposal, { depth : null })

const signatures = signers.map(mbr => {
  return mbr.proposal.endorse(proposal)
})

export { proposal, signatures }
