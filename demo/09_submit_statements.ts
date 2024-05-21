import { print_banner }    from '@scrow/test'
import { get_vm_config }   from '@scrow/sdk/vm'
import { WitnessData }     from '@scrow/sdk/core'
import CVM                 from '@scrow/sdk/cvm'

import { client }          from './01_create_client.js'
import { signers }         from './02_create_signer.js'
import { active_contract } from './08_check_activation.js'

const DEMO_MODE = process.env.VERBOSE === 'true'

/**
 * Unpack the signing devices for Alice (the "buyer"),
 * and Bob (the "seller").
 */
const [ a_signer, b_signer ] = signers

/**
 * Configure and initialize a machine instance. We'll use this
 * to validate our own statement, and to verify it was executed
 * fairly by the escrow server.
 */
const config = get_vm_config(active_contract)
// Create the initial state of the machine.
const vmdata = CVM.init(config)
// The machine id is derived from the contract.
const vmid   = vmdata.vmid

/**
 * Configure a template for our statement. This template is used to check
 * the contract for a matching program that will allow our statement.
 */
const template = {
  action : 'close',
  method : 'endorse',
  path   : 'payout'
}

/**
 * Create and sign the witness statement using Alice's device, then
 * use Bob's device to provide an additional signature.
 */
let witness : WitnessData
// Alice signs the initial statement.
witness = a_signer.witness.create(vmdata, template)
// Bob endoreses the statement from Alice.
witness = b_signer.witness.endorse(vmdata, witness)

if (DEMO_MODE) {
  print_banner('witness statement')
  console.dir(witness, { depth : null })
}

/**
 * Submit the signed witness statement to the escrow server.
 */
const res = await client.vm.submit(vmid, witness)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)

/**
 * The server will respond with a signed receipt of execution. This receipt
 * commits to the witness statement, plus the new state of the machine.
 */
const vm_receipt = res.data.receipt

/**
 * We can use the receipt to verify that our witness statement was processed 
 * correctly by the escrow server.
 */
client.witness.verify(vm_receipt, vmdata, witness)

if (DEMO_MODE) {
  print_banner('vm receipt')
  console.dir(vm_receipt, { depth : null })
}

export { vmdata, witness }
