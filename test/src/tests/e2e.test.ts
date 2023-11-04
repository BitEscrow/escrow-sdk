import { Test }               from 'tape'
import { Buff }               from '@cmdcode/buff'
import { CoreClient }         from '@cmdcode/core-cmd'
import { get_return_ctx }     from '@scrow/core/return'
import { create_session }     from '@scrow/core/session'
import { now }                from '@scrow/core/util'
import { prevout_to_txspend } from '@scrow/core/tx'
import { get_users }          from '../core.js'
import { get_funds }          from '../escrow.js'
import { create_settlment }   from '../spend.js'

import {
  activate_contract,
  create_contract,
} from '@scrow/core/contract'

import {
  get_deposit_ctx,
  get_spend_state,
  register_deposit
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
  validate_witness,
  verify_witness
} from '@scrow/core/validate'

import * as assert from '@scrow/core/assert'

import { get_proposal } from '../vectors/basic_escrow.js'
import { StateData } from '@/index.js'
import { create_witness_sig } from '@/vm/witness/sign.js'

const VERBOSE = process.env.VERBOSE === 'true'

export default async function (client : CoreClient, t : Test) {

  t.plan(1)

  try {

    /* ------------------- [ Init ] ------------------- */

    const banner  = (title : string) => `\n=== [ ${title} ] ===`.padEnd(80, '=') + '\n'
    const aliases = [ 'agent', 'alice', 'bob', 'carol' ]
    const users   = await get_users(client, aliases)

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
    const contract = create_contract(cid, proposal, session)

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
      const dep_id  = Buff.random(32).hex
      const state   = get_spend_state(sequence, data.status)
      const session = create_session(agent.signer, dep_id)
      const pnonce  = session.record_pn
      const deposit = register_deposit(deposit_ctx, dep_id, pnonce, tmpl, spendout, state)
      verify_covenant(deposit_ctx, contract, deposit, agent.signer, agent.signer)
      return deposit
    })

    const funds = await Promise.all(promises)

    /* ------------------ [ Activation ] ------------------ */

    const { vm_state, terms } = activate_contract(contract)
    
    assert.exists(vm_state)

    if (VERBOSE) {
      console.log(banner('init state'))
      console.dir(vm_state, { depth : null })
    }

    /* ------------------- [ Evaluation ] ------------------- */

    const programs = terms.programs
    const signer   = members[0].signer
    const witness  = create_witness_sig('dispute', 'payout', programs, signer)

    validate_witness(witness)
    verify_witness(vm_state.programs, witness)

    if (VERBOSE) {
      console.log(banner('witness'))
      console.dir(witness, { depth : null })
    }

    let state : StateData
 
    state = eval_witness(vm_state, witness, now())
    state = eval_schedule(state, now() + 8000)

    if (VERBOSE) {
      console.log(banner('new state'))
      console.dir(state, { depth : null })
    }

    /* ------------------- [ Settlement ] ------------------- */

    let txid : string | undefined

    const { result } = state

    if (result !== null) {
      const txdata = create_settlment(agent.signer, contract, funds, result)

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
