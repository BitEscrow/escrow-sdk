import {
  EscrowAccount,
  EscrowContract
} from '@scrow/core'

import { print_banner }  from '@scrow/test'
import { fund_address }  from '@scrow/demo/util.js'
import { config }        from '@scrow/demo/00_demo_config.js'
import { client }        from '@scrow/demo/01_create_client.js'
import { signers }       from '@scrow/demo/02_create_signer.js'
import { new_contract }  from '@scrow/demo/05_create_contract.js'

const FUND_AMT = 20_000
const signer   = signers[0]

// Create a contract class.
const contract = new EscrowContract(client, new_contract)
// Create a account class.
const account  = new EscrowAccount(client)
  
account.on('reserved', async () => {
  // If we are not on regtest:
  if (config.network !== 'regtest') {
    // Make a deposit to the specified address:
    print_banner('make a deposit')
    console.log('copy this address :', account.data.address)
    console.log('send this amount  :', `${FUND_AMT} sats`)
    console.log('get funds here    :', config.faucet, '\n')
  } else {
    // Use the automated payment for regtest testing.
    print_banner('sending deposit')
    fund_address(account.data.address, FUND_AMT)
  }

  // Define our polling config.
  let ival = 10, retries = 30

  // Poll the oracle until we receive a utxo.
  await account.poll(ival, retries)
})

// When the account performs a fetch (for utxos):
account.on('fetch', () => {
  // Print message to console.
  if (!account.is_funded) {
    console.log('checking the oracle for new payments...')
  }
})

// When the account updates:
account.on('update', () => {
  // If the account is funded:
  if (account.is_funded) {
    // Commit the deposit to the contract.
    console.log('locking deposit...')
    account.commit(new_contract, signer)
  }
})

contract.on('update', () => {
  console.log('contract status:', contract.status)
})

await account.request(signer, 14400)

contract.poll('active', 10, 10)
