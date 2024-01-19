import { create_witness } from '@/lib/witness.js'
import { Buff }           from '@cmdcode/buff'
import { Signer, Wallet } from '@cmdcode/signer'
import { print_banner }   from '../utils.js'

import { WitnessTemplate } from "@scrow/core"

import {
  EscrowClient,
  EscrowSigner
} from '@scrow/core/client'

import CONFIG from '../config.js'

const VERBOSE = process.env.VERBOSE === 'true'

// Startup a local process of Bitcoin Core for testing.
const config  = CONFIG.mutiny
const aliases = [ 'alice', 'bob', 'carol', 'david' ]
const client  = new EscrowClient(config.client)

const members = aliases.map(alias => {
  // Freeze the idx generation at 0 for testing.
  const idxgen = () => 0
  // Create a basic deterministic seed for testing.
  const seed   = Buff.str(alias).digest
  // Create a new signer using the seed.
  const signer = new Signer({ seed })
  // Create a new wallet using the seed.
  const wallet = Wallet.create({ seed, network : 'regtest' })
  // Return an escrow signer.
  return new EscrowSigner({ ...config.client, idxgen, signer, wallet })
})

// Unpack our members for testing.
const [ a_mbr, b_mbr ] = members

const cid = 'c842e095ac98e43bc274c521282c506352009e921820a444c37c0992478ee962'

// Request an account for the member to use.
const ct_res = await client.contract.read(cid)

// Check the response is valid.
if (!ct_res.ok) throw new Error(ct_res.error)

const { contract } = ct_res.data

if (VERBOSE) {
  print_banner('ACTIVE CONTRACT')
  console.dir(contract, { depth : null })
}

const template : WitnessTemplate = {
  action : 'close',
  method : 'endorse',
  path   : 'tails'
}

const terms  = contract.terms 

const pubkey = a_mbr.get_membership(terms).token.pub

let witness = create_witness(terms.programs, pubkey, template)

witness = a_mbr.endorse.witness(contract, witness)
witness = b_mbr.endorse.witness(contract, witness)

if (VERBOSE) {
  print_banner('SIGNED WITNESS')
  console.dir(witness, { depth : null })
}

const wit_res = await client.contract.submit(contract.cid, witness)

// Check the response is valid.
if (!wit_res.ok) throw new Error(wit_res.error)

const { contract: new_contract } = wit_res.data

if (VERBOSE) {
  print_banner('SETTLED CONTRACT')
  console.dir(new_contract, { depth : null })
}
