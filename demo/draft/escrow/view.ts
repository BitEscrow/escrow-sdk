import { DraftSession } from '@scrow/core'
import { secret_id, signer } from '../terms.js'
import { client } from '@scrow/demo/01_create_client.js'

/** ========== [ Draft Session ] ========== **/

// Create a draft session
const session = new DraftSession(signer, {
  socket_config : { verbose : true, debug : false },
  store_config  : { verbose : true,  debug : false },
  verbose : true
})

session.on('ready', () => {
  console.log('updated at :', new Date(session.updated_at * 1000))
  console.log('init data  :')
  console.dir(session.data)
})

session.on('error', console.log)

await session.connect('wss://relay.damus.io', secret_id)

// const contract = await EscrowContract.fetch(client, '12898fc080cdc7ddbaf1d9a3fadf53fa45c27c48876d3dd49d81642bf7e2375b')

// console.log(contract)