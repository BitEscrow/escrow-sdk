import { signers }  from '@scrow/demo/02_create_signer.js'
import { contract } from './create.js'
import { deposit }  from '../deposit/create.js'
import { print_banner } from '@scrow/test'

const funder = signers[0]

// contract.on('payment', () => {
//   print_banner('new payment')
//   console.dir(account.payments, { depth : null })
//   console.log('\n')
// })

await deposit.lock(contract.data, funder)
