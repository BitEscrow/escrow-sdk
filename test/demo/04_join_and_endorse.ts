import { print_banner } from '@scrow/test'
import { members }      from './02_create_signer.js'

import {
  proposal,
  roles
} from './03_create_proposal.js'

const [ alice, bob, carol ] = members

proposal.join(roles.buyer,  alice)
proposal.join(roles.seller, bob)
proposal.join(roles.agent,  carol)

print_banner('completed proposal')
console.dir(proposal.data, { depth : null })

const signatures = members.map(mbr => {
  return mbr.endorse.proposal(proposal)
})

export { proposal, signatures }
