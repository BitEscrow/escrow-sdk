/**
 * Deposit Class API Demo: Close a Deposit
 * 
 * You can run this demo using the shell command:
 * yarn load demo/class/deposit/close
 */

import { print_banner } from '@scrow/test'
import { signers }      from '@scrow/demo/02_create_signer.js'
import { deposit }      from '@scrow/demo/class/deposit/create.js'

const funder = signers[0]

deposit.on('fetch', () => {
  console.log('\npolling deposit for updates ...')
  console.log('current status:', deposit.status)
})

deposit.on('status', (status) => {
  if (status === 'open') {
    console.log('\nclosing deposit ...')
    deposit.close(funder, 1000)
  }

  if (status === 'spent') {
    print_banner('closed deposit')
    console.dir(deposit.data, { depth : null })
  }
})

await deposit.poll('spent', 30)

export { deposit }
