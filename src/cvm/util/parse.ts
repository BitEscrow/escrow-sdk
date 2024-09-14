import { VMError }     from '@/cvm/util/index.js'
import { CVMData }     from '@/cvm/types/index.js'
import { MachineData } from '@/types/index.js'
import { assert }      from '@/util/index.js'

import CVMSchema from '@/cvm/schema.js'

export function serialize_vmstate (vmdata : CVMData) : MachineData {
  try {
    const state = CVMSchema.int_state.parse(vmdata.state)
    const json  = JSON.stringify(state)
    return CVMSchema.data.parse({ ...vmdata, state: json })
  } catch (err) {
    console.log(err)
    throw new VMError('failed to serialize vmstate')
  }
}

export function revive_vmstate (vmdata : MachineData) : CVMData {
  try {
    assert.exists(vmdata.state, 'vm state is undefined')
    const state = JSON.parse(vmdata.state)
    return CVMSchema.vm_state.parse({ ...vmdata, state })
  } catch (err) {
    console.log(err)
    throw new VMError('failed to revive vmstate')
  }
}
