// get contract from API

import { EscrowClient }  from '@/index.js'
import { full_proposal } from './03-endorsment.js'

const client = new EscrowClient({
  hostname : 'http://localhost:3000',
  oracle   : 'http://172.21.0.3:3000'
})

const res = await client.contract.create(full_proposal)

console.log('response:', res)
