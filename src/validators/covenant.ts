import { verify_psig }    from '@cmdcode/musig2'
import { parse_txout }    from '@/lib/tx.js'
import { parse_covenant } from '@/lib/parse.js'
import { get_entry }      from '../lib/util.js'

import {
  get_path_mutexes,
  get_return_mutex,
  get_session_pnonce,
  verify_mutex_psig
} from '../lib/session.js'

import {
  ContractData,
  CovenantData,
  DepositContext,
  DepositData,
  DepositReturn,
  MutexEntry,
  SignerAPI
} from '../types/index.js'

import * as assert from '../assert.js'

export function validate_covenant (
  covenant : unknown
) : asserts covenant is CovenantData {
  parse_covenant(covenant)
}

export function verify_covenant (
  context  : DepositContext,
  contract : ContractData,
  deposit  : DepositData,
  dp_agent : SignerAPI,
  ct_agent : SignerAPI,
) {
  // Unpack data objects.
  const { agent_pn } = contract
  const { covenant } = deposit
  // Check if covenant exists from the current session.
  assert.exists(covenant)
  assert.ok(covenant.cid === contract.cid, 'Covenant cid does not match the contract!')
  // Check if the signing agents are valid.
  check_deposit_agent(dp_agent, deposit)
  check_contract_agent(ct_agent, contract)
  // Get the mutex entries.
  const pnonces = [ covenant.pnonce, agent_pn ]
  const txout   = parse_txout(deposit)
  const entries = get_path_mutexes(context, contract, pnonces, txout)
  // Check that we can use the deposit psigs.
  check_deposit_psigs(entries, covenant.psigs)
}

export function verify_refund (
  dp_agent : SignerAPI,
  deposit  : DepositData,
  refund   : DepositReturn
) {
  const { dpid, agent_pn } = deposit
  const { pnonce, psig, txhex } = refund
  assert.ok(dpid === refund.dpid, 'deposit_id does not match')
  check_deposit_agent(dp_agent, deposit)
  const pnonces = [ pnonce, agent_pn ]
  const mutex   = get_return_mutex(deposit, pnonces, txhex)
  verify_mutex_psig(mutex, psig)
}


function check_deposit_agent (
  agent    : SignerAPI,
  deposit  : DepositData
) {
  const { agent_id, agent_pk } = deposit
  assert.ok(agent_id === agent.id,     'Agent ID does not match deposit.')
  assert.ok(agent_pk === agent.pubkey, 'Agent pubkey does not match deposit.')
}

function check_contract_agent (
  agent    : SignerAPI,
  contract : ContractData
) {
  const { agent_id, cid, agent_pn } = contract
  assert.ok(agent_id === agent.id,     'Agent ID does not match session.')
  const pnonce = get_session_pnonce(agent.id, cid, agent)
  assert.ok(pnonce.hex === agent_pn, 'Agent pnonce does not match session.')
}

function check_deposit_psigs (
  mutexes : MutexEntry[],
  psigs   : [ string, string ][]
) {
  psigs.forEach(([ label, psig ]) => {
    const ctx = get_entry(label, mutexes)
    assert.ok(verify_psig(ctx.mutex, psig), 'psig verification failed for path: ' + label)
  })
}
