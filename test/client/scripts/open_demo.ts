import { Buff }           from '@cmdcode/buff'
import { Signer, Wallet } from '@cmdcode/signer'

import { print_banner, sleep } from '@scrow/test'

import {
  EscrowProposal,
  Network,
  RolePolicy
} from "@scrow/core"

import {
  EscrowClient,
  EscrowSigner
} from '@scrow/core/client'

import { CoreUtil } from '@scrow/test'

import CONFIG from '../config.js'

const VERBOSE = process.env.VERBOSE === 'true'

// Startup a local process of Bitcoin Core for testing.
const config = CONFIG.mutiny
const core   = CoreUtil.get_daemon(config.core)
const cli    = await core.startup()

const is_regtest = config.core.network === 'regtest'

const aliases = [ 'alice', 'bob', 'carol', 'david' ]
const client  = new EscrowClient(config.client)

let network = config.core.network as Network

if (network === 'signet') {
  network = 'testnet'
}

const members = aliases.map(alias => {
  // Freeze the idx generation at 0 for testing.
  const idxgen = () => 0
  // Create a basic deterministic seed for testing.
  const seed   = Buff.str(alias).digest
  // Create a new signer using the seed.
  const signer = new Signer({ seed })
  // Create a new wallet using the seed.
  const wallet = Wallet.create({ seed, network })
  // Return an escrow signer.
  return new EscrowSigner({ ...config.client, idxgen, signer, wallet })
})

const proposal = new EscrowProposal({
  title      : 'Basic two-party contract with third-party dispute resolution.',
  content    : 'n/a',
  expires    : 14400,
  members    : [],
  network    : 'testnet',
  paths      : [],
  payments   : [],
  programs   : [],
  schedule   : [[ 7200, 'close', 'draw' ]],
  value      : 15000,
  version    : 1
})

const roles : Record<string, RolePolicy> = {
  buyer : {
    paths : [
      [ 'heads', 10000 ],
      [ 'draw',  5000  ]
    ],
    programs : [
      [ 'endorse', 'close',   'heads|tails', 2 ],
      [ 'endorse', 'dispute', 'heads|tails', 1 ]
    ]
  },
  sales : {
    paths : [
      [ 'tails', 10000 ],
      [ 'draw',  5000  ]
    ],
    programs : [
      [ 'endorse', 'close',   'heads|tails', 2 ],
      [ 'endorse', 'dispute', 'heads|tails', 1 ]
    ]
  },
  agent : {
    payment : 5000,
    paths   : [],
    programs : [
      [ 'endorse', 'resolve', 'heads|tails', 1 ]
    ]
  }
}

// Unpack our members for testing.
const [ a_mbr, b_mbr, c_mbr ] = members

// Request the buyer and seller to join the proposal.
proposal.join(roles.buyer, a_mbr)
proposal.join(roles.sales, b_mbr)
proposal.join(roles.agent, c_mbr)

// Have all memebers endorse the proposal.
const signatures = [
  a_mbr.endorse.proposal(proposal),
  b_mbr.endorse.proposal(proposal),
  c_mbr.endorse.proposal(proposal)
]

// Submit the proposal to the API to create a contract.
const create_res = await client.contract.create(proposal, signatures)

// Check that the response is valid.
if (!create_res.ok) throw new Error(create_res.error)

let { contract } = create_res.data

if (VERBOSE) {
  print_banner('NEW CONTRACT')
  console.dir(contract, { depth : null })
}

// Request an account for the member to use.
const account_res = await client.deposit.request({
  pubkey   : a_mbr.pubkey,
  locktime : 60 * 60 // 1 hour locktime
})

// Check the response is valid.
if (!account_res.ok) throw new Error(account_res.error)

// Unpack some of the terms.
const { account } = account_res.data

if (VERBOSE) {
  print_banner('NEW ACCOUNT')
  console.dir(account, { depth : null })
}

const { address, agent_id } = account

// Use our utility methods to fund the address and get the utxo.
const txid = await CoreUtil.fund_address(cli, 'faucet', address, 20_000, is_regtest)

if (!is_regtest) {
  await sleep(5000)
}

const utxo = await CoreUtil.get_utxo(cli, address, txid)

// Request the member to sign
const return_tx = await a_mbr.deposit.register_utxo(account, utxo)
const covenant  = await a_mbr.deposit.commit_utxo(account, contract, utxo)

// Fund the contract directly with the API.
const deposit_res = await client.deposit.fund(agent_id, return_tx, covenant)

// Check the response is valid.
if (!deposit_res.ok) throw new Error(deposit_res.error)

let deposit = deposit_res.data.deposit

contract = deposit_res.data.contract

if (VERBOSE) {
  print_banner('NEW DEPOSIT')
  console.dir(deposit, { depth : null })
  print_banner('UPDATED CONTRACT')
  console.dir(contract, { depth : null })
}
