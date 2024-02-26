/**
 * Contract Class API Demo: Cancel a Contract
 * 
 * You can run this demo using the shell command:
 * yarn load demo/class/contract/cancel
 */

import { print_banner } from '@scrow/test'
import { moderator }    from '@scrow/demo/03_create_draft.js'
import { contract }     from '@scrow/demo/class/contract/create.js'

const signer = moderator

contract.on('status', (status) => {
  if (status === 'canceled') {
    print_banner('canceled contract')
    console.dir(contract.data, { depth : null })
  }
})

await contract.cancel(signer)
