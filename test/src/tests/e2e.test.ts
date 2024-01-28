import { Test }               from 'tape'
import { Buff }               from '@cmdcode/buff'
import { CoreClient }         from '@cmdcode/core-cmd'
import { parse_extkey }       from '@cmdcode/crypto-tools/hd'
import { Signer }             from '@cmdcode/signer'
import { prevout_to_txspend } from '@scrow/core/tx'
import { create_session }     from '@scrow/core/session'
import { now }                from '@scrow/core/util'
import { get_members }        from '../core.js'
import { register_funds }     from '../fund.js'
import { create_settlment }   from '../spend.js'

import {
  create_witness,
  sign_witness
} from '@scrow/core/witness'

import {
  activate_contract,
  create_contract,
} from '@scrow/core/contract'

import {
  create_deposit,
  get_deposit_ctx,
  get_spend_state
} from '@scrow/core/deposit'

import {
  eval_schedule,
  eval_witness,
} from '@scrow/core/vm'

import {
  validate_proposal,
  verify_proposal,
  verify_covenant,
  validate_register_req,
  verify_witness,
  validate_witness,
  verify_deposit
} from '@scrow/core/validate'

import { PaymentEntry } from '@/types/index.js'

import * as assert from '@scrow/core/assert'

import { get_proposal } from '../vectors/basic_escrow.js'

const VERBOSE = process.env.VERBOSE === 'true'

export default async function (client : CoreClient, tape : Test) {
  tape.test('E2E test of the core protocol', async t => {
    t.plan(1)

    try {

      /* ------------------- [ Init ] ------------------- */

      const banner  = (title : string) => `\n=== [ ${title} ] ===`.padEnd(80, '=') + '\n'
      const aliases = [ 'agent', 'alice', 'bob', 'carol' ]
      const users   = await get_members(client, aliases)

      const [ agent, ...members ] = users

      /* ------------------- [ Proposal ] ------------------- */

      const proposal = await get_proposal(members)

      validate_proposal(proposal)
      verify_proposal(proposal)

      if (VERBOSE) {
        console.log(banner('proposal'))
        console.dir(proposal, { depth : null })
      }

      /* ------------------- [ Contract ] ------------------- */

      const cid       = Buff.random().hex
      const session   = create_session(agent.signer, cid)
      const agent_fee = [ 1000, agent.wallet.new_address() ] as PaymentEntry
      const feerate   = proposal.feerate ?? 5
      const contract  = create_contract({ cid, proposal, agent : session, agent_fee, feerate })

      if (VERBOSE) {
        console.log(banner('contract'))
        console.dir(contract, { depth : null })
      }

      /* ------------------- [ Funding ] ------------------- */

      const registrations = await register_funds(contract, members)

      const promises = registrations.map(async tmpl => {
        const { covenant, deposit_pk, sequence, spend_xpub, utxo } = tmpl
        const { txid, vout } = utxo
        validate_register_req(tmpl)
        const agent_pk  = agent.signer.pubkey
        const return_pk = parse_extkey(spend_xpub).pubkey
        const dep_ctx   = get_deposit_ctx(agent_pk, deposit_pk, return_pk, sequence)
        const tx_data   = await client.get_txinput(txid, vout)
        assert.ok(tx_data !== null, 'there is no tx data')
        const spendout  = prevout_to_txspend(tx_data.txinput)
        verify_deposit(dep_ctx, utxo)
        const dpid      = Buff.random(32).hex
        const state     = get_spend_state(sequence, tx_data.status)
        const session   = create_session(agent.signer, dpid)
        const full_ctx  = { ...dep_ctx, ...session, ...spendout, ...state }
        const deposit   = create_deposit({ ...full_ctx, covenant, dpid, spend_xpub })
        // const deposit  = register_deposit(dep_ctx, dpid, pnonce, tmpl, spendout, state)
        verify_covenant(dep_ctx, contract, deposit, agent.signer, agent.signer)
        return deposit
      })

      const funds = await Promise.all(promises)

      /* ------------------ [ Activation ] ------------------ */

      const active_contract = activate_contract(contract)
      const { vm_state }    = active_contract
      
      assert.exists(vm_state)

      if (VERBOSE) {
        console.log(banner('init state'))
        console.dir(vm_state, { depth : null })
      }

      /* ------------------- [ Evaluation ] ------------------- */

      const signer = members[0].signer

      const config = {
        action : 'dispute',
        method : 'endorse',
        path   : 'payout',
      }

      const wit_tmpl = create_witness(proposal.programs, signer.pubkey, config)

      validate_witness(active_contract, wit_tmpl)

      const witness = sign_witness(signer, wit_tmpl)

      verify_witness(witness)

      if (VERBOSE) {
        console.log(banner('witness'))
        console.dir(witness, { depth : null })
      }

      let state = eval_witness(vm_state, witness, now())

      if (state.error !== null) {
        throw new Error(state.error)
      }

      state = eval_schedule(state, now() + 8000)

      if (VERBOSE) {
        console.log(banner('new state'))
        console.dir(state, { depth : null })
      }

      /* ------------------- [ Settlement ] ------------------- */

      let txid : string | undefined

      if (state.output !== null) {
        const txdata = create_settlment(agent.signer as Signer, contract, funds, state.output)

        if (VERBOSE) {
          console.log(banner('closing tx'))
          console.dir(txdata, { depth : null })
        }

        txid = await client.publish_tx(txdata, true)

        if (VERBOSE) {
          console.log(banner('txid'))
          console.log(txid)
          console.log('\n' + '='.repeat(80) + '\n')
        }
      }
      t.true(typeof txid === 'string', 'E2E test passed with txid: ' + txid)
    } catch (err) {
      const { message } = err as Error
      console.log(err)
      t.fail(message)
    }
  })
}
