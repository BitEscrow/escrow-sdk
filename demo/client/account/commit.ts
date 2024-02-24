/**
 * Account Class API Demo for event: "commit"
 * 
 * You can run this demo using the shell command:
 * yarn load demo/client/account/commit
 */

import { print_banner } from '@scrow/test'
import { new_contract } from '@scrow/demo/05_create_contract.js'
import { account }      from '@scrow/demo/client/account/payment.js'

const is_demo = import.meta.url === `file://${process.argv[1]}`

// Setup a listener.
account.on('payment', async (utxo) => {
  // If the account is funded:
  console.log('committing deposit ...')
  await account.commit(new_contract, utxo)
})

// Listen for when the registers a payment:
account.on('commit', ({ contract, deposit }) => {
  print_banner('funded contract')
  console.dir(contract, { depth : null })
  print_banner('locked deposit')
  console.dir(deposit, { depth : null })
  console.log('\n')
})

if (is_demo) {
  // Initiate the account request.
  await account.reserve(14400)
}

export { account }
