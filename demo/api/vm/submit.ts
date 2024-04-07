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

const vmid = 'c1c04cdde4a596879235a521f3185a6c56a318c92f9659b38a48fcc80a77d0b0'

const vm_res  = await client.vm.read(vmid)
if (!vm_res.ok) throw new Error('unable to fetch vm')
const vmdata  = vm_res.data.vmdata

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
witness = a_signer.witness.create(vmdata, template)
// Bob endoreses the statement from Alice.
witness = b_signer.witness.endorse(vmdata, witness)

print_banner('witness statement')
console.dir(witness, { depth : null })

// Submit the signed statement to the server.
const res = await client.vm.submit(vmid, witness)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the contract from the response.
const updated_contract = res.data.contract

print_banner('updated contract')
console.dir(updated_contract, { depth : null })
console.log('\n')
