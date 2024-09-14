import { Buff }        from '@cmdcode/buff'
import { get_program } from '@/core/lib/program.js'
import { sort_record } from '@/util/index.js'

import {
  ProgramEntry,
  SignerAPI,
  WitnessData
} from '@/core/types/index.js'

/**
 * Checks if a given signing device
 * can endorse a witness statement.
 */
export function can_endorse (
  programs : ProgramEntry[],
  signer   : SignerAPI,
  witness  : WitnessData
) {
  const { action, method, path } = witness
  const pubkey = signer.pubkey
  const query  = { method, action, path, includes: [ pubkey ] }
  const pdata  = get_program(query, programs)
  return pdata !== undefined
}

/**
 * Appends an additional signature
 * to an existing witness statement.
 */
export function endorse_witness (
  signer  : SignerAPI,
  witness : WitnessData
) : WitnessData {
  const { sigs = [], wid } = witness
  const pub = signer.pubkey
  const sig = signer.sign(wid)
  const hex = Buff.join([ pub, sig ]).hex
  sigs.push(hex)
  return sort_record({ ...witness, sigs })
}
