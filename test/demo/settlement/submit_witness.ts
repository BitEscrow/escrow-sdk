import { client, members } from '../proposal/configure_clients.js'
import { create_witness }  from '@/lib/witness.js'
import { WitnessTemplate } from '@/types/index.js'

const [ a_mbr ] = members

const cid = 'e60f610a4c53cc854efe0da891fed4d7cc61261ffe37ec8275de129ba20613fc'

// Request an account for the member to use.
const ct_res = await client.contract.read(cid)

// Check the response is valid.
if (!ct_res.ok) throw new Error(ct_res.error)

const { contract } = ct_res.data

const template : WitnessTemplate= {
  action : 'close',
  method : 'sign',
  path   : 'tails'
}

const pubkey = a_mbr.get_membership(contract.terms).token.pub

let witness = create_witness(contract, pubkey, template)

witness = a_mbr.endorse.witness(contract, witness)

console.log('witness:', witness)

const wit_res = await client.contract.submit(cid, witness)

// Check the response is valid.
if (!wit_res.ok) throw new Error(wit_res.error)

const { contract: new_contract } = wit_res.data

console.log('new contract:', new_contract)
