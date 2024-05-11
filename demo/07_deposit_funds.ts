import { print_banner } from '@scrow/test'
import { sleep }        from '@scrow/sdk/util'

import { config }       from './00_demo_config.js'
import { client }       from './01_create_client.js'
import { signers }      from './02_create_signer.js'
import { new_contract } from './05_create_contract.js'
import { new_account }  from './06_request_account.js'

import {
  fund_regtest_address,
  fund_mutiny_address
} from './util.js'

const DEMO_MODE = process.env.VERBOSE === 'true'

/** ========== [ Verify the Account ] ========== **/

// Define our depositor from the signers.
export const funder = signers[0]
// Verify the deposit.
funder.account.verify(new_account)

/** ========== [ Calculate Deposit Amount ] ========== **/

// Unpack account address.
const { deposit_addr } = new_account
// Compute a txfee from the feerate.
const vin_fee   = new_contract.fund_txfee
// Compute a total amount (in sats) with the txfee.
const amt_total = new_contract.tx_total + vin_fee
// Also compute a total amount in bitcoin.
const btc_total = amt_total / 100_000_000

/** ========== [ Print Deposit Info ] ========== **/

switch (config.network) {
  case 'mutiny':
    fund_mutiny_address(deposit_addr, amt_total)
    break
  case 'regtest':
    fund_regtest_address(deposit_addr, amt_total, true)
    break
  default:
    print_banner('make a deposit')
    console.log('copy this address :', deposit_addr)
    console.log('send this amount  :', `${amt_total} sats || ${btc_total} btc`)
    console.log('get funds here    :', config.faucet, '\n')   
}

await sleep(2000)

/** ========== [ Poll Deposit Status ] ========== **/

const [ ival, retries ] = config.poll

let tries  = 1,
    txdata = await client.oracle.get_latest_utxo(deposit_addr)

// While there are no utxos (and we still have tries):
while (txdata === null && tries < retries) {
  // Print current status to console.
  console.log(`[${tries}/${retries}] checking address in ${ival} seconds...`)
  // Sleep for interval number of secords.
  await sleep(ival * 1000)
  // Check again for utxos at address.
  txdata = await client.oracle.get_latest_utxo(deposit_addr)
  // Increment our tries counter
  tries += 1
}

// If we still have no utxos, throw error.
if (txdata === null) throw new Error('utxo not found')

if (DEMO_MODE) {
  console.log('\nutxo:', txdata)
}

/** ========== [ Create Deposit Covenant ] ========== **/

// Define a feerate for the return transaction.
const feerate = config.feerate
// Request the funders device to sign a covenant.
const req     = funder.account.commit(new_account, new_contract, feerate, txdata.txout)
// Deliver our registration request to the server.
const res     = await client.account.commit(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)

/**
 * Define our locked deposit.
 */
export const funded_contract = res.data.contract
export const locked_deposit  = res.data.deposit

/** ========== [ Export New Data ] ========== **/

if (DEMO_MODE) {
  print_banner('funded contract')
  console.dir(funded_contract, { depth : null })
  print_banner('locked deposit')
  console.dir(locked_deposit, { depth : null })
}
