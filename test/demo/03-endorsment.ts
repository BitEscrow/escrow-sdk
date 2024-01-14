import { clients, proposal, roles } from './01-proposal.js'

const [ a_client, b_client, c_client ] = clients

proposal.join(roles.buyer, a_client)
proposal.join(roles.sales, b_client)

// check_membership
console.log('alice is enrolled :', a_client.has_membership(proposal))
console.log('bob is enrolled   :', b_client.has_membership(proposal))
console.log('carol is enrolled :', c_client.has_membership(proposal))

proposal.on('update', prop => {
  console.log('proposal updated:', prop.data.title)
})

proposal.join(roles.agent, c_client)

// endorse_proposal
export const signatures = [
  a_client.sign_proposal(proposal),
  b_client.sign_proposal(proposal),
  c_client.sign_proposal(proposal)
]

// verify_endorsement
console.log('endorsements:', signatures)

export const full_proposal = proposal.copy
