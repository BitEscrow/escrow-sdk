import { print_banner }    from '@scrow/test'
import { WitnessData }     from '@scrow/core'

import { sleep }           from './00_demo_config.js'
import { client }          from './01_create_client.js'
import { signers }         from './02_create_signer.js'
import { active_contract } from './08_check_contract.js'

const [ a_signer, b_signer ] = signers

const template = {
  action : 'close',
  method : 'endorse',
  path   : 'tails'
}

const contract = active_contract

let witness : WitnessData

// Alice signs the initial statement.
witness = a_signer.witness.sign(contract, template)
// Bob endoreses the statement from Alice.
witness = b_signer.witness.endorse(contract, witness)

print_banner('witness statement')
console.dir(witness, { depth : null })

const res = await client.contract.submit(contract.cid, witness)

// Check the response is valid.
if (!res.ok) throw new Error(res.error)

const settled_contract = res.data.contract

print_banner('settled contract')
console.dir(settled_contract, { depth : null })

if (!settled_contract.spent) {
  throw new Error('failed to spend contract!')
}

print_banner('final transaction')

console.log('waiting a few seconds for tx to propagate the pool...\n')
await sleep(5000)

const txdata = await client.oracle.get_txdata(settled_contract.spent_txid)

console.dir(txdata, { depth : null })

print_banner('demo complete!')
