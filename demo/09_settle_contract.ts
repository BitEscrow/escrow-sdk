import { print_banner }    from '@scrow/test'
import { get_vm_config }   from '@scrow/sdk/vm'
import { WitnessData }     from '@scrow/sdk/core'
import { assert, sleep }   from '@scrow/sdk/util'
import CVM                 from '@scrow/sdk/cvm'

import { client }          from './01_create_client.js'
import { signers }         from './02_create_signer.js'
import { active_contract } from './08_check_contract.js'

const DEMO_MODE = process.env.DEMO_MODE === 'true'

/** ========== [ Create Statement ] ========== **/

// Unpack our list of signers.
const [ a_signer, b_signer ] = signers

const config = get_vm_config(active_contract)
const vmdata = CVM.init(config)

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

if (DEMO_MODE) {
  print_banner('witness statement')
  console.dir(witness, { depth : null })
}

/** ========== [ Submit Statement ] ========== **/

// Submit the signed statement to the server.
const res = await client.vm.submit(vmdata.vmid, witness)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the vm receipt.
const vm_receipt = res.data.vmdata

if (DEMO_MODE) {
  print_banner('vm receipt')
  console.dir(vm_receipt, { depth : null })
}

/** ========== [ Review Settlement ] ========== **/

// Assert that a settled contract exists.
assert.exists(res.data.contract, 'settled contract was not returned')
// Unpack the settled contract from the response.
const settled_contract = res.data.contract

if (DEMO_MODE) {
  print_banner('settled contract')
  console.dir(settled_contract, { depth : null })
}

/** ========== [ Review Transaction ] ========== **/

// Assert that the contract is spent.
assert.ok(settled_contract.spent, 'contract has not been spent')
// Unpack the txid from the settled contract.
const txid = settled_contract.spent_txid

if (DEMO_MODE) {
  print_banner('final transaction')
  console.log('waiting a few seconds for tx to propagate the pool...\n')
  await sleep(5000)

  // Fetch the settlement tx from the oracle.
  const txdata = await client.oracle.get_txdata(txid)
  // Print the transaction data to console.
  console.dir(txdata, { depth : null })

  print_banner('demo complete!')
  console.log('view your transaction here:')
  console.log(`\n${client.oracle_url}/tx/${txid}\n`)
}

await sleep(2000)

export { settled_contract, witness }
