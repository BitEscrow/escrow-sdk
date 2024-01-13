import { assert_valid } from 'node_modules/@cmdcode/crypto-tools/dist/lib/point.js'
import { clients, roles } from './01-proposal.js'
import { full_proposal }  from './02-negotiation.js'

const [ a_client, b_client, c_client ] = clients

// check_membership
console.log('alice is enrolled :', a_client.membership.exists(full_proposal))
console.log('bob is enrolled   :', a_client.membership.exists(full_proposal))
console.log('carol is enrolled :', a_client.membership.exists(full_proposal))

// endorse_proposal
a_client.sign_proposal(full_proposal)

// verify_endorsement