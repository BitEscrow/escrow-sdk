/**
 * Contract Class API Demo: Fund event.
 * 
 * You can run this demo using the shell command:
 * yarn load demo/class/contract/fund
 */

import { print_banner } from '@scrow/test'
import { signers }      from '@scrow/demo/02_create_signer.js'
import { contract }     from '@scrow/demo/class/contract/create.js'
import { deposit }      from '@scrow/demo/class/deposit/create.js'

const funder = signers[0]

contract.on('fund', (payment) => {
  print_banner('new payment')
  console.dir(payment, { depth : null })
  console.log('\n')
})

deposit.lock(contract.data, funder)

await contract.poll('active', 5)
