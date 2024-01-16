import { Test }               from 'tape'
import { Buff }               from '@cmdcode/buff'
import { CoreClient }         from '@cmdcode/core-cmd'
import { Signer }             from '@cmdcode/signer'
import { StateData }          from '@scrow/core'
import { get_return_ctx }     from '@scrow/core/return'
import { create_session }     from '@scrow/core/session'
import { now }                from '@scrow/core/util'
import { prevout_to_txspend } from '@scrow/core/tx'
import { get_members }        from '../core.js'
import { get_funds }          from '../fund.js'
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
  verify_deposit,
  validate_proposal,
  verify_proposal,
  validate_covenant,
  verify_covenant,
  validate_registration,
  verify_witness,
  validate_witness
} from '@scrow/core/validate'

import * as assert from '@scrow/core/assert'

import { get_proposal } from '../vectors/basic_escrow.js'

const VERBOSE = process.env.VERBOSE === 'true'

export default async function (client : CoreClient, t : Test) {

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

    const cid      = Buff.random().hex
    const session  = create_session(agent.signer, cid)
    const contract = create_contract({ cid, proposal, agent : session })

    if (VERBOSE) {
      console.log(banner('contract'))
      console.dir(contract, { depth : null })
    }

    /* ------------------- [ Funding ] ------------------- */

    const templates = await get_funds(contract, members)

    const promises  = templates.map(async tmpl => {
      validate_registration(tmpl)
      validate_covenant(tmpl.covenant)
      const return_ctx = get_return_ctx(tmpl.return_tx)
      const { pubkey, sequence } = return_ctx
      const { txid, vout }       = return_ctx.tx.vin[0]
      const deposit_key = agent.signer.pubkey
      const deposit_ctx = get_deposit_ctx(deposit_key, pubkey, sequence)
      const data = await client.get_txinput(txid, vout)
      assert.exists(data)
      const spendout = prevout_to_txspend(data.txinput)
      verify_deposit(deposit_ctx, return_ctx, spendout)
      const dpid     = Buff.random(32).hex
      const state    = get_spend_state(sequence, data.status)
      const session  = create_session(agent.signer, dpid)
      const agent_pn = session.agent_pn
      const deposit  = create_deposit({ ...deposit_ctx, dpid, agent_pn, ...tmpl, ...spendout, ...state })
      // const deposit = register_deposit(deposit_ctx, dep_id, pnonce, tmpl, spendout, state)
      verify_covenant(deposit_ctx, contract, deposit, agent.signer, agent.signer)
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
      method : 'sign',
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

    let state : StateData
 
    const vm_result = eval_witness(vm_state, witness, now())

    if (vm_result.error !== undefined) {
      throw new Error(vm_result.error)
    } else {
      state = vm_result.state
    }

    state = eval_schedule(state, now() + 8000)

    if (VERBOSE) {
      console.log(banner('new state'))
      console.dir(state, { depth : null })
    }

    /* ------------------- [ Settlement ] ------------------- */

    let txid : string | undefined

    const { result } = state

    if (result !== null) {
      const txdata = create_settlment(agent.signer as Signer, contract, funds, result)

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
}
