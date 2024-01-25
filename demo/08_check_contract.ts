import { print_banner } from '@scrow/test'
import { poll, sleep }  from './00_demo_config.js'
import { client }       from './01_create_client.js'
import { cid }          from './07_deposit_funds.js'

const [ ival, retries ] = poll

let curr = 1,
    res  = await client.contract.read(cid)

print_banner('awaiting on-chain confirmation of funds')

console.log('depending on the network, this could take a while!\n')

while (res.ok && res.data.contract.activated === null && curr < retries) {
  console.log(`[${curr}/${retries}] re-checking contract in ${ival} seconds...`)
  await sleep(ival * 1000)
  res = await client.contract.read(cid)
  curr += 1
}

if (!res.ok) throw new Error(res.error)

if (res.data.contract.activated === null) {
  throw new Error('contract is not active')
}

export const active_contract = res.data.contract

print_banner('active contract')
console.dir(active_contract, { depth : null })
