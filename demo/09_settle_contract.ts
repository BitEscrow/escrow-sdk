import { print_banner }    from '@scrow/test'
import { WitnessData }     from '@scrow/sdk'
import { assert, sleep }   from '@scrow/sdk/util'

import { client }          from './01_create_client.js'
import { signers }         from './02_create_signer.js'
import { active_contract } from './08_check_contract.js'

const DEMO_MODE = process.env.DEMO_MODE === 'true'

/** ========== [ Create Statement ] ========== **/

// Unpack our list of signers.
const [ a_signer, b_signer ] = signers

// Create a statement template.
const template = {
  action : 'close',
  method : 'endorse',
  path   : 'return'
}

// Define our contract as the active contract.
const contract = active_contract
// Initialize a variable for our witness data.
let witness : WitnessData
// Alice signs the initial statement.
witness = a_signer.witness.create(contract, template)
// Bob endoreses the statement from Alice.
witness = b_signer.witness.endorse(contract, witness)

if (DEMO_MODE) {
  print_banner('witness statement')
  console.dir(witness, { depth : null })
}

/** ========== [ Submit Statement ] ========== **/

// Submit the signed statement to the server.
const res = await client.vm.submit(contract.cid, witness)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Assert that the settled contract exists.
assert.ok(res.data.contract !== undefined, 'contract is not settled')
// Unpack the settled contract from the response.
const settled_contract = res.data.contract

if (settled_contract === undefined) {
  throw new Error('halp')
}

/** ========== [ Review Settlement ] ========== **/

if (DEMO_MODE) {
  print_banner('settled contract')
  console.dir(settled_contract, { depth : null })
}

/** ========== [ Review Transaction ] ========== **/

// Unpack the txid from the settled contract.
const txid = settled_contract.spent_txid
// Assert that the txid exists.
assert.ok(txid !== null, 'no tx broadcast')

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
