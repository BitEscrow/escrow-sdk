/* Global Imports */

import { Test }         from 'tape'
import { CoreClient }   from '@cmdcode/core-cmd'

/* Package Imports */

import {
  create_account,
  create_account_req,
} from '@scrow/sdk/core/account'

import { now } from '@scrow/sdk/util'

import {
  close_deposit,
  create_deposit,
  create_register_req
} from '@scrow/sdk/core/deposit'

import {
  verify_account_req,
  verify_account,
  verify_deposit,
  verify_register_req
} from '@scrow/sdk/core/validate'

/* Local Imports */

import {
  fund_address,
  get_members,
  get_utxo
} from '../core.js'

import { get_return_tx } from '@/core/lib/return.js'
import { P2TR } from '@scrow/tapscript/address'

const VERBOSE = process.env.VERBOSE === 'true'

const AMOUNT   = 100_000
const FEERATE  = 2
const LOCKTIME = 60 * 60 * 2
const NETWORK  = 'regtest'

export default async function (
  client  : CoreClient,
  tape    : Test
) {
  tape.test('E2E Return Test', async t => {
    try {

      /* ------------------- [ Init ] ------------------- */

      const banner    = (title : string) => `\n\n=== [ ${title} ] ===`.padEnd(80, '=') + '\n\n'
      const aliases   = [ 'agent', 'alice' ]
      const users     = await get_members(client, aliases)

      const [ server, funder ] = users

      const funder_sd = funder.signer
      const server_sd = server.signer
      const server_pk = server_sd.pubkey

      /* ------------------- [ Create Account ] ------------------ */

      const return_addr = P2TR.create(funder_sd.pubkey, NETWORK)
      // Client: Create account request.
      const acct_req = create_account_req(funder_sd.pubkey, LOCKTIME, NETWORK, return_addr)
      // Server: Verify account request.
      verify_account_req(acct_req)
      // Server: Create account data.
      const account = create_account(acct_req, server_sd)
      // Client: Verify account data.
      verify_account(account, server_pk, funder_sd)

      if (VERBOSE) {
        console.log(banner('account'))
        console.dir(account, { depth : null })
      } else {
        t.pass('account ok')
      }

      /* ------------------- [ Create Deposit ] ------------------- */

      // Fund deposit address and get txid.
      const dep_txid = await fund_address(client, 'faucet', account.deposit_addr, AMOUNT, false)
      // Fetch the utxo for the funded address.
      const utxo     = await get_utxo(client, account.deposit_addr, dep_txid)
      // Client: Create the commit request.
      const reg_req  = create_register_req(FEERATE, account, funder_sd, utxo)
      // Server: Verify the registration request.
      verify_register_req(reg_req, server_sd)
      // Server: Create the deposit data.
      const deposit  = create_deposit({}, reg_req)
      // Client: Verify the deposit data.
      verify_deposit(deposit, server_pk)

      await client.mine_blocks(1)

      if (VERBOSE) {
        console.log(banner('deposit'))
        console.dir(deposit, { depth : null })
      } else {
        t.pass('deposit ok')
      }

      /* ------------------ [ Return Deposit ] ------------------ */

      const txdata    = get_return_tx(deposit, server_sd)
      const txid      = await client.publish_tx(txdata, true)
      const dp_closed = close_deposit(deposit, now(), txid)

      if (VERBOSE) {
        console.log(banner('deposit closed'))
        console.dir(dp_closed, { depth : null })
      } else {
        t.pass('return ok')
      }

      t.pass('completed with txid: ' + txid)
    } catch (err) {
      const { message } = err as Error
      console.log(err)
      t.fail(message)
    }
  })
}
