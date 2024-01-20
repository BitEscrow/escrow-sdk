import { now }    from '@scrow/core/util'
import { VMUtil } from '@scrow/test'

import vector from './vector.json' assert { type: 'json' }

const cid       = '00'.repeat(32)
const activated = now()

// Unpack the vector object.
const { members, pathnames, programs, schedule, stamp, witness } = vector
// Find and replace aliases with their relevant pubkeys.
const progs  = VMUtil.resolve_aliases(members, programs)
// Configure the init state of the vm.
const config = VMUtil.parse_config({ activated, cid, pathnames, programs : progs, schedule })
// Compile witness statements.
const witdat = VMUtil.compile_witness(progs, witness)
// Run VM with witness and final timestamp.
const vm_state = VMUtil.run_vm(config, stamp, witdat)
// Print results to console.
console.dir(vm_state, { depth: null })
