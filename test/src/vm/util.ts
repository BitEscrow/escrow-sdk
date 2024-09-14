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
  MachineConfig,
  MachineData
} from '@scrow/sdk/core'

import CVM from '@scrow/sdk/cvm'

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

export function get_config (MachineConfig : unknown) {
  return CoreSchema.machine.config.parse(MachineConfig)
}

export function compile_witness_vectors (
  vmdata    : MachineData,
  witnesses : WitnessVector[]
) {
  const wit_data = []
  // For each witness statement: 
  for (const { signers, ...tmpl } of witnesses) {
    // Resolve signer aliases into their devices:
    const mbrs = signers.map(e => get_signer(e))
    const pub  = mbrs[0].signer.pubkey
    // Create the witness template:
    let witness = create_witness(vmdata, pub, tmpl)
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

export function run_vm_vectors (
  config     : MachineConfig,
  timeout    : number,
  vectors    : WitnessVector[]
) : MachineData {
  const marker = config.active_at + timeout
  let   vmdata = CVM.init(config)
  const stack  = compile_witness_vectors(vmdata, vectors)
  // console.log('vm_state:', vm_state)
  // For each signed witness statement:
  for (const witness of stack) {
    // Evaluate the witness statement.
    vmdata = CVM.eval(vmdata, witness)
    // Unpack the current state results:
    const { error, output } = vmdata
    // If there's an error or result, return.
    if (error !== null || output !== null) {
      return vmdata
    }
  }
  // If the vm is still running, eval the timestamp.
  return CVM.run(vmdata, marker)
}
