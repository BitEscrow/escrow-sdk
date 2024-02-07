import { EscrowContract } from '@scrow/core'

import { client } from '@scrow/demo/01_create_client.js'

const cid = 'b1587959853f7071bf4d69b940c85bdfa30d99ccccf19c1304fb44610961fb94'

const contract = new EscrowContract(cid, client)

contract.on('ready', () => {
  console.log('contract is ready')
})


console.dir(await contract.data, { depth : null })
