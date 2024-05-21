/**
 * Account API Demo for endpoint:
 * /api/account/register
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/account/register
 */


import { print_banner } from '@scrow/test'
import { sleep }        from '@scrow/sdk/util'

import { config }       from '@scrow/demo/00_demo_config.js'
import { client }       from '@scrow/demo/01_create_client.js'
import { signers }      from '@scrow/demo/02_create_signer.js'
import { proposal }     from '@scrow/demo/03_create_proposal.js'
import { new_account }  from '@scrow/demo/06_request_account.js'

import {
  fund_mutiny_address,
  fund_regtest_address
} from '@scrow/demo/util.js'

/** ========== [ Define Variables ] ========== **/

// Unpack account address.
const { deposit_addr } = new_account
// Compute a txfee from the feerate.
const vin_fee     = 1000
// Compute a total amount (in sats) with the txfee.
const amt_total   = proposal.value + vin_fee
// Also compute a total amount in bitcoin.
const btc_total   = amt_total / 100_000_000
// Define a feerate for the return transaction.
const return_rate = config.feerate
// Define a funder from list of signers.
const signer      = signers[0]

/** ========== [ Fund Deposit Address ] ========== **/

switch (config.network) {
  case 'mutiny':
    fund_mutiny_address(deposit_addr, amt_total)
    break
  case 'regtest':
    fund_regtest_address(deposit_addr, amt_total)
    break
  default:
    print_banner('make a deposit')
    console.log('copy this address :', deposit_addr)
    console.log('send this amount  :', `${amt_total} sats || ${btc_total} btc`)
    console.log('get funds here    :', config.faucet, '\n')   
}

await sleep(2000)

/** ========== [ Poll Deposit Status ] ========== **/

// Define our polling interval and retries.
const [ ival, retries ] = config.poll
// Poll for utxos from the account address.
const data = await client.oracle.poll_address(deposit_addr, ival, retries, true)
const utxo = data.txout

print_banner('address utxo')
console.log('utxo:', utxo)

// Create a registration request.
const req = signer.account.register(new_account, return_rate, utxo)
// Deliver our registration request to the server.
const res = await client.account.register(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our data object.
const { deposit } = res.data

print_banner('open deposit')
console.dir(deposit, { depth: null })
console.log('\n')

export const open_deposit = deposit
