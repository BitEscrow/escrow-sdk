import { members }         from './configure_clients.js'
import { proposal, roles } from './configure_proposal.js'

// Unpack our members for testing.
const [ a_mbr, b_mbr, c_mbr ] = members

// Request the buyer and seller to join the proposal.
proposal.join(roles.buyer, a_mbr)
proposal.join(roles.sales, b_mbr)

// Check that all members are enrolled.
console.log('alice is enrolled :', a_mbr.membership.exists(proposal))
console.log('bob is enrolled   :', b_mbr.membership.exists(proposal))
console.log('carol is enrolled :', c_mbr.membership.exists(proposal))

// Request the agent to join the proposal.
proposal.join(roles.agent, c_mbr)

console.log('proposal:', proposal.data)
