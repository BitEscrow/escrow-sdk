import { EscrowClient } from '@/client/index.js'

import {
  members,
  proposal,
  roles
} from './01-proposal.js'

// Unpack our members for testing.
const [ a_mbr, b_mbr, c_mbr ] = members

// Request the buyer and seller to join the proposal.
proposal.join(roles.buyer, a_mbr)
proposal.join(roles.sales, b_mbr)

// Check that all members are enrolled.
console.log('alice is enrolled :', a_mbr.has_membership(proposal))
console.log('bob is enrolled   :', b_mbr.has_membership(proposal))
console.log('carol is enrolled :', c_mbr.has_membership(proposal))

// You can hook into when the proposal is updated.
proposal.on('update', prop => {
  console.log('proposal updated:', prop.data.title)
})

// Request the agent to join the proposal.
proposal.join(roles.agent, c_mbr)

console.log('proposal id:', proposal.id)

// Have all memebers endorse the proposal.
export const signatures = [
  a_mbr.endorse.proposal(proposal),
  b_mbr.endorse.proposal(proposal),
  c_mbr.endorse.proposal(proposal)
]

console.log('endorsements:', signatures)

// Define a third-party client as a coordinator.
const client = new EscrowClient({
  hostname : 'http://localhost:3000',
  oracle   : 'http://172.21.0.3:3000'
})

// Submit the proposal to the API to create a contract.
const res = await client.contract.create(proposal, signatures)

// Check that the response is valid.
if (!res.ok) throw res.error

console.log('response:', res.data)
