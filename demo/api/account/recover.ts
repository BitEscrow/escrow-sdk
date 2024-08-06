import { print_banner } from '@scrow/test'
import { now }          from '@scrow/sdk/util'

import { config }      from '@scrow/demo/00_demo_config.js'
import { client }      from '@scrow/demo/01_create_client.js'
import { funder }      from '@scrow/demo/02_create_signer.js'
import { new_account } from '@scrow/demo/06_request_account.js'

// Define an address to receive the funds.
const address  = funder.wallet.new(now())
// Define a feerate for the return transaction.
const ret_rate = config.feerate
// Grab the first utxo from the deposit account.
const res = await client.oracle.get_first_utxo(new_account.deposit_addr)
// Check that the response is valid.
if (res === null) throw new Error('utxo not found')
// Create a signed recovery transaction for the utxo.
const txhex = funder.account.recover(new_account, address, ret_rate, res.utxo)
// Deliver our registration request to the server.
const txid  = await client.oracle.broadcast_tx(txhex)

print_banner('recovery txid')
console.log(txid)
console.log('\n')
