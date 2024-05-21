import { Buff }           from '@cmdcode/buff'
import { get_program }    from '../../lib/vm.js'
import { get_witness_id } from './util.js'

import {
  now,
  sort_record
} from '../../util/index.js'

import {
  ProgramEntry,
  SignerAPI,
  MachineConfig,
  MachineData,
  WitnessData,
  WitnessTemplate
} from '../../types/index.js'

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
