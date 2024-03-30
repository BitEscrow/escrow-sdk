/**
 * Account Class API Demo for event: "register"
 * 
 * You can run this demo using the shell command:
 * yarn load demo/class/account/register
 */

import { print_banner } from '@scrow/test'
import { account }      from '@scrow/demo/class/account/payment.js'

const is_demo = import.meta.url === `file://${process.argv[1]}`

// Setup a listener.
account.on('payment', async (utxo) => {
  // If the account is funded:
  console.log('registering deposit ...')
  await account.register(utxo)
})

// Listen for when the registers a payment:
account.on('register', (deposit) => {
  print_banner('open deposit')
  console.dir(deposit, { depth : null })
})

if (is_demo) {
  // Initiate the account request.
  await account.reserve(14400)
}

export { account }
