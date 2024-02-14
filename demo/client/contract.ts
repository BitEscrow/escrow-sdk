import { EscrowContract } from '@scrow/core'
import { print_banner }   from '@scrow/test'
import { client }         from '@scrow/demo/01_create_client.js'
import { new_contract }   from '@scrow/demo/05_create_contract.js'

// Create a contract class.
const contract = new EscrowContract(client, new_contract)

contract.on('fetch', () => {
  print_banner('contract data')
  console.dir(contract.data)
})

await contract.fetch()
