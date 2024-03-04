import {
  ContractData,
  DraftSession,
  EscrowAccount,
  EscrowContract
} from '@scrow/core'

import { client }       from '@scrow/demo/01_create_client.js'
import { config }       from '@scrow/demo/00_demo_config.js'
import { print_banner } from '@scrow/test'
import { secret_id }    from '../terms.js'

import { fund_mutiny_address, fund_regtest_address } from '@scrow/demo/util.js'

import { alias, fund_amt, role, signer, wit_tmpl } from './config.js'

/** ========== [ Draft Session ] ========== **/

// Create a draft session
const session = new DraftSession(signer, {
  debug   : false,
  verbose : false
})

// Create an account object.
const account = new EscrowAccount(client, signer)

// When the session is ready:
session.on('ready', async () => {
  console.log('bob draft ready')
  // If we are not a member:
  if (!session.is_member) {
    // Grab the policy from the roles list.
    console.log(`fetching role "${role}"...`)
    const policy = session.get_role(role)
    // Join the session as the buyer.
    console.log('joining the session...')
    session.join(policy.id)
    // Print to console.
    console.log(`${alias} joined the draft as role ${policy.title}`)
  }
})

session.on('error', console.log)

// Each time the session updates:
session.on('update', async () => {
  console.log('bob draft updated')
  console.log('is full      :', session.is_full)
  console.log('is approved  :', session.is_approved)
  console.log('is confirmed :', session.is_confirmed)
})

session.on('join', (msg) => {
  console.log('pubkey joined draft   :', msg.pub)
  console.log('pubkey joined as role :', msg.pol)
})

session.on('approve', (proof) => {
  const pub = proof.slice(0, 64)
  console.log('pubkey approved:', pub)
})

session.on('endorse', (proof) => {
  const pub = proof.slice(0, 64)
  console.log('pubkey endorsed:', pub)
})

session.on('full', () => {
  console.log('draft is full')
  // If all roles have been assigned:
  if (session.is_full) {
    // If we have not yet endorsed the draft:
    if (!session.is_approved) {
      // Endorse the draft.
      session.approve()
    }
  }
})

session.on('confirmed', () => {
  console.log('draft has enough signatures')
})

/** ========== [ Account Deposit ] ========== **/

function fund_contract (contract : ContractData) {
// When an account is received from the server:
  account.on('reserved', async () => {
    
    switch (config.network) {
      case 'mutiny':
      fund_mutiny_address(account.address, fund_amt)
      break
    case 'regtest':
      fund_regtest_address(account.address, fund_amt)
      break
    default:
      print_banner('make a deposit')
      console.log('copy this address :', account.address)
      console.log('send this amount  :', `${fund_amt} sats`)
      console.log('get funds here    :', config.faucet, '\n')   
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
  account.on('payment', async () => {
    // Commit the deposit to the contract.
    console.log('locking deposit...')
    account.commit(contract)
  })

  console.log('fetching account...')
  return account.reserve(14400)
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
  return contract.poll('settled', 30)
}

/** ========== [ Flow Control ] ========== **/

session.on('published', async (cid) => {
  console.log('draft published as cid:', cid)

  const contract = await EscrowContract.fetch(client, cid)

  await fund_contract(contract.data)
  await settle_contract(contract)
})

session.on('error', console.log)

await session.connect('wss://relay.damus.io', secret_id)
