import { now }                  from '@scrow/sdk/util'
import { print_banner, VMUtil } from '@scrow/test'

import vector from './fundraiser.json' assert { type: 'json' }

const active_at = now()
const engine    = 'cvm'
const vmid      = '00'.repeat(32)

// Unpack the mock vector.
const { duration, members, pathnames, programs, schedule, statements } = vector
// Set the closing date.
const expires_at = active_at + duration
// Find and replace aliases with their relevant pubkeys.
const progs      = VMUtil.resolve_aliases(members, programs)
// Configure the init state of the vm.
const config     = VMUtil.get_config({ active_at, expires_at, engine, pathnames, programs : progs, schedule, vmid })
// Run VM with witness and final timestamp.
const vm_state   = VMUtil.run_vm_vectors(config, duration, statements)

print_banner('vm state')
console.dir(vm_state, { depth: null })
console.log('\n')
