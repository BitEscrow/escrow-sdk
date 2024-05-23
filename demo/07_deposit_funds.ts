import { print_banner }         from '@scrow/test'
import { get_contract_balance } from '@scrow/sdk/contract'
import { sleep }                from '@scrow/sdk/util'

import { config }              from './00_demo_config.js'
import { client }              from './01_create_client.js'
import { new_contract }        from './05_create_contract.js'
import { funder, new_account } from './06_request_account.js'

import {
  fund_regtest_address,
  fund_mutiny_address
} from './util.js'

const DEMO_MODE = process.env.VERBOSE === 'true'

/**
 * Check the contract for the total sats balance that needs to be paid.
 * This balance will be the subtotal of the contract, plus transaction
 * fees. We also need to include an additional fee to cover our input.
 */
const amt_total = get_contract_balance(new_contract) + new_contract.vin_txfee
// Also convert to a BTC amount (for bitcoin core).
const btc_total = amt_total / 100_000_000
// Define the address where we will send the funds.
const address   = new_account.deposit_addr
// Define a feerate for the return transaction.
const ret_rate  = config.feerate

/**
 * Depending on the network, try to fund the deposit address,
 * automatically. Othewrwise, display a dialog in the console.
 */
if (DEMO_MODE) print_banner('depositing funds')
switch (config.network) {
  case 'mutiny':
    fund_mutiny_address(address, amt_total)
    break
  case 'regtest':
    fund_regtest_address(address, amt_total, true)
    break
  default:
    console.log('copy this address :', address)
    console.log('send this amount  :', `${amt_total} sats || ${btc_total} btc`)
    console.log('get funds here    :', config.faucet, '\n')   
}

await sleep(2000)

/**
 * We are going to poll our block-chain oracle to watch for 
 * any coins recevied by the deposit address.
 */
const [ ival, retries ] = config.poll

let tries  = 1,
    txdata = await client.oracle.get_first_utxo(address)

// While there are no utxos (and we still have tries):
while (txdata === null && tries < retries) {
  // Print current status to console.
  console.log(`[${tries}/${retries}] checking address in ${ival} seconds...`)
  // Sleep for interval number of secords.
  await sleep(ival * 1000)
  // Check again for utxos at address.
  txdata = await client.oracle.get_first_utxo(address)
  // Increment our tries counter
  tries += 1
}

// If we still have no utxos, throw error.
if (txdata === null) throw new Error('utxo not found')

if (DEMO_MODE) {
  console.log('\nutxo:', txdata)
}

/**
 * Request to register a utxo with the escrow server, plus a covenant
 * that locks the utxo to the specified contract.
 */
const req = funder.account.commit(new_account, new_contract, ret_rate, txdata.utxo)
// Deliver our registration request to the server.
const res = await client.account.commit(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)

/**
 * The server will respond with the deposit account, which will be
 * registered and locked to the contract. An updated copy of the
 * contract is also provided in the response.
 */
const funded_contract = res.data.contract
const locked_deposit  = res.data.deposit

if (DEMO_MODE) {
  print_banner('funded contract')
  console.dir(funded_contract, { depth : null })
  print_banner('locked deposit')
  console.dir(locked_deposit, { depth : null })
}

export { funded_contract, locked_deposit }
