import { get_commit_id } from './util.js'

import {
  now,
  sort_record
} from '../../util/index.js'

import {
  SignerAPI,
  MachineData,
  WitnessData,
  WitnessCommit
} from '../../types/index.js'

export function create_commit (
  data    : MachineData,
  signer  : SignerAPI,
  witness : WitnessData,
  commit_at = now()
) : WitnessCommit {
  const agent_pk   = signer.pubkey
  const vm_closed  = data.closed
  const vm_head    = data.head
  const vm_output  = data.output
  const vm_step    = data.step
  const preimg     = { ...witness, commit_at, agent_pk, vm_closed, vm_head, vm_output, vm_step }
  const commit_id  = get_commit_id(preimg)
  const commit_sig = signer.sign(commit_id)
  return sort_record({ ...preimg, commit_id, commit_sig })
}
