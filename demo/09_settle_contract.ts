import { print_banner }    from '@scrow/test'
import { WitnessData }     from '@scrow/core'

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

print_banner('settled contract')
console.dir(res.data.contract, { depth : null })
