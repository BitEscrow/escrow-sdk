/* Global Imports */

import { Test }       from 'tape'
import { CoreClient } from '@cmdcode/core-cmd'
import { P2TR }       from '@scrow/tapscript/address'

/* Package Imports */

import { create_deposit } from '@scrow/sdk/deposit'
import { get_txid }       from '@scrow/sdk/tx'

import {
  create_account,
  create_account_req,
  create_register_req
} from '@scrow/sdk/account'

import {
  get_recovery_config,
  get_recovery_tx,
  sign_recovery_tx
} from '@scrow/sdk/recovery'

import {
  verify_account_req,
  verify_account_data,
  verify_deposit_data,
  verify_register_req
} from '@/core/validation/index.js'

/* Local Imports */

import {
  fund_address,
  get_members,
  get_utxo
} from '../core.js'

import ServerPolicy from '../config/policy.json' assert { type: 'json' }

const VERBOSE = process.env.VERBOSE === 'true'

const AMOUNT   = 100_000
const FEERATE  = 1
const LOCKTIME = 172800
const NETWORK  = 'regtest'

export default async function (
  client  : CoreClient,
  tape    : Test
) {
  tape.test('E2E Recovery Test', async t => {
    try {

      /* ------------------- [ Init ] ------------------- */

      const banner   = (title : string) => `\n\n=== [ ${title} ] ===`.padEnd(80, '=') + '\n\n'
      const aliases  = [ 'agent', 'alice' ]
      const users    = await get_members(client, aliases)

      const [ server, funder ] = users

      const funder_dev = funder.signer
      const escrow_dev = server.signer
      const server_pol = ServerPolicy

      /* ------------------- [ Create Account ] ------------------ */

      //
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
      const deposit  = create_deposit(reg_req, escrow_dev)
      // Client: Verify the deposit data.
      verify_deposit_data(deposit, funder_dev)

      await client.mine_blocks(1)

      if (VERBOSE) {
        console.log(banner('deposit'))
        console.dir(deposit, { depth : null })
      } else {
        t.pass('deposit ok')
      }

      /* ------------------ [ Recover Deposit ] ------------------ */

      const rec_config = get_recovery_config(deposit)
      const template   = get_recovery_tx(rec_config, FEERATE, return_addr, utxo)
      const signed_tx  = sign_recovery_tx(rec_config, funder_dev, template, utxo)
      const txid       = get_txid(signed_tx)

      let is_valid = false

      try {
        await client.publish_tx(signed_tx, true)
      } catch (err) {
        const { message } = err as Error
        is_valid = message.includes('non-BIP68-final')
      }

      if (VERBOSE) {
        console.log(banner('closing tx'))
        console.dir(signed_tx, { depth : null })
      }

      t.true(is_valid, 'recovery tx rejected with non-BIP68-final: ' + txid)
    } catch (err) {
      const { message } = err as Error
      console.log(err)
      t.fail(message)
    }
  })
}
