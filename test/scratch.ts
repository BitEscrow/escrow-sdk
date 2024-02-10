import { EscrowContract } from '@scrow/core'

import { client } from '@scrow/demo/01_create_client.js'
import { sleep } from './src/util.js'

const cid = 'b1587959853f7071bf4d69b940c85bdfa30d99ccccf19c1304fb44610961fb94'

const contract = new EscrowContract(cid, client, { verbose : true })

contract.on('error', (err) => {
  console.log(err)
})

contract.on('ready', async (ct) => {
  console.log('contract is ready')
  console.log(ct.cid)
})

contract.on('status', (ct) => {
  console.log('updating status')
  console.log(ct.status)
})

let tries = 10

for (let i = 0; i < tries; i++) {
  const data = await contract.data
  console.log(data.status)
  await sleep(4500)
}
