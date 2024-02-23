/**
 * Contract API Demo for endpoint:
 * /api/contract/:cid/submit
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/contract/submit
 */

import { print_banner }    from '@scrow/test'
import { WitnessData }     from '@scrow/core'
import { client }          from '@scrow/demo/01_create_client.js'
import { signers }         from '@scrow/demo/02_create_signer.js'
import { active_contract } from '@scrow/demo/08_check_contract.js'

// Unpack our list of signers.
const [ a_signer, b_signer ] = signers

// Create a statement template.
const template = {
  action : 'close',
  method : 'endorse',
  path   : 'tails'
}

// Initialize a variable for our witness data.
let witness : WitnessData
// Alice signs the initial statement.
witness = a_signer.witness.sign(active_contract, template)
// Bob endoreses the statement from Alice.
witness = b_signer.witness.endorse(active_contract, witness)

print_banner('witness statement')
console.dir(witness, { depth : null })

// Define the contract id we will use.
const cid = active_contract.cid
// Submit the signed statement to the server.
const res = await client.contract.submit(cid, witness)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the contract from the response.
const updated_contract = res.data.contract

print_banner('updated contract')
console.dir(updated_contract, { depth : null })
console.log('\n')
