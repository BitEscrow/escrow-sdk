/**
 * Contract Class API Demo: Create a Contract
 * 
 * You can run this demo using the shell command:
 * yarn load demo/class/contract/create
 */

import { EscrowContract } from '@scrow/core'
import { print_banner }   from '@scrow/test'
import { client }         from '@scrow/demo/01_create_client.js'
import { draft }          from '@scrow/demo/04_finish_draft.js'

const is_demo = import.meta.url.includes(`file://${process.argv[1]}`)

const contract = await EscrowContract.create(client, draft)

if (is_demo) {
  print_banner('new contract')
  console.dir(contract, { depth : null })
}

export { contract }
