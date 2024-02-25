import { print_banner } from '@scrow/test'
import { signers }      from '@scrow/demo/02_create_signer.js'
import { deposit }      from '@scrow/demo/client/deposit/create.js'

const funder = signers[0]

deposit.on('fetch', () => {
  console.log('\npolling deposit for updates ...')
  console.log('current status:', deposit.status, '\n')

  if (deposit.status === 'open') {
    console.log('closing deposit ...')
    deposit.close(funder, 65)
  }


})

deposit.on('update', () => {
  console.log('deposit updated:', deposit.data)
})

deposit.on('status', (status) => {
  console.log('deposit status:', status)

  if (status === 'spent') {
    print_banner('closed deposit')
    console.dir(deposit.data, { depth : null })
    console.log('\n')
  }

})

await deposit.poll('spent', 30)

export { deposit }
