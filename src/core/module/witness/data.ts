import { get_program }    from '@/core/lib/program.js'

import {
  get_commit_id,
  get_witness_id
} from './util.js'

import {
  now,
  sort_record
} from '@/util/index.js'

import {
  MachineConfig,
  MachineData,
  SignerAPI,
  WitnessReceipt,
  WitnessData,
  WitnessTemplate
} from '@/core/types/index.js'

export function create_witness (
  config   : MachineConfig | MachineData,
  pubkeys  : string   | string[],
  template : WitnessTemplate
) : WitnessData {
  const { args = [], action, content = '', method, path, stamp = now() } = template

  const keys   = (Array.isArray(pubkeys)) ? pubkeys : [ pubkeys ]
  const query  = { method, action, path, includes: keys }
  const pdata  = get_program(query, config.programs)

  if (pdata === undefined) {
    throw new Error('matching program not found')
  }

  const prog_id = pdata.prog_id
  const vmid    = config.vmid
  const tmpl    = { ...template, args, content, prog_id, stamp, vmid }
  const wid     = get_witness_id(tmpl)
  return sort_record({ ...tmpl, sigs: [], wid })
}

export function create_receipt (
  data    : MachineData,
  signer  : SignerAPI,
  witness : WitnessData,
  commit_at = now()
) : WitnessReceipt {
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
