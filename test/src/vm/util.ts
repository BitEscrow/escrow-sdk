import { Buff }   from '@cmdcode/buff'
import { Signer } from '@cmdcode/signer'

import assert from 'assert'

import {
  create_witness,
  sign_witness
} from '@scrow/core/witness'

import {
  Schema,
  MachineConfig,
  ProgramTerms,
  SignerAPI,
  WitnessData,
  StateData
} from '@scrow/core'

import {
  eval_schedule,
  eval_witness,
  init_vm
} from '@scrow/core/vm'

interface MemberSigner {
  alias  : string
  signer : SignerAPI
}

interface WitnessVector {
  action  : string
  method  : string
  path    : string
  signers : string[]
}

export function get_signer (alias : string) : MemberSigner {
   const seed = Buff.str(alias)
   return { alias, signer : new Signer({ seed }) }
}

export function resolve_aliases (
  aliases  : string[],
  programs : (string | number)[][]
) : ProgramTerms[] {
  const mbrs  = aliases.map(e => get_signer(e))
  const progs = Schema.proposal.terms.array().parse(programs)
  for (let i = 0; i < progs.length; i++) {
    const terms = progs[i]
    for (let j = 0; j < terms.length; j++) {
      const term = terms[j]
      if (typeof term === 'string' && aliases.includes(term)) {
        const mbr = mbrs.find(e => e.alias === term)
        assert.ok(mbr !== undefined)
        progs[i][j] = mbr.signer.pubkey
      }
    }
  }
  return progs
}

export function parse_config (config : unknown) : MachineConfig {
  return Schema.vm.config.parse(config)
}

export function compile_witness (
  programs  : ProgramTerms[],
  witnesses : WitnessVector[]
) {
  const wit_data : WitnessData[] = []
  // For each witness statement: 
  for (const { signers, ...rest } of witnesses) {
    // Resolve signer aliases into their devices:
    const mbrs = signers.map(e => get_signer(e))
    const pub  = mbrs[0].signer.pubkey
    // Create the witness template:
    let witness = create_witness(programs, pub, rest)
    // For each signer of the statement:
    for (const mbr of mbrs) {
      // Endorse the witness template.
      witness = sign_witness(mbr.signer, witness)
    }
    // Push the endorsed witness to the stack.
    wit_data.push(witness)
  }
  return wit_data
}

export function run_vm (
  config    : MachineConfig,
  stamp     : number,
  witnesses : WitnessData[]
) : StateData {
  const timeout  = config.activated + stamp
    let vm_state = init_vm(config)
  // console.log('vm_state:', vm_state)
  // For each signed witness statement:
  for (const wit of witnesses) {
    // Evaluate the witness statement.
    vm_state = eval_witness(vm_state, wit)
    // Unpack the current state results:
    const { error, output } = vm_state
    if (error !== null || output !== null) {
      // If there's a result, return.
      return vm_state
    }
  }
  // If the vm is still running, eval the timestamp.
  return eval_schedule(vm_state, timeout)
}
