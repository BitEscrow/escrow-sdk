import {
  fund_address,
  get_daemon,
  get_utxo
} from "@scrow/test"

import { client, members } from "../proposal/configure_clients.js"

// Startup a local process of Bitcoin Core for testing.
const core = get_daemon({ network : 'regtest' })
const cli  = await core.startup()

// Unpack a member for testing.
const [ a_mbr ] = members

// Request an account for the member to use.
const account_res = await client.deposit.request({
  pubkey   : a_mbr.pubkey,
  locktime : 60 * 60 // 1 hour locktime
})

// Check the response is valid.
if (!account_res.ok) throw new Error('failed')

// Unpack some of the terms.
const { account } = account_res.data

console.log('account:', account)

const address  = account.address
const agent_id = account.agent_id

// Use our utility methods to fund the address and get the utxo.
const txid = await fund_address(cli, 'alice', address, 20_000)
const utxo = await get_utxo(cli, address, txid)

// Request the member to sign
const return_tx = await a_mbr.deposit.register_utxo(account, utxo)

// Register the deposit with the API.
const deposit_res = await client.deposit.register(agent_id, return_tx)

// Check the response is valid.
if (!deposit_res.ok) throw new Error('failed')

const { deposit } = deposit_res.data

console.log('deposit:', deposit)
