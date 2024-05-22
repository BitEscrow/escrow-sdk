import {
  Literal,
  ProgramEntry,
  MachineData,
  ScriptEngineAPI,
  VMSubmitRequest
} from '../types/index.js'

import PropSchema    from '../schema/proposal.js'
import MachineSchema from '../schema/machine.js'

export function validate_program_entry (
  program : unknown
) : asserts program is ProgramEntry {
  void PropSchema.program.parse(program)
}

export function validate_submit_req (
  request : unknown
) : asserts request is VMSubmitRequest {
  void MachineSchema.submit_req.parse(request)
}

export function validate_machine_data (
  vmdata : MachineData
) {
 void MachineSchema.data.parse(vmdata)
}

export function verify_program_entry (
  machine : ScriptEngineAPI,
  method  : string,
  params  : Literal[]
) {
  if (!machine.methods.includes(method)) {
    throw new Error('invalid program method: ' + method)
  }

  const err = machine.verify(method, params)

  if (err !== null) throw new Error(err)
}

export default {
  validate : {
    program : validate_program_entry,
    data    : validate_machine_data
  },
  verify : {
    program : verify_program_entry
  }
}
