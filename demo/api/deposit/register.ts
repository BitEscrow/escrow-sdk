/**
 * Deposit API Demo for endpoint:
 * /api/deposit/:dpid/register
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/deposit/register
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

// Unpack deposit address.
const { deposit_addr } = new_account
// Define how much sats we want to deposit
const amt_total = 20_000
// Also compute a total amount in bitcoin.
const btc_total = amt_total / 100_000_000

/** ========== [ Print Deposit Info ] ========== **/

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
const utxos = await client.oracle.poll_address(deposit_addr, ival, retries, true)

print_banner('address utxos')
console.log('utxos:', utxos)

// Define a funder from list of signers.
const funder = signers[0]
// Get the output data from the utxo.
const utxo = utxos[0].txspend
// Create a registration request.
const req = funder.deposit.register(new_account, 1, utxo)
// Deliver our registration request to the server.
const res = await client.deposit.register(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our data object.
export const open_deposit = res.data.deposit

print_banner('open deposit')
console.dir(open_deposit, { depth: null })
console.log('\n')
