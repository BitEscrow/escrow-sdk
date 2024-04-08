/**
 * Deposit Class API Demo: Create a Deposit
 * 
 * You can run this demo using the shell command:
 * yarn load demo/class/deposit/create
 */

import { EscrowDeposit } from '@scrow/core'
import { print_banner }  from '@scrow/test'
import { client }        from '@scrow/demo/01_create_client.js'
import { new_contract }  from '@scrow/demo/05_create_contract.js'
import { new_account }   from '@scrow/demo/06_request_account.js'
import { fund_address }  from '@scrow/demo/util.js'

const is_demo = import.meta.url === `file://${process.argv[1]}`

const address = new_account.address
const vin_fee = new_contract.feerate * 65
const amount  = new_contract.total + vin_fee
const utxo    = await fund_address(address, amount)
const deposit = await EscrowDeposit.create(client, new_account, utxo)

if (is_demo) {
  print_banner('open deposit')
  console.dir(deposit.data, { depth : null })
}

export { deposit }
