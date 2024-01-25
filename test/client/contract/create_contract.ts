import { client, members } from '../proposal/configure_clients.js'
import { proposal, roles } from '../proposal/configure_proposal.js'

// Unpack our members for testing.
const [ a_mbr, b_mbr, c_mbr ] = members

// Request the buyer and seller to join the proposal.
proposal.join(roles.buyer, a_mbr)
proposal.join(roles.sales, b_mbr)
proposal.join(roles.agent, c_mbr)

// Have all memebers endorse the proposal.
export const signatures = [
  a_mbr.proposal.endorse(proposal),
  b_mbr.proposal.endorse(proposal),
  c_mbr.proposal.endorse(proposal)
]

// Submit the proposal to the API to create a contract.
const res = await client.contract.create(proposal, signatures)

// Check that the response is valid.
if (!res.ok) throw res.error

console.log('response:', res.data)
