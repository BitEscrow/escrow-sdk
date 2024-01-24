import { EscrowClient } from '@/index.js'

import CONFIG from '../config.js'

const client = new EscrowClient(CONFIG.testnet.client)
const dpid   = '5f8ebbe2ed49466c25447502a06413cb533ee5713e790d8da6f075ecc887fc38'

// Request an account for the member to use.
const dp_res = await client.deposit.read(dpid)

// Check the response is valid.
if (!dp_res.ok) throw new Error(dp_res.error)

const { deposit } = dp_res.data

console.log('deposit:', deposit)
