/**
 * Account Class API Demo for event: "reserved"
 * 
 * You can run this demo using the shell command:
 * yarn load demo/client/account/reserved
 */

import { EscrowAccount } from '@scrow/core'
import { print_banner }  from '@scrow/test'
import { client }        from '@scrow/demo/01_create_client.js'
import { signers }       from '@scrow/demo/02_create_signer.js'

const is_demo = import.meta.url === `file://${process.argv[1]}`

// Select a signer to use.
const signer = signers[0]
// Create a new account class.
const account = new EscrowAccount(client, signer)

// Setup a listener.
account.on('reserved', () => {
  print_banner('new account')
  console.dir(account.data, { depth : null })
  console.log('\n')
})

if (is_demo) {
  // Initiate the account request.
  await account.reserve(14400)
}

export { account }