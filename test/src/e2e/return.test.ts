/* Global Imports */

import { Test }       from 'tape'
import { CoreClient } from '@cmdcode/core-cmd'
import { P2TR }       from '@scrow/tapscript/address'

/* Package Imports */

import { get_return_tx } from '@scrow/sdk/return'

import {
  create_account,
  create_account_req,
  create_register_req
} from '@scrow/sdk/account'

import {
  spend_deposit,
  create_deposit,
  confirm_deposit
} from '@scrow/sdk/deposit'

import {
  verify_account_req,
  verify_account_data,
  verify_deposit_data,
  verify_register_req,
  verify_deposit_sigs
} from '@/core/validation/index.js'

/* Local Imports */

import {
  fund_address,
  get_members,
  get_spend_state,
  get_utxo
} from '../core.js'

import ServerPolicy from '../config/policy.json' assert { type: 'json' }

const VERBOSE = process.env.VERBOSE === 'true'

const AMOUNT   = 100_000
const FEERATE  = 2
const LOCKTIME = 172800
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

      const funder_dev = funder.signer
      const escrow_dev = server.signer
      const server_pol = ServerPolicy

      /* ------------------- [ Create Account ] ------------------ */

      const return_addr = P2TR.create(funder_dev.pubkey, NETWORK)
      // Client: Create account request.
      const acct_req = create_account_req(funder_dev.pubkey, LOCKTIME, NETWORK, return_addr)
      // Server: Verify account request.
      verify_account_req(server_pol.account, acct_req)
      // Server: Create account data.
      const account = create_account(acct_req, escrow_dev)
      // Client: Verify account data.
      verify_account_data(account, funder_dev)

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
      const reg_req  = create_register_req(FEERATE, account, funder_dev, utxo)
      // Server: Verify the registration request.
      verify_register_req(server_pol.account, reg_req, escrow_dev)
      // Server: Create the deposit data.
      let deposit = create_deposit(reg_req, escrow_dev)
      // Client: Verify the deposit data.
      verify_deposit_data(deposit, funder_dev)

      await client.mine_blocks(1)

      const utxo_state = await get_spend_state(client, deposit.locktime, deposit.utxo)
      deposit = confirm_deposit(deposit, utxo_state)

      if (VERBOSE) {
        console.log(banner('deposit'))
        console.dir(deposit, { depth : null })
      } else {
        t.pass('deposit ok')
      }

      /* ------------------ [ Return Deposit ] ------------------ */

      const txhex     = get_return_tx(deposit, escrow_dev)
      const txid      = await client.publish_tx(txhex, true)
      const dp_closed = spend_deposit(deposit, txhex, escrow_dev)

      if (VERBOSE) {
        console.log(banner('deposit closed'))
        console.dir(dp_closed, { depth : null })
      } else {
        t.pass('return ok')
      }

      verify_deposit_sigs(dp_closed, escrow_dev.pubkey)

      t.pass('deposit sigs ok')

      t.equal(txid, dp_closed.spent_txid, 'completed with txid: ' + txid)
    } catch (err) {
      const { message } = err as Error
      console.log(err)
      t.fail(message)
    }
  })
}
