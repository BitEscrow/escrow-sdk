import { Buff } from '@cmdcode/buff'

import { EscrowClient, Signer } from '@scrow/core'

export const ESCROW_URL = 'http://localhost:3000'
export const ORACLE_URL = 'http://172.21.0.3:3000'

const secret = Buff.str('alice').digest
const signer = new Signer(secret)

const client = new EscrowClient(ESCROW_URL, signer)

const ret = await client.oracle.get_spend_data (
  ORACLE_URL,
  'a0313f9fd3011fb7759e63aa6050867c0438a723157d002131cc6e65fb3ed74b',
  0
)

console.log('ret:', ret)
