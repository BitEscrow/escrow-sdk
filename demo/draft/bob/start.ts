import {
  ContractData,
  DraftSession,
  EscrowAccount,
  EscrowContract
} from '@scrow/core'

import { client }              from '@scrow/demo/01_create_client.js'
import { config }              from '@scrow/demo/00_demo_config.js'
import { print_banner }        from '@scrow/test'
import { secret_id }           from '../terms.js'

import { fund_regtest_address, sleep } from '@scrow/demo/util.js'

import { alias, fund_amt, role, signer, wit_tmpl } from './config.js'

/** ========== [ Draft Session ] ========== **/

// Create a draft session
const session = new DraftSession(signer, {
  socket_config : { verbose : true, debug : false },
  store_config  : { verbose : true, debug : false },
  verbose : true
})
// Create an account object.
const account = new EscrowAccount(client)

// When the session is ready:
session.on('ready', async () => {
  console.log('session ready')
  console.dir(session.data)
  // If we are not a member:
  if (!session.is_member) {
    // Grab the policy from the roles list.
    console.log(`fetching role "${role}"...`)
    const policy = session.get_role(role)
    // Join the session as the buyer.
    console.log('joining the session...')
    await session.join(policy.id)
    // Print to console.
    console.log(`${alias} joined the draft as role ${policy.title}`)
  }
})

session.on('error', console.log)

// Each time the session updates:
session.on('update', async () => {
  console.log('session update')
  console.log('draft:', session.data)
  console.log('is full:', session.is_full)
  // If all roles have been assigned:
  if (session.is_full) {
    // If we have not yet endorsed the draft:
    console.log('is endorsed:', session.is_endorsed)
    if (!session.is_endorsed) {
      // Endorse the draft.
      session.endorse()
      console.log(`${alias} endorsed the draft`)
    }
  }
})

session.on('full', () => {
  console.log('all roles have been filled')
})

session.on('approved', () => {
  console.log('draft has enough signatures')
})

/** ========== [ Account Deposit ] ========== **/

function fund_contract (contract : ContractData) {
// When an account is received from the server:
  account.on('reserved', async () => {
    // If we are not on regtest:
    if (config.network !== 'regtest') {
      // Make a deposit to the specified address:
      print_banner('make a deposit')
      console.log('copy this address :', account.data.address)
      console.log('send this amount  :', `${fund_amt} sats`)
      console.log('get funds here    :', config.faucet, '\n')
    } else {
      // Use the automated payment for regtest testing.
      print_banner('sending deposit')
      await fund_regtest_address(account.data.address, fund_amt)
      await sleep(2000)
    }

    // Define our polling config.
    let ival = 10, retries = 30

    // Poll the oracle until we receive a utxo.
    await account.poll(ival, retries)
  })

  // When the account performs a fetch (for utxos):
  account.on('fetch', () => {
    // Print message to console.
    console.log('checking the oracle for new payments...')
  })

  // When the account updates:
  account.on('update', async () => {
    // If the account is funded:
    if (account.is_funded) {
      // Commit the deposit to the contract.
      console.log('locking deposit...')
      account.commit(contract, signer)
    }
  })

  console.log('fetching account...')
  return account.request(signer, 14400)
}

/** ========== [ Contract Settlement ] ========== **/

function settle_contract (contract : EscrowContract) {

  contract.on('update', async () => {
    console.log('status:', contract.status)
    if (contract.status === 'active') {
      console.log('sending statement to the vm...')
      await contract.vm.sign(signer, wit_tmpl)
    }
  })

  contract.on('update', (ct) => {
    if (ct.status === 'settled') {
      console.log('contract settled!')
      process.exit()
    }
  })

  console.log('polling contract...')
  return contract.poll('settled', 10, 30)
}

/** ========== [ Flow Control ] ========== **/

session.on('publish', async (cid) => {
  console.log('draft published as cid:', cid)

  const contract = await EscrowContract.fetch(client, cid)

  await fund_contract(contract.data)
  await settle_contract(contract)
})

session.on('error', console.log)

await session.connect('wss://relay.damus.io', secret_id)
