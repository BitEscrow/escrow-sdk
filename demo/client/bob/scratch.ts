import { EscrowContract } from '@scrow/core'

import { client }   from '@scrow/demo/01_create_client.js'
import { signer }   from '../terms.js'
import { wit_tmpl } from './config.js'

const cid = '12898fc080cdc7ddbaf1d9a3fadf53fa45c27c48876d3dd49d81642bf7e2375b'

const contract = await EscrowContract.fetch(client, cid)

console.log(contract)

await contract.vm.sign(signer, wit_tmpl)
