import { config }       from '../config.js'
import { client }       from './client.js'
import { signers }      from './signer.js'
import { new_contract } from './publish.js'
import { account }      from './account.js'

const sleep = (ms = 1000) => new Promise(res => setTimeout(res, ms))

/** ========== [ Verify the Account ] ========== **/

// Define our depositor from the signers.
export const depositor = signers[0]
// Verify the deposit.
depositor.account.verify(new_account)

/** ========== [ Calculate Deposit Amount ] ========== **/

// Unpack account address.
const { address } = account
// Compute a txfee from the feerate.
const vin_fee = new_contract.feerate * 65
// Compute a total amount (in sats) with the txfee.
const amount  = new_contract.total + vin_fee

console.log('funding address :', address)
console.log('sending amount  :', amount)

const url = `${config.faucet}/api/onchain`

const opt = {
  body    : JSON.stringify({ address,  sats : amount }),
  headers : { 'content-type' : 'application/json' },
  method  : 'POST'
}

await fetch(url, opt)

const [ ival, retries ] = config.poll

let tries = 1,
    utxos = await client.oracle.get_address_utxos(address)

// While there are no utxos (and we still have tries):
while (utxos.length === 0 && tries < retries) {
  // Print current status to console.
  console.log(`[${tries}/${retries}] checking address in ${ival} seconds...`)
  // Sleep for interval number of secords.
  await sleep(ival * 1000)
  // Check again for utxos at address.
  utxos = await client.oracle.get_address_utxos(address)
  // Increment our tries counter
  tries += 1
}

// If we still have no utxos, throw error.
if (utxos.length === 0) throw new Error('utxo not found')

console.log('\nutxo:', utxos[0])

/** ========== [ Create Deposit Covenant ] ========== **/

// Choose our first signer as the funder.
const signer     = signers[0]
// Get the output data from the utxo.
const utxo       = utxos[0].txspend
// Request the funders device to sign a covenant.
const commit_req = signer.account.commit(new_account, new_contract, utxo)
// Deliver our registration request to the server.
const res = await client.deposit.commit(commit_req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)

/**
 * Define our deposit and funded contract.
 */
export const funded_contract = res.data.contract
export const locked_deposit  = res.data.deposit
