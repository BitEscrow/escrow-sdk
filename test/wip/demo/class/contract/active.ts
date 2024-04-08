/**
 * Contract Class API Demo: Active Status
 * 
 * You can run this demo using the shell command:
 * yarn load demo/class/contract/active
 */

import { print_banner } from '@scrow/test'
import { signers }      from '@scrow/demo/02_create_signer.js'
import { contract }     from '@scrow/demo/class/contract/create.js'
import { deposit }      from '@scrow/demo/class/deposit/create.js'

const is_demo = import.meta.url.includes(`file://${process.argv[1]}`)

const funder = signers[0]

contract.on('status', (status) => {
  if (status === 'active') {
    print_banner('active contract')
    console.dir(contract.data, { depth : null })
  }
})

deposit.lock(contract.data, funder)

if (is_demo) {
  await contract.poll('active', 5)
}

export { contract }
