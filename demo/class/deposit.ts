import { EscrowDeposit }  from '@scrow/core'
import { print_banner }   from '@scrow/test'
import { client }         from '@scrow/demo/01_create_client.js'
import { locked_deposit } from '@scrow/demo/07_deposit_funds.js'

// Create a contract class.
const deposit = new EscrowDeposit(client, locked_deposit)

deposit.on('fetch', () => {
  print_banner('deposit data')
  console.dir(deposit.data)
})

await deposit.fetch()
