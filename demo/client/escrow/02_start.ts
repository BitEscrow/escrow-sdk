import { EscrowContract }              from '@scrow/core'
import { client }                      from '@scrow/demo/01_create_client.js'
import { new_draft, session }          from './01_draft.js'
import { secret_id, signer, wit_tmpl } from './00_config.js'

session.on('publish', async (cid : string) => {
  console.log('draft published as cid:', cid)

  const contract = await EscrowContract.fetch(client, cid)

  contract.on('update', async (contract) => {
    if (contract.status === 'active') {
      const vm = contract.vm
      if (vm.status === 'disputed') {
        console.log('sending statement to the vm...')
        await vm.sign(signer, wit_tmpl)
      }
    }
  })

  contract.on('update', (ct) => {
    if (ct.status === 'settled') {
      console.log('contract settled!')
      process.exit()
    }
  })

  console.log('polling contract...')
  await contract.poll('settled', 10, 30)
})

await session.init('wss://relay.damus.io', secret_id, new_draft)
