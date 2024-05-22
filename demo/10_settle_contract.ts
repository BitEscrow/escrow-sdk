import { print_banner }    from '@scrow/test'
import { assert, sleep }   from '@scrow/sdk/util'
import CVM                 from '@scrow/sdk/cvm'

import { client }          from './01_create_client.js'
import { active_contract } from './08_check_activation.js'
import { locked_deposit }  from './07_deposit_funds.js'
import { witness }         from './09_submit_statements.js'

const DEMO_MODE = process.env.VERBOSE === 'true'

/**
 * Fetch the latest contract state from the escrow server,
 * which should now be closed and spent.
 */
const res = await client.contract.read(active_contract.cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the contract from the response.
const spent_contract = res.data.contract
// Assert that the contract is spent.
assert.ok(spent_contract.spent, 'contract has not been spent')

/**
 * Verify the entine contract state, including the funds spent
 * and execution of witness statements.
 */
client.contract.verify({
  contract   : spent_contract,
  engine     : CVM,
  funds      : [ locked_deposit ],
  statements : [ witness ]
})

// Unpack the txid from the spent contract.
const txid = spent_contract.spent_txid

if (DEMO_MODE) {
  print_banner('spent contract')
  console.dir(spent_contract, { depth : null })

  print_banner('final transaction')
  console.log('waiting a few seconds for tx to propagate the pool...\n')
  await sleep(5000)

  // Fetch the settlement tx from the oracle.
  const txdata = await client.oracle.get_tx(txid)
  // Print the transaction data to console.
  console.dir(txdata, { depth : null })

  print_banner('demo complete!')
  console.log('view your transaction here:')
  console.log(`\n${client._config.oracle_url}/tx/${txid}\n`)
}

await sleep(2000)

export { spent_contract }
