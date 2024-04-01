import { Buff }   from '@cmdcode/buff'
import { Signer } from '@cmdcode/signer'

import assert from 'assert'

import {
  create_witness,
  endorse_witness
} from '@scrow/sdk/witness'

import {
  CoreSchema,
  ProgramEntry,
  SignerAPI,
  VMConfig,
  VMData,
  WitnessData,
} from '@scrow/sdk/core'

import { VirtualMachine } from '@scrow/sdk/cvm'

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
   const seed = Buff.str(alias).digest
   return { alias, signer : new Signer({ seed }) }
}

export function resolve_aliases (
  aliases  : string[],
  programs : unknown[]
) : ProgramEntry[] {
  const progs = CoreSchema.proposal.programs.parse(programs)
  const mbrs  = aliases.map(e => get_signer(e))
  for (let i = 0; i < programs.length; i++) {
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

export function get_config (vmconfig : unknown) {
  return CoreSchema.vm.config.parse(vmconfig)
}

export function compile_witness (
  programs  : ProgramEntry[],
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
      witness = endorse_witness(mbr.signer, witness)
    }
    // Push the endorsed witness to the stack.
    wit_data.push(witness)
  }
  return wit_data
}

export function run_vm (
  config     : VMConfig,
  statements : WitnessData[],
  timeout    : number
) : VMData {
  const marker = config.activated + timeout
  let   state  = VirtualMachine.init(config)
  // console.log('vm_state:', vm_state)
  // For each signed witness statement:
  for (const witness of statements) {
    // Evaluate the witness statement.
    state = VirtualMachine.eval(state, witness)
    // Unpack the current state results:
    const { error, output } = state
    // If there's an error or result, return.
    if (error !== null || output !== null) {
      return state
    }
  }
  // If the vm is still running, eval the timestamp.
  return VirtualMachine.run(state, marker)
}
