import { Buff } from '@cmdcode/buff'

import {
  WitnessDataImage,
  WitnessPreImage
} from '@/core/types/index.js'

/**
 * Returns a serialized preimage
 * for signing a witness statement.
 */
export function get_witness_id (
  preimg : WitnessPreImage
) {
  const { action, args, content, method, path, prog_id, stamp, vmid } = preimg
  const argstr = JSON.stringify(args)
  return Buff.json([ action, argstr, content, method, path, prog_id, stamp, vmid ]).digest.hex
}

export function get_commit_id (
  preimage : WitnessDataImage
) {
  const { commit_at, agent_pk, vm_head, wid } = preimage
  const stamp = Buff.num(commit_at, 4)
  return Buff.join([ wid, stamp, agent_pk, vm_head ]).digest.hex
}
