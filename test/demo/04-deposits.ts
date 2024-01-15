// make deposit
import {
  fund_address,
  get_daemon,
  get_utxo
} from "@scrow/test"

import { members }          from "./01-proposal.js"
import { EscrowClient }     from "@/index.js"
import { DEFAULT_LOCKTIME } from "@/config.js"

// Startup a local process of Bitcoin Core for testing.
const core   = get_daemon()
const cli    = await core.startup()

// Define a third-party client as a coordinator.
const client = new EscrowClient({
  hostname : 'http://localhost:3000',
  oracle   : 'http://172.21.0.3:3000'
})

// Unpack a member for testing.
const [ a_mbr ] = members

// Request an account for the member to use.
const account_res = await client.deposit.request({
  pubkey   : a_mbr.pubkey,
  locktime : DEFAULT_LOCKTIME
})

// Check the response is valid.
if (!account_res.ok) throw new Error('failed')

// Unpack some of the terms.
const account = account_res.data
const address = account.address

// Use our utility methods to fund the address and get the utxo.
const txid = await fund_address(cli, 'alice', address, 10_000)
const utxo = await get_utxo(cli, address, txid)

// Request the member to sign
const regdata = await a_mbr.deposit.create_registration(account, utxo)

// Register the deposit with the API.
const deposit_res = await client.deposit.register(regdata)

// Check the response is valid.
if (!deposit_res.ok) throw new Error('failed')

console.log('deposit:', deposit_res.data)
