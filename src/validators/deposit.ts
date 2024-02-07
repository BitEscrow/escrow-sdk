import { parse_script }   from '@scrow/tapscript/script'
import { parse_sequence } from '@scrow/tapscript/tx'

import {
  DepositContext,
  DepositData,
  TxOutput
} from '../types/index.js'

import * as assert from '../assert.js'
import * as schema from '../schema/index.js'

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
