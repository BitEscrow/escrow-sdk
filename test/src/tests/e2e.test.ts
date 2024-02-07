import { Test }               from 'tape'
import { CoreClient }         from '@cmdcode/core-cmd'
import { parse_extkey }       from '@cmdcode/crypto-tools/hd'
import { Signer }             from '@cmdcode/signer'
import { create_session }     from '@scrow/core/session'
import { now }                from '@scrow/core/util'
import { get_proposal_id }    from '@/lib/proposal.js'
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
  get_contract_id,
  get_spend_templates,
} from '@scrow/core/contract'

import {
  create_deposit,
  get_deposit_ctx,
  get_deposit_id,
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

      const agent_fee = [ 1000, agent.wallet.new_address() ] as PaymentEntry
      const feerate   = proposal.feerate ?? 5
      const outputs   = get_spend_templates(proposal, [ agent_fee ])
      const published = now()
      const prop_id   = get_proposal_id(proposal)
      const cid       = get_contract_id(prop_id, published, outputs)
      const session   = create_session(agent.signer, cid)
      const ct_config = { agent_fee, cid, feerate, outputs, published, session }
      const contract  = create_contract(ct_config, [], proposal)

      if (VERBOSE) {
        console.log(banner('contract'))
        console.dir(contract, { depth : null })
      }

      /* ------------------- [ Funding ] ------------------- */

      const registrations = await register_funds(contract, members)

      const promises = registrations.map(async req => {
        const { deposit_pk, sequence, spend_xpub, utxo } = req
        const { txid, vout } = utxo
        validate_register_req(req)
        const agent_pk  = agent.signer.pubkey
        const return_pk = parse_extkey(spend_xpub).pubkey
        const dep_ctx   = get_deposit_ctx(agent_pk, deposit_pk, return_pk, sequence)
        const tx_data   = await client.get_txinput(txid, vout)
        assert.ok(tx_data !== null, 'there is no tx data')
        verify_deposit(dep_ctx, utxo)
        const created   = now()
        const dpid      = get_deposit_id(created, req)
        const state     = get_spend_state(sequence, tx_data.status)
        const session   = create_session(agent.signer, dpid)
        const deposit   = create_deposit(created, req, session, state)
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
