import { now }    from '@scrow/core/util'
import { VMUtil } from '@scrow/test'

import vector from './vector.json' assert { type: 'json' }

const cid       = '00'.repeat(32)
const activated = now()

// Unpack the mock vector.
const { duration, members, pathnames, programs, schedule, statements } = vector
// Find and replace aliases with their relevant pubkeys.
const progs    = VMUtil.resolve_aliases(members, programs)
// Configure the init state of the vm.
const config   = VMUtil.parse_config({ activated, cid, pathnames, programs : progs, schedule })
// Compile witness statements.
const witness  = VMUtil.compile_witness(progs, statements)
// Run VM with witness and final timestamp.
const vm_state = VMUtil.run_vm(config, duration, witness)
// Print results to console.
console.dir(vm_state, { depth: null })
