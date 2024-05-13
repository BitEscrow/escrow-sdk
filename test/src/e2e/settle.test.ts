/* Global Imports */

import { Test }       from 'tape'
import { CoreClient } from '@cmdcode/core-cmd'
import { P2TR }       from '@scrow/tapscript/address'

/* Package Imports */

import { endorse_proposal } from '@scrow/sdk/proposal'
import { assert }           from '@scrow/sdk/util'
import { get_vm_config }    from '@scrow/sdk/vm'
import CVM                  from '@scrow/sdk/cvm'

import {
  CoreAssert,
  DepositData,
  PaymentEntry,
  TxOutput
} from '@scrow/sdk/core'

import {
  create_account,
  create_account_req,
  create_commit_req
} from '@scrow/sdk/account'

import {
  create_publish_req,
  create_contract,
  add_contract_funds,
  activate_contract,
  spend_contract,
  close_contract,
  get_settlement_tx,
  settle_contract,
  secure_contract,
  get_contract_value
} from '@scrow/sdk/contract'

import {
  confirm_deposit,
  create_deposit
} from '@scrow/sdk/deposit'

import {
  verify_account_data,
  verify_account_req,
  verify_proposal_data,
  verify_commit_req,
  verify_deposit_data,
  verify_witness_receipt,
  verify_contract_settlement,
  verify_witness_data,
  verify_contract_sigs,
  verify_deposit_sigs
} from '@/core/validation/index.js'

import {
  create_receipt,
  create_witness,
  endorse_witness
} from '@scrow/sdk/witness'

/* Local Imports */

import {
  fund_address,
  get_members,
  get_spend_state,
  get_utxo
} from '../core.js'

import { get_proposal } from './util.js'

import ServerPolicy from '../config/policy.json' assert { type: 'json' }

const VERBOSE = process.env.VERBOSE === 'true'

