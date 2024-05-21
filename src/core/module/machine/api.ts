import MachineSchema from '@/core/schema/machine.js'

import {
  VMSubmitRequest,
  WitnessData
} from '@/core/types/index.js'

/**
 * Create a submit request object.
 */
export function create_submit_req (
  vmid    : string,
  witness : WitnessData
) : VMSubmitRequest {
  // Parse and return a valid submit request object.
  return MachineSchema.submit_req.parse({ vmid, witness })
}
