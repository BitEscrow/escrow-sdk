import { parse_script }   from '@scrow/tapscript/script'
import { parse_sequence } from '@scrow/tapscript/tx'

import {
  AccountRequest,
  DepositContext,
  DepositData,
  RegisterRequest,
  CloseRequest,
  TxOutput,
  CommitRequest,
  LockRequest
} from '../types/index.js'

import * as assert from '../assert.js'
import * as schema from '../schema/index.js'

export function validate_account_req (
  template : unknown
) : asserts template is AccountRequest {
  schema.deposit.acct_req.parse(template)
}

export function validate_register_req (
  template : unknown
) : asserts template is RegisterRequest {
  schema.deposit.reg_req.parse(template)
}

export function validate_commit_req (
  template : unknown
) : asserts template is CommitRequest {
  schema.deposit.commit_req.parse(template)
}

export function validate_lock_req (
  template : unknown
) : asserts template is LockRequest {
  schema.deposit.lock_req.parse(template)
}

export function validate_close_req (
  template : unknown
) : asserts template is CloseRequest {
  schema.deposit.close_req.parse(template)
}

export function validate_deposit (
  deposit : Record<string, any>
) : asserts deposit is DepositData {
  schema.deposit.data.parse(deposit)
}

export function verify_deposit (
  deposit_ctx : DepositContext,
  utxo        : TxOutput
) {
  // Unpack our transaction template.
  const { sequence, tap_data } = deposit_ctx
  const { scriptkey } = utxo
  const sdata  = parse_sequence(sequence)
  const tapkey = parse_script(scriptkey).asm[1]
  assert.ok(sdata.enabled,                'sequence field timelock is not enabled.')
  assert.ok(sdata.type === 'stamp',       'sequence field is not configured for timelock.')
  assert.ok(tapkey === tap_data.tapkey,   'utxo scriptkey does not match tapkey')
}
