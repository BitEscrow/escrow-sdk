import { print_banner }    from '@scrow/test'
import { create_witness }  from '@scrow/core/witness'
import { members }         from './02_create_signer.js'
import { client }          from './01_create_client.js'
import { active_contract } from './08_check_contract.js'

const [ a_signer, b_signer ] = members

const template = {
  action : 'close',
  method : 'endorse',
  path   : 'tails'
}

const { cid, terms } = active_contract

const token = a_signer.get_membership(terms).token

let witness = create_witness(terms.programs, token.pub, template)

witness = a_signer.endorse.witness(active_contract, witness)
witness = b_signer.endorse.witness(active_contract, witness)

print_banner('witness statement')
console.dir(witness, { depth : null })

const res = await client.contract.submit(cid, witness)

// Check the response is valid.
if (!res.ok) throw new Error(res.error)

print_banner('settled contract')
console.dir(res.data.contract, { depth : null })
