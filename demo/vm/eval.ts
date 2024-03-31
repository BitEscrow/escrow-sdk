import { now } from '@scrow/sdk/util'

import {
  print_banner,
  VMUtil
} from '@scrow/test'

import vector from './vector.json' assert { type: 'json' }

const cid       = '00'.repeat(32)
const activated = now

// Unpack the mock vector.
const { duration, members, pathnames, programs, schedule, statements } = vector
// Find and replace aliases with their relevant pubkeys.
const progs    = VMUtil.resolve_aliases(members, programs)
// Configure the init state of the vm.
const config   = VMUtil.get_config({ activated, cid, pathnames, programs : progs, schedule })
// Compile witness statements.
const witness  = VMUtil.compile_witness(progs, statements)
// Run VM with witness and final timestamp.
const vm_state = VMUtil.run_vm(config, witness, duration)

print_banner('vm state')
console.dir(vm_state, { depth: null })
console.log('\n')
