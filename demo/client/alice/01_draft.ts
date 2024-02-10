import { DraftSession, EscrowAccount } from '@scrow/core'

import {
  alias,
  policy,
  signer
} from './00_config.js'
import { print_banner } from '@scrow/test'
import { fund_address } from '@scrow/demo/util.js'
import { sleep } from '@/lib/util.js'
import { config } from '@scrow/demo/00_demo_config.js'

// Create a draft session
const session = new DraftSession(signer)
const account = new EscrowAccount(client)

// Print the store data on update.
session.on('ready', async () => {
  console.log('session ready')
  if (!session.is_member) {
    await session.membership.create(policy)
    console.log(`${alias} joined the draft`)
  }
})

session.on('update', async (draft) => {
  console.log('draft updated')
  if (draft.members.length === 3 && !draft.is_endorsed) {
    await draft.endorse.sign()
    console.log(`${alias} endorsed the draft`)
  }
})

account.on('reserved', async (acct) => {
  if (config.network !== 'regtest') {
    print_banner('make a deposit')
    console.log('copy this address :', acct.data.address)
    console.log('send this amount  :', `${fund_amt} sats`)
    console.log('get funds here    :', config.faucet, '\n')
  } else {
    print_banner('sending deposit')
    await fund_address(acct.data.address, fund_amt)
    await sleep(2000)
  }

  let ival = 10, retries = 30

  await acct.poll(ival, retries)
})

account.on('fetch', () => {
  console.log('checking the oracle for new payments...')
})

export { account }


session.on('publish', async (cid : string) => {
  console.log('draft published as cid:', cid)

  const contract = await EscrowContract.fetch(client, cid)
  
  account.on('update', async (acct) => {
    console.log('locking deposit...')
    await acct.commit(contract.data, signer)

    console.log('polling contract...')
    await contract.poll('settled', 10, 30)
  })

  contract.on('update', async (ct) => {
    if (ct.status === 'active') {
      console.log('sending statement to the vm...')
      await ct.vm.sign(signer, wit_tmpl)
    }
  })

  contract.on('update', (ct) => {
    if (ct.status === 'settled') {
      console.log('contract settled!')
      process.exit()
    }
  })

  console.log('fetching account...')
  await account.request(signer, 14400)
})

await session.connect('wss://relay.damus.io', secret_id)
