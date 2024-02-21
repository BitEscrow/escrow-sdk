import { print_banner }    from '@scrow/test'
import { WitnessData }     from '@scrow/core'
import { client }          from './01_create_client.js'
import { signers }         from './02_create_signer.js'
import { active_contract } from './08_check_contract.js'
import { sleep }           from './util.js'

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
export let witness : WitnessData
// Alice signs the initial statement.
witness = a_signer.witness.sign(contract, template)
// Bob endoreses the statement from Alice.
witness = b_signer.witness.endorse(contract, witness)

if (DEMO_MODE) {
  print_banner('witness statement')
  console.dir(witness, { depth : null })
}

/** ========== [ Submit Statement ] ========== **/

// Submit the signed statement to the server.
const res = await client.contract.submit(contract.cid, witness)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the settled contract from the response.
export const settled_contract = res.data.contract

/** ========== [ Review Settlement ] ========== **/

if (DEMO_MODE) {
  print_banner('settled contract')
  console.dir(settled_contract, { depth : null })
}

// If the contract is not spent, throw error.
if (!settled_contract.spent) {
  throw new Error('failed to spend contract!')
}

/** ========== [ Review Transaction ] ========== **/

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
  console.log(`\n${client._oracle}/tx/${txid}\n`)
}

await sleep(2000)
