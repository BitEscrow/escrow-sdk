import { Buff }           from '@cmdcode/buff'
import { assert }         from '@/core/util/index.js'
import { get_path_names } from '@/core/lib/proposal.js'

import {
  MachineConfig,
  ContractData
} from '@/core/types/index.js'

export function get_machine_config (
  contract : ContractData
) : MachineConfig {
  assert.ok(contract.activated, 'contract is not active')
  const { active_at, expires_at, terms, machine_vmid } = contract
  const { engine, paths, programs, schedule } = terms
  const pathnames = get_path_names(paths)
  return { active_at, expires_at, engine, pathnames, programs, schedule, vmid: machine_vmid }
}

export function get_machine_id (
  active_at : number,
  cid       : string,
  closes_at : number
) {
  const hash  = Buff.hex(cid)
  const start = Buff.num(active_at, 4)
  const stop  = Buff.num(closes_at, 4)
  return Buff.join([ hash, start, stop ]).digest.hex
}
