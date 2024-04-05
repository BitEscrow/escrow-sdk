import { now }                  from '@scrow/sdk/util'
import { print_banner, VMUtil } from '@scrow/test'

import vector from './vector2.json' assert { type: 'json' }

const active_at = now()
const vmid      = '00'.repeat(32)

// Unpack the mock vector.
const { duration, members, pathnames, programs, schedule, statements } = vector
// Set the closing date.
const closes_at = active_at + duration
// Find and replace aliases with their relevant pubkeys.
const progs     = VMUtil.resolve_aliases(members, programs)
// Configure the init state of the vm.
const config    = VMUtil.get_config({ active_at, closes_at, pathnames, programs : progs, schedule, vmid })
// Compile witness statements.
const witness   = VMUtil.compile_witness(progs, statements, vmid)
// Run VM with witness and final timestamp.
const vm_state  = VMUtil.run_vm(config, witness, duration)

print_banner('vm state')
console.dir(vm_state, { depth: null })
console.log('\n')