const FEERATE  = 1
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

      const funders   = [ members[0], members[1] ]

      const fees      = [[ 1000, fee_addr ]] as PaymentEntry[]
      const ct_config = { fees, feerate: FEERATE }

      const escrow_dev = server.signer
      const server_pol = ServerPolicy

      /* ------------------- [ Create Proposal ] ------------------- */

      // Construct a proposal from the template.
      const proposal = await get_proposal(members)
      // Verify the proposal
      verify_proposal_data(CVM, server_pol, proposal)
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
      const pub_req  = create_publish_req(proposal, signatures)
      // Server: Verify contract request.
      CoreAssert.contract.verify.request(CVM, server_pol, pub_req)
      // Server: Create contract data.
      let contract = create_contract(ct_config, pub_req, escrow_dev)
      
      if (VERBOSE) {
        console.log(banner('published contract'))
        console.dir({ ...contract }, { depth : null })
      } else {
        t.pass('contract ok')
      }

      let deposits : DepositData[] = [],
          utxos    : TxOutput[]    = []

      for (const funder of funders) {

        /* ------------------- [ Create Accounts ] ------------------ */

        //
        const return_addr = P2TR.create(funder.signer.pubkey, NETWORK)
        // Client: Create account request.
        const acct_req = create_account_req(funder.signer.pubkey, LOCKTIME, NETWORK, return_addr)
        // Server: Verify account request.
        verify_account_req(server_pol, acct_req)
        // Server: Create account data.
        const account = create_account(acct_req, escrow_dev)
        // Client: Verify account data.
        verify_account_data(account, funder.signer)
        // Return account and signer as tuple.


        if (VERBOSE) {
          console.log(banner('account'))
          console.dir(account, { depth : null })
        } else {
          t.pass('account ok')
        }

        /* ------------------- [ Create Deposits ] ------------------- */

        // Calculate the funding amount required for the contract.
        const fund_amt = (Math.ceil(get_contract_value(contract) / 2)) + contract.fund_txfee
        // Fund deposit address and get txid.
        const dep_txid = await fund_address(client, 'faucet', account.deposit_addr, fund_amt, false)
        // Fetch the utxo for the funded address.
        const utxo = await get_utxo(client, account.deposit_addr, dep_txid)
        // Add utxo to array.
        utxos.push(utxo)
        // Client: Create the commit request.
        const commit_req = create_commit_req(FEERATE, contract, account, funder.signer, utxo)
        // Server: Verify the registration request.
        verify_commit_req(contract, server_pol, commit_req, escrow_dev)
        // Server: Create the deposit data.
        const deposit = create_deposit(commit_req, escrow_dev)
        // Client: Verify the deposit data.
        verify_deposit_data(deposit, funder.signer)
        // Deposit funds into contract.
        contract = add_contract_funds(contract, deposit)
        // Add deposit to array.
        deposits.push(deposit)

        // if (VERBOSE) {
        //   console.log(banner(`${funder.alias} deposit`))
        //   console.dir(deposit, { depth : null })
        // }
      }

      if (VERBOSE) {
        console.log(banner('funded contract'))
        console.dir({ ...contract }, { depth : null })
      } else {
        t.pass('deposit ok')
      }

      await client.mine_blocks(1)

      /* ------------------- [ Secure Contract ] ------------------- */

      const pending = deposits.map(async deposit => {
        const utxo_state = await get_spend_state(client, deposit.locktime, deposit.utxo)
        return confirm_deposit(deposit, utxo_state, escrow_dev)
      })

      deposits = await Promise.all(pending)
      contract = secure_contract(contract, deposits, escrow_dev)

      if (VERBOSE) {
        console.log(banner('secured contract'))
        console.dir({ ...contract }, { depth : null })
      } else {
        t.pass('secured ok')
      }

      /* ------------------ [ Activate Contract ] ------------------ */

      contract = activate_contract(contract, escrow_dev)

      const vm_config = get_vm_config(contract)
      let   vm_data   = CVM.init(vm_config)

      if (VERBOSE) {
        console.log(banner('active contract'))
        console.dir({ ...contract }, { depth : null })
        console.log(banner('vm data'))
        console.dir(vm_data, { depth : null })
      } else {
        t.pass('activation ok')
      }

      /* ------------------- [ Submit Statements ] ------------------- */

      const signers = [
        members[0].signer.pubkey,
        members[1].signer.pubkey
      ]

      const wit_template = {
        action : 'close',
        method : 'endorse',
        path   : 'payout',
      }

      let witness = create_witness(vm_data, signers, wit_template)
          witness = endorse_witness(members[0].signer, witness)
          witness = endorse_witness(members[1].signer, witness)

      verify_witness_data(vm_data, witness)

      if (VERBOSE) {
        console.log(banner('witness'))
        console.dir(witness, { depth : null })
      } else {
        t.pass('witness ok')
      }

      /* ------------------- [ Witness Evaluation ] ------------------- */

      vm_data = CVM.eval(vm_data, witness)

      if (vm_data.error !== null) {
        throw new Error(vm_data.error)
      }

      // Create a signed receipt for the latest commit.
      const vm_receipt = create_receipt(vm_data, escrow_dev, witness)
      // Verify the latest commit matches the receipt.
      verify_witness_receipt(vm_receipt, vm_data, witness)

      if (VERBOSE) {
        console.log(banner('vm receipt'))
        console.dir(vm_receipt, { depth : null })
      } else {
        t.pass('evaluation ok')
      }

      /* ------------------- [ Close Contract ] ------------------- */

      vm_data = CVM.run(vm_data, vm_data.expires_at)

      assert.exists(vm_data.output, 'vm_state output is null')

      contract = close_contract(contract, vm_data, escrow_dev)

      if (VERBOSE) {
        console.log(banner('closed contract'))
        console.dir(contract, { depth : null })
      } else {
        t.pass('execution ok')
      }

      /* ------------------- [ Settle Contract ] ------------------- */

      const txhex = get_settlement_tx(contract, deposits, escrow_dev)
      const txid  = await client.publish_tx(txhex, true)

      contract = spend_contract(contract, txhex, txid, escrow_dev)

      verify_contract_settlement(contract, deposits, proposal, vm_data)

      contract = settle_contract(contract, escrow_dev)

      if (VERBOSE) {
        console.log(banner('settled contract'))
        console.dir(contract, { depth : null })
        console.log(banner('closing tx'))
        console.dir(txhex, { depth : null })
      } else {
        t.pass('settlement ok')
      }

      verify_contract_sigs(contract, escrow_dev.pubkey)

      t.pass('contract signatures ok')

      deposits.forEach(dep => verify_deposit_sigs(dep, escrow_dev.pubkey))

      t.pass('deposit signatures ok')

      t.pass('completed with txid: ' + txid)
    } catch (err) {
      const { message } = err as Error
      console.log(err)
      t.fail(message)
    }
  })
}
