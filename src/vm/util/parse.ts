import VMSchema from '../schema.js'

import { VMState } from '../types.js'

export function parse_vmstate (state : unknown) : VMState {
  return VMSchema.state.parse(state)
}
