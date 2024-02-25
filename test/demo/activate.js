import { config }          from '../config.js'
import { client }          from './client.js'
import { funded_contract } from './fund.js'

const sleep = (ms = 1000) => new Promise(res => setTimeout(res, ms))

// Unpack our polling config.
const [ ival, retries ] = config.poll
// The contract id we will be polling
const cid = funded_contract.cid

// Fetch the current contract data.
let res   = await client.contract.read(cid),
    tries = 1

console.log('awaiting confirmation of funds ...')
console.log('depending on the network, this could take a while!\n')

// While our response is ok, but the contract is not active (and we have tries):
while (res.ok && res.data.contract.activated === null && tries < retries) {
  // Print our current status to console.
  console.log(`[${tries}/${retries}] re-checking contract in ${ival} seconds...`)
  // Sleep for interval seconds.
  await sleep(ival * 1000)
  // Fetch the latest contract data.
  res = await client.contract.read(cid)
  // Increment our tries counter
  tries += 1
}

// If the response failed, throw error.
if (!res.ok) throw new Error(res.error)

// If the contract is still inactive, throw error.
if (res.data.contract.activated === null) {
  throw new Error('contract is not active')
}

/**
 * Define our active contract.
 */
export const active_contract = res.data.contract
