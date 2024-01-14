import { print_banner } from './utils.js'

import {
  clients,
  proposal,
  roles
} from './01-proposal.js'

/**
 * SETUP
 * 
 * We will start by defining the following:
 *  - A default proposal template (using get_proposal).
 *  - A few escrow clients (generated with a seed).
 *  - Some basic role policies (imported as 'roles').
 * 
 * See the 'utils.ts' and 'vectors.ts' files for more info.
 */
const [ a_client, b_client, c_client ] = clients

const buyer_cred = a_client.gen_membership()
const sales_cred = b_client.gen_membership()
const agent_cred = c_client.gen_membership()

print_banner('INITIAL PROPOSAL')
console.log(proposal.toJSON())

/**
 * JOINING A PROPOSAL
 * 
 * We will perform the following:
 *   - Select a role policy from the list
 *   - Use an escrow client to join the existing proposal.
 */

proposal.add_membership(buyer_cred, roles.buyer)

print_banner('BUYER JOINED PROPOSAL')
console.log(proposal.toJSON())

proposal.add_membership(sales_cred, roles.sales)

print_banner('SELLER JOINED PROPOSAL')
console.log(proposal.toJSON())

/**
 * LEAVING A PROPOSAL
 * 
 * It is easy to remove a member from the proposal, and scrub any of their information.
 * 
 */

proposal.rem_membership(buyer_cred)

print_banner('BUYER LEFT PROPOSAL')
console.log(proposal.toJSON())

proposal.rem_membership(sales_cred)

print_banner('SELLER LEFT PROPOSAL')
console.log(proposal.toJSON())

proposal.add_membership(buyer_cred, roles.buyer)
proposal.add_membership(sales_cred, roles.sales)
proposal.add_membership(agent_cred, roles.agent)

print_banner('ALL PARTIES JOINED')
console.log(proposal.toJSON())
