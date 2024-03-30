import * as assert from '@/assert.js'

import { get_account_agent } from '../lib/account.js'

import {
  get_session_pnonce,
  get_session_seed,
  parse_session_token
} from '../lib/session.js'

import { RegisterRequest, SignerAPI } from '../types/index.js'

import CovenantSchema from '../schema/covenant.js'

export function validate_session_token (
  token : string
) : asserts token is string {
  CovenantSchema.token.parse(token)
}

export function verify_session_token (
  request   : RegisterRequest,
  server_sd : SignerAPI
) {
  const agent = get_account_agent(request, server_sd)
  const sess  = parse_session_token(request.server_tkn)
  const seed  = get_session_seed(sess.id, agent, sess.ts)
  const agpn  = get_session_pnonce(seed, agent).hex

  assert.ok(sess.pk === agent.pubkey, 'session pubkey does not match request')
  assert.ok(sess.pn === agpn,         'session pubnonce does not match request')
}
