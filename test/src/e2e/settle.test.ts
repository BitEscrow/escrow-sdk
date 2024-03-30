/* Global Imports */

import { Test }       from 'tape'
import { CoreClient } from '@cmdcode/core-cmd'
import { P2TR }       from '@scrow/tapscript/address'

/* Package Imports */

import {
  create_account,
  create_account_req,
} from '@scrow/sdk/account'

import { PaymentEntry }     from '@scrow/sdk/core'
import { DefaultPolicy }    from '@scrow/sdk/config'
import { endorse_proposal } from '@scrow/sdk/proposal'
import { now }              from '@scrow/sdk/util'
import { VirtualMachine }   from '@scrow/sdk/vm'

import {
  create_receipt,
  create_witness,
  endorse_witness
} from '@scrow/sdk/witness'

import {
  create_contract_req,
  create_contract,
  activate_contract,
  settle_contract,
  get_vm_config,
  get_settlement_tx
} from '@scrow/sdk/contract'

import {
  create_commit_req,
  create_deposit
} from '@scrow/sdk/deposit'

import {
  verify_account_req,
  verify_account,
  verify_contract_req,
  verify_deposit,
  verify_settlement,
  verify_witness,
  verify_commit_req,
  verify_execution,
  verify_proposal,
  verify_publishing
} from '@scrow/sdk/validate'

import * as assert from '@scrow/sdk/assert'

/* Local Imports */

import {
  fund_address,
  get_members,
  get_utxo
} from '../core.js'

import { get_proposal } from './util.js'

const VERBOSE = process.env.VERBOSE === 'true'

const FEERATE  = 2
const LOCKTIME = 172800
const NETWORK  = 'regtest'

export default async function (
  client  : CoreClient,
  tape    : Test
) {
  tape.test('E2E Settlement Test', async t => {
    try {

      /* ------------------- [ Init ] ------------------- */

      const banner   = (title : string) => `\n\n=== [ ${title} ] ===`.padEnd(80, '=') + '\n\n'
      const aliases  = [ 'agent', 'alice', 'bob', 'carol' ]
      const fee_addr = await client.core.faucet.get_address('faucet')
      const users    = await get_members(client, aliases)

      const [ server, ...members ] = users

      const fees      = [[ 1000, fee_addr ]] as PaymentEntry[]
      const ct_config = { fees, feerate: FEERATE }

      const funder_sd  = members[0].signer
      const server_sd  = server.signer
      const server_pol = DefaultPolicy

      /* ------------------- [ Create Proposal ] ------------------- */

      // Construct a proposal from the template.
      const proposal   = await get_proposal(members)
      // Verify the proposal
      verify_proposal(proposal, server_pol)
      // Have each member endorse the proposal.
      const signatures = members.map(e => endorse_proposal(proposal, e.signer))

      if (VERBOSE) {
        console.log(banner('proposal'))
        console.dir(proposal, { depth : null })
      } else {
        t.pass('proposal ok')
      }

      /* ------------------- [ Create Contract ] ------------------- */

      // Client: Create a contract request.
      const pub_req  = create_contract_req(proposal, signatures)
      // Server: Verify contract request.
      verify_contract_req(server_pol, pub_req)
      // Server: Create contract data.
      const contract = create_contract(ct_config, server_pol, pub_req, server_sd)
      // Client: Verify contract data.
      verify_publishing(contract, proposal)
      
      if (VERBOSE) {
        console.log(banner('contract'))
        console.dir(contract, { depth : null })
      } else {
        t.pass('contract ok')
      }

      /* ------------------- [ Create Accounts ] ------------------ */

      //
      const return_addr = P2TR.create(funder_sd.pubkey, NETWORK)
      // Client: Create account request.
      const acct_req = create_account_req(funder_sd.pubkey, LOCKTIME, NETWORK, return_addr)
      // Server: Verify account request.
      verify_account_req(server_pol, acct_req)
      // Server: Create account data.
      const account = create_account(acct_req, server_sd)
      // Client: Verify account data.
      verify_account(account, funder_sd)
      // Return account and signer as tuple.


      if (VERBOSE) {
        console.log(banner('account'))
        console.dir(account, { depth : null })
      } else {
        t.pass('account ok')
      }

      /* ------------------- [ Create Deposits ] ------------------- */

      // Fund deposit address and get txid.
      const dep_txid = await fund_address(client, 'faucet', account.deposit_addr, contract.total, false)
      // Fetch the utxo for the funded address.
      const utxo = await get_utxo(client, account.deposit_addr, dep_txid)
      // Client: Create the commit request.
      const commit_req = create_commit_req(FEERATE, contract, account, funder_sd, utxo)
      // Server: Verify the registration request.
      verify_commit_req(contract, server_pol, commit_req, server_sd)
      // Server: Create the deposit data.
      const deposit = create_deposit({}, commit_req, server_sd)
      // Client: Verify the deposit data.
      verify_deposit(deposit, funder_sd)

      await client.mine_blocks(1)

      if (VERBOSE) {
        console.log(banner('deposit'))
        console.dir(deposit, { depth : null })
      } else {
        t.pass('deposit ok')
      }

      /* ------------------ [ Activate Contract ] ------------------ */

      const ct_active = activate_contract(contract)
      const vm_config = get_vm_config(ct_active)
      const vm = new VirtualMachine(vm_config)

      if (VERBOSE) {
        console.log(banner('vm state'))
        console.dir(vm.data, { depth : null })
      } else {
        t.pass('activation ok')
      }

      /* ------------------- [ Submit Statements ] ------------------- */

      const signer = members[0].signer

      const config = {
        action : 'dispute',
        method : 'endorse',
        path   : 'payout',
      }

      let witness = create_witness(proposal.programs, signer.pubkey, config)
          witness = endorse_witness(signer, witness)

      verify_witness(ct_active, witness)

      if (VERBOSE) {
        console.log(banner('witness'))
        console.dir(witness, { depth : null })
      } else {
        t.pass('witness ok')
      }

      let state = vm.eval(witness)

      if (state.error !== null) {
        throw new Error(state.error)
      }

      // Create a signed receipt for the latest commit.
      const vm_receipt = create_receipt(state, server_sd)
      // Verify the latest commit matches the receipt.
      verify_execution(ct_active, vm_receipt, witness)

      if (VERBOSE) {
        console.log(banner('vm receipt'))
        console.dir(state, { depth : null })
      } else {
        t.pass('execution ok')
      }

      /* ------------------- [ Settle Contract ] ------------------- */

      const settled_at = now() + 8000

      state = vm.run(settled_at)

      assert.exists(state.output)

      const txdata     = get_settlement_tx(ct_active, [ deposit ], state.output, server_sd)
      const txid       = await client.publish_tx(txdata, true)
      const ct_settled = settle_contract(ct_active, settled_at, txid)

      verify_settlement(ct_settled, [ witness ], [ deposit.utxo ])

      if (VERBOSE) {
        console.log(banner('closing tx'))
        console.dir(txdata, { depth : null })
      } else {
        t.pass('settlement ok')
      }

      t.pass('completed with txid: ' + txid)
    } catch (err) {
      const { message } = err as Error
      console.log(err)
      t.fail(message)
    }
  })
}
