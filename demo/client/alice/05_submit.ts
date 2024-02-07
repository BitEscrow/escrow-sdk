import { client }           from '@scrow/demo/01_create_client.js'
import { signer, wit_tmpl } from './00_config.js'
import { cid }              from '../escrow/03_publish.js'

// Define our contract as the active contract.
const res = await client.contract.read(cid)
//
if (!res.ok) throw new Error(res.error)
// Initialize a variable for our witness data.
const contract = res.data.contract
//
const witness = signer.witness.sign(contract, wit_tmpl)
//
signer.client.contract.submit(cid, witness)
