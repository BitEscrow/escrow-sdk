/**
 * Contract Class API Demo: Active Status
 * 
 * You can run this demo using the shell command:
 * yarn load demo/class/contract/active
 */

import { print_banner } from '@scrow/test'
import { contract }     from '@scrow/demo/class/contract/active.js'

await contract.poll('active', 5)

const vm = contract.vm

vm.on('fetch', () => {
  print_banner('new vm')
  console.dir(vm.data, { depth : null })
})

await vm.poll('init', 1)
