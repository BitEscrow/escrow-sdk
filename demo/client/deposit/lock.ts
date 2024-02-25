import { print_banner } from '@scrow/test'
import { signers }      from '@scrow/demo/02_create_signer.js'
import { new_contract } from '@scrow/demo/05_create_contract.js'
import { deposit }      from '@scrow/demo/client/deposit/create.js'

const funder = signers[0]

deposit.on('status', (status) => {
  if (status === 'locked') {
    print_banner('locked deposit')
    console.dir(deposit.data, { depth : null })
    console.log('\n')
  }
})

await deposit.lock(new_contract, funder)

export { deposit }
