import { print_banner }       from '@scrow/test'
import { get_machine_config } from '@scrow/sdk/machine'
import { WitnessData }        from '@scrow/sdk/core'
import CVM                    from '@scrow/sdk/cvm'

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
 * to verify our statements were executed fairly by the server.
 */
const config = get_machine_config(active_contract)
// Define our script interpreter.
const engine = CVM
// Create the initial state of the machine.
let vmstate  = engine.init(config)

/**
 * Configure a template for our statement. This template is used to check
 * the contract for a matching program that will allow our statement.
 */
const template = {
  action : 'spend',
  method : 'endorse',
  path   : 'payout'
}

/**
 * Create and sign the witness statement using Alice's device, then
 * use Bob's device to provide an additional signature.
 */
let witness : WitnessData
// Alice signs the initial statement.
witness = a_signer.witness.create(vmstate, template)
// Bob endoreses the statement from Alice.
witness = b_signer.witness.endorse(vmstate, witness)

if (DEMO_MODE) {
  print_banner('witness statement')
  console.dir(witness, { depth : null })
}

/**
 * Submit the signed witness statement to the escrow server.
 */
const res = await client.machine.submit(witness)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)

/**
 * The server will respond with a signed receipt. This receipt 
 * commits to our statement being evaluated by the machine.
 */
const { receipt, vmdata } = res.data

/**
 * We can use our local copy of the vmstate to verify that our
 * witness statement was handled correctly by the escrow server.
 */
vmstate = engine.eval(vmstate, witness)
client.witness.verify(receipt, witness, vmstate)

if (DEMO_MODE) {
  print_banner('witness receipt')
  console.dir(receipt, { depth : null })
}

export { receipt, vmdata, witness }
