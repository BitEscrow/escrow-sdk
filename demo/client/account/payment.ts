/**
 * Account Class API Demo for event: "payment"
 * 
 * You can run this demo using the shell command:
 * yarn load demo/client/account/payment
 */

import { print_banner }  from '@scrow/test'
import { config }        from '@scrow/demo/00_demo_config.js'
import { account }       from '@scrow/demo/client/account/reserved.js'

import {
  fund_mutiny_address,
  fund_regtest_address
} from '@scrow/demo/util.js'

const is_demo = import.meta.url === `file://${process.argv[1]}`

// Specify a funding amount (in sats).
const fund_amt = 20_000

// Setup a listener.
account.on('reserved', async () => {
  switch (config.network) {
    case 'mutiny':
    fund_mutiny_address(account.address, fund_amt)
    break
  case 'regtest':
    fund_regtest_address(account.address, fund_amt)
    break
  default:
    print_banner('make a deposit')
    console.log('copy this address :', account.address)
    console.log('send this amount  :', `${fund_amt} sats`)
    console.log('get funds here    :', config.faucet, '\n')   
  }

  // Define our polling config.
  let ival = 10, retries = 30
  // Poll the oracle until we receive a utxo.
  await account.poll(ival, retries)
})

// Listen for when the account performs a fetch (for utxos):
account.on('fetch', () => {
  if (!account.is_funded) {
    console.log('checking the oracle for new payments...')
  }
})

account.on('payment', () => {
  print_banner('new payment')
  console.dir(account.payments, { depth : null })
  console.log('\n')
})

if (is_demo) {
  // Initiate the account request.
  await account.reserve(14400)
}

export { account }
