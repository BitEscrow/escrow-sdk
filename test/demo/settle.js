
import { signers }         from './signer.js'
import { client }          from './client.js'
import { active_contract } from './activate.js'

const sleep = (ms = 1000) => new Promise(res => setTimeout(res, ms))

/** ========== [ Create Statement ] ========== **/

// Unpack our list of signers.
const [ a_signer, b_signer ] = signers

// Create a statement template.
const template = {
  action : 'close',
  method : 'endorse',
  path   : 'tails'
}

// Define our contract as the active contract.
const contract = active_contract
// Initialize a variable for our witness data.
export let witness
// Alice signs the initial statement.
witness = a_signer.witness.sign(contract, template)
// Bob endoreses the statement from Alice.
witness = b_signer.witness.endorse(contract, witness)

/** ========== [ Submit Statement ] ========== **/

// Submit the signed statement to the server.
const res = await client.contract.submit(contract.cid, witness)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the settled contract from the response.
export const settled_contract = res.data.contract

/** ========== [ Review Settlement ] ========== **/

// If the contract is not spent, throw error.
if (!settled_contract.spent) {
  throw new Error('failed to spend contract!')
}

/** ========== [ Review Transaction ] ========== **/

export const txid = settled_contract.spent_txid

console.log('final transaction')
console.log('waiting a few seconds for tx to propagate the pool...\n')
await sleep(5000)

// Fetch the settlement tx from the oracle.
const txdata = await client.oracle.get_txdata(txid)
// Print the transaction data to console.
console.dir(txdata, { depth : null })

console.log('demo complete!')
console.log('view your transaction here:')
console.log(`\n${client._oracle}/tx/${txid}\n`)
