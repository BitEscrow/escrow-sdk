import { EscrowContract }  from '@scrow/core'
import { print_banner }    from '@scrow/test'
import { client }          from '@scrow/demo/01_create_client.js'
import { signers }         from '@scrow/demo/02_create_signer.js'
import { active_contract } from '@scrow/demo/08_check_contract.js'

// Unpack our list of signers.
const [ a_signer, b_signer ] = signers

// Create a statement template.
const template = {
  action : 'close',
  method : 'endorse',
  path   : 'tails'
}

// Create a contract class.
const contract = new EscrowContract(client, active_contract)
// Get the contract VM class.
const vm = contract.vm

await vm.sign(a_signer, template)
await vm.sign(b_signer, template)

vm.on('update', () => {
  print_banner('contract vm')
  console.dir(vm.data)
})

await contract.poll('settled', 5, 5)
