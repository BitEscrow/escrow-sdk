import { Lib } from '@scrow/core/client'

import { print_banner } from './utils.js'

import {
  clients,
  proposal,
  roles
} from './01-proposal.js'

import { get_role_policy } from '@scrow/core/policy'


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

const buyer_cred = a_client.membership.create()
const sales_cred = b_client.membership.create()
const agent_cred = c_client.membership.create()

const buyer_role = get_role_policy(roles, 'buyer')
const sales_role = get_role_policy(roles, 'seller')
const agent_role = get_role_policy(roles, 'agent')

let prop = { ...proposal }

print_banner('INITIAL PROPOSAL')
console.log(prop)

/**
 * JOINING A PROPOSAL
 * 
 * We will perform the following:
 *   - Select a role policy from the list
 *   - Use an escrow client to join the existing proposal.
 */

prop = Lib.add_membership(buyer_cred, buyer_role, prop)

print_banner('BUYER JOINED PROPOSAL')
console.log(prop)

prop = Lib.add_membership(sales_cred, sales_role, prop)

print_banner('SELLER JOINED PROPOSAL')
console.log(prop)

/**
 * LEAVING A PROPOSAL
 * 
 * It is easy to remove a member from the proposal, and scrub any of their information.
 * 
 */

prop = Lib.rem_membership(buyer_cred, prop)

print_banner('BUYER LEFT PROPOSAL')
console.log(prop)

prop = Lib.rem_membership(sales_cred, prop)

print_banner('SELLER LEFT PROPOSAL')
console.log(prop)

prop = Lib.add_membership(buyer_cred, buyer_role, prop)
prop = Lib.add_membership(sales_cred, sales_role, prop)
prop = Lib.add_membership(agent_cred, agent_role, prop)

print_banner('ALL PARTIES JOINED')
console.log(prop)

export const full_proposal = { ...prop }
