import { EscrowContract } from '@scrow/core'
import { client }         from '@scrow/demo/01_create_client.js'
import { session }        from './01_draft.js'
import { account }        from './02_fund.js'

import { secret_id, signer, wit_tmpl } from './00_config.js'

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
