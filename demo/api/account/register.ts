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
import { new_account }  from '@scrow/demo/06_request_account.js'

import {
  fund_mutiny_address,
  fund_regtest_address
} from '@scrow/demo/util.js'

/** ========== [ Define Variables ] ========== **/

// Parse the value argument from the input.
const input_value = process.argv.slice(2).at(0)
// If an argument was not specified, throw error.
if (input_value === undefined) throw "must provide a utxo amount as an argument"

// Unpack account address.
const address     = new_account.deposit_addr
// Define an amount for the deposit.
const amount      = Number(input_value)
// Also compute a total amount in bitcoin.
const btc_total   = amount / 100_000_000
// Define a feerate for the return transaction.
const return_rate = config.feerate
// Define a funder from list of signers.
const signer      = signers[0]

/** ========== [ Fund Deposit Address ] ========== **/

switch (config.network) {
  case 'mutiny':
    fund_mutiny_address(address, amount)
    break
  case 'regtest':
    fund_regtest_address(address, amount)
    break
  default:
    print_banner('make a deposit')
    console.log('copy this address :', address)
    console.log('send this amount  :', `${amount} sats || ${btc_total} btc`)
    console.log('get funds here    :', config.faucet, '\n')   
}

await sleep(2000)

/** ========== [ Poll Deposit Status ] ========== **/

// Define our polling interval and retries.
const [ ival, retries ] = config.poll
// Poll for utxos from the account address.
const data = await client.oracle.poll_address(address, ival, retries)
const utxo = data.utxo

print_banner('address utxo')
console.log('utxo:', utxo)

/** ========== [ Register Deposit ] ========== **/

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
