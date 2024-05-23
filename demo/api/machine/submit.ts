/**
 * Contract API Demo for endpoint:
 * /api/contract/:cid/submit
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/contract/submit
 */

import { print_banner }    from '@scrow/test'
import { WitnessData }     from '@scrow/sdk'
import { client }          from '@scrow/demo/01_create_client.js'
import { signers }         from '@scrow/demo/02_create_signer.js'

// Get the identifier from the input.
const vmid = process.argv.slice(2).at(0)
// If an identifier is not specified, throw an error
if (vmid === undefined) throw "must provide a 'vmid' value as an argument"
// Fetch the record from the server.
const vmres      = await client.machine.read(vmid)
// If the response is not ok, throw an error.
if (!vmres.ok) throw new Error('unable to fetch vm')
// Unpack the response data.
const vmstate = vmres.data.vmdata

// Unpack our list of signers.
const [ a_signer, b_signer ] = signers

// Create a statement template.
const template = {
  action : 'close',
  method : 'endorse',
  path   : 'payout'
}
// Initialize a variable for our witness data.
let witness : WitnessData
// Alice signs the initial statement.
witness = a_signer.witness.create(vmstate, template)
// Bob endoreses the statement from Alice.
witness = b_signer.witness.endorse(vmstate, witness)

print_banner('witness statement')
console.dir(witness, { depth : null })

// Submit the signed statement to the server.
const res = await client.machine.submit(witness)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data from the response.
const { receipt, vmdata } = res.data

print_banner('signed receipt')
console.dir(receipt, { depth : null })
console.log('\n')

print_banner('updated machine')
console.dir(vmdata, { depth : null })
console.log('\n')
