import { print_banner } from '@scrow/test'

import { faucet, poll, sleep } from './00_demo_config.js'

import { client }       from './01_create_client.js'
import { signers }      from './02_create_signer.js'
import { contract }     from './05_create_contract.js'
import { account }      from './06_request_account.js'

const { address, agent_id } = account

const vin_fee   = contract.feerate * 65
const amt_total = contract.total + vin_fee
const btc_total = amt_total / 100_000_000

print_banner('make a deposit')

console.log('copy this address :', address)
console.log('send this amount  :', `${amt_total} sats || ${btc_total} btc`)
console.log('get funds here    :', faucet, '\n')

const [ ival, retries ] = poll

let curr  = 1,
    utxos = await client.oracle.get_address_utxos(address)

while (utxos.length === 0 && curr < retries) {
  console.log(`[${curr}/${retries}] checking address in ${ival} seconds...`)
  await sleep(ival * 1000)
  utxos = await client.oracle.get_address_utxos(address)
  curr += 1
}

if (utxos.length === 0) throw new Error('utxo not found')

console.log('\nutxo:', utxos[0])

// Request the member to sign
const signer    = signers[0]
const utxo      = utxos[0].txspend
const return_tx = await signer.deposit.register_utxo(account, utxo)
const covenant  = await signer.deposit.commit_utxo(account, contract, utxo)

// Fund the contract 
const res = await client.deposit.fund(agent_id, return_tx, covenant)

// Check the response is valid.
if (!res.ok) throw new Error('failed')

const { contract: funded_contract, deposit } = res.data

print_banner('locked deposit')
console.dir(deposit, { depth : null })

print_banner('funded contract')
console.dir(funded_contract, { depth : null })

export const cid = funded_contract.cid
