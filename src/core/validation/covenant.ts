/* Global Imports */

import { verify_psig } from '@cmdcode/musig2'

/* Module Imports */

import { get_account_agent }      from '../module/account/util.js'
import { parse_session_token }    from '../lib/session.js'
import { assert, parse_covenant } from '../util/index.js'

import {
  get_covenant_id,
  get_covenant_psig,
  get_covenant_sessions
} from '../lib/covenant.js'

import {
  ContractData,
  CovenantData,
  CovenantSession,
  RegisterTemplate,
  SessionEntry,
  SignerAPI
} from '../types/index.js'

export function validate_covenant (
  covenant : unknown
) : asserts covenant is CovenantData {
  parse_covenant(covenant)
}

export function verify_covenant (
  contract  : ContractData,
  covenant  : CovenantData,
  request   : RegisterTemplate,
  server_sd : SignerAPI
) {
  // Unpack contract object.
  const { activated, cid, outputs, status } = contract
  // Get the account session agent.
  const agent   = get_account_agent(request, server_sd)
  // Parse the session token from the request.
  const session = parse_session_token(request.server_tkn)
  // Make the following assertions.
  assert.ok(!activated,                    'contract is already active')
  assert.ok(status === 'published',        'contract is not in a fundable state')
  assert.ok(session.pk === agent.pubkey,   'session pubkey does not match account agent')
  assert.ok(covenant.cid === contract.cid, 'Covenant cid does not match the contract!')
  // Compute covenant id.
  const cvid = get_covenant_id(cid, request, outputs)
  // Assert the covenant id is correct.
  assert.ok(covenant.cvid === cvid, 'Covenant cvid does not match the server!')
  // Compute the musig context for each spending path.
  const sessions = get_covenant_sessions(cvid, outputs, covenant.pnonce, request)
  // Verify each covenant psig using the generated sessions.
  verify_covenant_psigs(covenant, sessions)
}

/**
 * Verify a list of partial signatures,
 * using the provided musig context object.
 */
export function verify_covenant_psigs (
  covenant : CovenantData,
  sessions : SessionEntry[]
) {
  for (const [ label, session ] of sessions) {
    const psig = get_covenant_psig(label, covenant)
    if (!verify_covenant_psig(session, psig)) {
      throw new Error('invalid psig for path: ' + label)
    }
  }
}

/**
 * Verify a partial signatures, using
 * the provided musig context object.
 */
export function verify_covenant_psig (
  session : CovenantSession,
  psig    : string
) {
  return verify_psig(session.musig, psig)
}
