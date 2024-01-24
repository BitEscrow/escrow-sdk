import { print_banner } from '@scrow/test'
import { members }      from './02_create_signer.js'
import { client }       from './01_create_client.js'
import { contract }     from './05_create_contract.js'
import { account }      from './06_request_deposit.js'

const { address, agent_id } = account

print_banner('make a deposit')

console.log('copy this address :', address)
console.log('send this amount  :', contract.total, 'sats')
if (contract.terms.network === 'signet') {
  console.log('get funds here    : https://faucet.mutinynet.com')
} else if (contract.terms.network === 'testnet') {
  console.log('get funds here    : https://bitcoinfaucet.uo1.net')
}

const ival    = 30,
      retries = 6,
      sleep   = (ms : number) => new Promise(res => setTimeout(res, ms))

let curr  = 1,
    utxos = await client.oracle.get_address_utxos(address)

console.log('\n')

while (utxos.length === 0 && curr < retries) {
  console.log(`[${curr}/${retries}] checking address in ${ival} seconds...`)
  await sleep(ival * 1000)
  utxos = await client.oracle.get_address_utxos(address)
  console.log('utxos:', utxos)
  curr += 1
}

if (utxos.length === 0) throw new Error('utxo not found')

// Request the member to sign
const signer    = members[0]
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
