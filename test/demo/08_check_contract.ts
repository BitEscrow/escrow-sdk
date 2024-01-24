import { print_banner } from '@scrow/test'
import { client }       from './01_create_client.js'
import { cid }          from './07_deposit_funds.js'

const ival    = 10, 
      retries = 6,
      sleep   = (ms : number) => new Promise(res => setTimeout(res, ms))

let curr = 1,
    res  = await client.contract.read(cid)

console.log('\n')

while (res.ok && res.data.contract.activated === null && curr < retries) {
  console.log(`[${curr}/${retries}] re-checking contract in ${ival} seconds...`)
  await sleep(ival * 1000)
  res = await client.contract.read(cid)
}

if (!res.ok) throw new Error(res.error)

if (res.data.contract.activated === null) {
  throw new Error('contract is not active')
}

export const active_contract = res.data.contract

print_banner('active contract')
console.dir(active_contract, { depth : null })