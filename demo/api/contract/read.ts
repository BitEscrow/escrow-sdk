/**
 * Contract API Demo for endpoint:
 * /api/contract/:cid
 * 
 * You can run this demo using the shell command:
 * yarn load demo/api/contract/read
 */

import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'
// import { new_contract } from '@scrow/demo/05_create_contract.js'

// Define the contract id we will use.
const cid = '261f92ed4bbb488fbbad1753d0d39855058f94f92270c35dd089dc933f59c27e' //new_contract.cid
// Fetch a contract from the server by cid.
const res = await client.contract.read(cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const contract = res.data.contract

print_banner('new contract')
console.dir(contract, { depth : null })
console.log('\n')
