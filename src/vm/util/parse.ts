import { VMData }  from '@/core/types/index.js'
import { assert }  from '@/core/util/index.js'
import { VMError } from './base.js'
import schema      from '../schema.js'
import { VMState } from '../types.js'

export function serialize_vmstate (vmstate : VMState) : VMData {
  try {
    const state = schema.int_state.parse(vmstate)
    const json  = JSON.stringify(state)
    return schema.data.parse({ ...vmstate, state: json })
  } catch (err) {
    console.log(err)
    throw new VMError('failed to serialize vmstate')
  }
}

export function revive_vmstate (vmdata : VMData) : VMState {
  try {
    assert.exists(vmdata.state, 'vm state is undefined')
    const state = JSON.parse(vmdata.state)
    return schema.vm_state.parse({ ...vmdata, ...state })
  } catch (err) {
    console.log(err)
    throw new VMError('failed to revive vmstate')
  }
}
