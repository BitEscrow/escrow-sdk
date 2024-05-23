---
sidebar_position: 1
---


# Getting Started

Below is a step-by-step guide on how to use the protocol in an example scenario. This guide includes a live demo that you can run with no special software required.

You can run the demo locally, or in our live [replit instance](https://replit.com/@cscottdev/escrow-core#demo/api/contract/witness.ts) using the shell command:

```sh
npm install           # Install all package dependencies.
npm run demo {chain}  # Run the demo using the provided chain.
```

The current chains available are `mutiny`, `signet`, and `testnet`. The default chain is `mutiny`.

## Create a Client

The `EscrowClient` is a basic client for consuming our API. It handles all tasks which do not require a signing device.

Configuring a client requires specifying a `ClientConfig` object. This object specifies the `network` to use, 

```ts
import { EscrowClient } from '@scrow/core'

const config : ClientConfig = {
  // The network you are using.
  network    : 'signet',
  // The URL to an electrum-based indexer of your choice.
  oracle_url : 'https://mempool.space/signet',
  // The public key of the escrow server.
  server_pk  : '33f9d5a021afdffb864153eefa5d353d53e2d22053dadf8577c0e2b524bac794',
  // The URL to our escrow server.
  server_url : 'https://bitescrow-signet.vercel.app',
}

// Create an EscrowClient using the above config.
const client = new EscrowClient(config)
```

For more detailed information, check out the [EscrowClient](class/client.md) class interface.

## Create a Signer

The `EscrowSigner` is used to represent a member of a contract, or a depositor of funds.

For development, the fastest way to setup a new signer is to generate one randomly:

```ts
import { EscrowSigner } from '@scrow/core/client'

// Generate a new EscrowSigner from scratch.
const signer = EscrowSigner.generate(config)
// Create an EscrowSigner from a passphrase (for testing).
const signer = EscrowSigner.import(config).from_phrase('alice')
```

For more detailed information, check out the [EscrowSigner](class/signer.md) class interface.

## Create a Proposal

The proposal is a simple JSON document. It can be created any number of ways:

```ts
const proposal : ProposalTemplate = {
  title    : 'Basic two-party contract with third-party arbitration.',
  duration : 14400,
  feerate  : 1,
  network  : 'mutiny',
  schedule : [[ 7200, 'close|resolve', 'payout|refund' ]],
  value    : 10000
}
```

A more complete proposal will have entries for `paths`, `payments`, and `programs`.

These entries can be specified manually, or added by an `EscrowSigner` through the use of `roles`: 

```ts
const roles : RoleTemplate[] = [
  {
    title : 'buyer',
    paths : [[ 'refund', 10000 ]],
    programs : [
      [ 'endorse', 'close|resolve', '*', 2 ],
      [ 'endorse', 'dispute', 'payout', 1  ]
    ]
  },
  {
    title : 'seller',
    paths : [[ 'payout', 10000 ]],
    programs : [
      [ 'endorse', 'close|resolve', '*', 2 ],
      [ 'endorse', 'dispute', 'refund', 1  ]
    ]
  },
  {
    title : 'agent',
    programs : [
      [ 'endorse', 'resolve', '*', 1 ]
    ]
  }
]
```

## Negotiate a Proposal

For negotiation between signers, we have developed a [DraftData](data/draft.md) document which users can share to collaborate:

```ts
interface DraftData {
  // List of signer credentials in the proposal.  
  members  : MemberData[]  
  // The main proposal document being negotiated.
  proposal : ProposalData  
  // List of roles defined for the proposal.
  roles    : RolePolicy[]  
  // List of signer endorsements, used for readiness and indexing.
  sigs     : string[]
}
```

This document defines `roles` within the proposal, tracks which `members` have joined, and collects `signatures` from each member.

```ts
import { DraftUtil }       from '@scrow/sdk/client'
import { signers }         from './02_create_signer.js'
import { proposal, roles } from './03_create_proposal.js'

/**
 * Unpack our list of signers.
 */
const [ a_signer, b_signer, c_signer ] = signers

/**
 * Create a DraftSession object. This data object is
 * useful for collaboration between signing devices.
 */
let draft = DraftUtil.create({ proposal, roles })

/**
 * For each role in the proposal, we are going to request
 * a member's signing device to join the proposal as that
 * role, adding payment information as needed.
 */
const seats = draft.roles.map(e => e.id)

draft = a_signer.draft.join(seats[0], draft)
draft = b_signer.draft.join(seats[1], draft)
draft = c_signer.draft.join(seats[2], draft)

/**
 * For each signer, we are going to collect a signature
 * endorsement. This step is optional, but we can use it
 * to signal readiness for a proposal to be submitted.
 */
signers.forEach(mbr => {
  draft = mbr.draft.endorse(draft)
})

/**
 * Verify the proposal is complete, all positions are 
 * filled, and endorsements are valid.
 */
DraftUtil.verify(draft)

/**
 * Create a publish request. This is a request body for
 * publishing a contract on the escrow server.
 */
const publish_req = DraftUtil.publish(draft)
```

For more detailed information, check out the [DraftSession](data/draft.md) data interfaces.

## Create a Contract

Once you have put together a final draft of the proposal, the next step is to publish it on the escrow server:

```ts
import CVM              from '@scrow/sdk/cvm'
import { client }       from './01_create_client.js'
import { publish_req }  from './04_finish_proposal.js'

/**
 * We will need to pass in a reference to the scripting engine 
 * defined in the proposal, so that it can verify the terms set
 * for each program.
 */
const engine = CVM

/**
 * Request to create a new contract on the escrow server.
 */
const res = await client.contract.create(publish_req, engine)
// Check the server response is valid.
if (!res.ok) throw new Error(res.error)

/**
 * The server will respond with a new contract. This contract
 * will be published under a contract id (cid), which can be
 * referenced for reading and funding.
 */
const new_contract = res.data.contract
```

Once published, the contract is ready for funding. You can share the contract with others by advertising its unique identifier, the `cid`.

For more detailed information, check out the [Contract](data/contract.md) data interfaces.

## Request a Deposit Account

Before making a deposit, we need to request a unique deposit account from the escrow server:

```ts
import { config }  from './00_demo_config.js'
import { client }  from './01_create_client.js'
import { signers } from './02_create_signer.js'

/**
 * Choose a signer to act as the funder of the contract.
 * This signer will specify a locktime for the escrow, plus
 * a return address for if / when the deposit is closed.
 */
const funder      = signers[0]
// Define our deposit locktime.
const locktime    = 60 * 60 * 48 // 48 hours.
// Define a return address for the deposit.
const return_addr = 'enter return address here'

/**
 * Request a deposit account from the escrow server. This account
 * will include a 2-of-2 musig deposit address, plus a commitment
 * token to use when creating a covenant.
 */
const req = funder.account.request(locktime, return_addr)
// Submit the account request to the escrow server.
const res = await client.account.request(req)
// Check the server response is valid.
if (!res.ok) throw new Error(res.error)
// Verify that the account is valid.
funder.account.verify(res.data.account)

/**
 * The server will respond with a new AccountData object. This 
 * account will be signed using the escrow server's public key.
 */
const new_account = res.data.account
```

After verifying the account, funders can safely send funds to the account address. Once the transaction is visible in the mempool, we can grab the transaction's `utxo` data using an oracle:

```ts
/**
 * Check the contract for the total sats balance that needs to be paid.
 * This balance will be the subtotal of the contract, plus transaction
 * fees. We also need to include an additional fee to cover our input.
 */
const amt_total = get_contract_balance(new_contract) + new_contract.vin_txfee
// Also convert to a BTC amount (for bitcoin core).
const btc_total = amt_total / 100_000_000
// Define the address where we will send the funds.
const address   = new_account.deposit_addr
// Define a feerate for the return transaction.
const ret_rate  = config.feerate
// Unpack the address from the account.
const address   = new_account.deposit_addr
// Fetch all utxos from the address.
const utxos     = await client.oracle.get_address_utxos(address)
// There should be a utxo present.
if (utxos.length === 0) throw new Error('utxo not found')
// Get the output data from the first utxo.
const utxo_data = utxos[0].txspend
```

For more detailed information, check out the [Account](data/account.md) data interface.

## Register and Commit Funds

The next step is to register the `utxo` with the escrow server, and optionally provide a `covenant` that locks it to the contract. We can perform both actions using the `commit` method:

```ts
/**
 * Request to register a utxo with the escrow server, plus a covenant
 * that locks the utxo to the specified contract.
 */
import { config } from './00_demo_config.js'
import { client } from './01_create_client.js'

import { funder, new_account } from './06_request_account.js'

const req = funder.account.commit(new_account, new_contract, ret_rate, utxo_data)
// Deliver our registration request to the server.
const res = await client.account.commit(req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)

/**
 * The server will respond with the deposit account, which will be
 * registered and locked to the contract. An updated copy of the
 * contract is also provided in the response.
 */
const funded_contract = res.data.contract
const locked_deposit  = res.data.deposit
```

## Submit a Statement

Once all funding is confirmed (and the `effective_at` date is reached), the contract should activate, and a dedicated virtual `Machine` will become available.

Members of the contract can then submit statements to the escrow server. The server will input these statements into the `Machine`, and return a signed receipt of execution:

```ts
import { get_vm_config }   from '@scrow/sdk/vm'
import { WitnessData }     from '@scrow/sdk/core'
import CVM                 from '@scrow/sdk/cvm'

import { client }          from './01_create_client.js'
import { signers }         from './02_create_signer.js'
import { active_contract } from './08_check_activation.js'

/**
 * Unpack the signing devices for Alice (the "buyer"),
 * and Bob (the "seller").
 */
const [ a_signer, b_signer ] = signers

/**
 * Configure and initialize a machine instance. We'll use this
 * to validate our own statement, and to verify it was executed
 * fairly by the escrow server.
 */
const config = get_vm_config(active_contract)
// Create the initial state of the machine.
const vmdata = CVM.init(config)
// The machine id is derived from the contract.
const vmid   = vmdata.vmid

/**
 * Configure a template for our statement. This template is used to check
 * the contract for a matching program that will allow our statement.
 */
const template = {
  action : 'close',
  method : 'endorse',
  path   : 'payout'
}

/**
 * Create and sign the witness statement using Alice's device, then
 * use Bob's device to provide an additional signature.
 */
let witness : WitnessData
// Alice signs the initial statement.
witness = a_signer.witness.create(vmdata, template)
// Bob endoreses the statement from Alice.
witness = b_signer.witness.endorse(vmdata, witness)

/**
 * Submit the signed witness statement to the escrow server.
 */
const res = await client.vm.submit(vmid, witness)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)

/**
 * The server will respond with a signed receipt of execution. This receipt
 * commits to the witness statement, plus the new state of the machine.
 */
const vm_receipt = res.data.receipt

/**
 * We can use the receipt to verify that our witness statement was processed 
 * correctly by the escrow server.
 */
client.witness.verify(vm_receipt, vmdata, witness)
```

If the statement satisfies a closing condition in the machine, it will also close the contract. If the machine output specifies a spending path, the escrow server will co-sign the relevant spending transaction. If the machine output returns null, all covenants will be released. 

If spent, the updated contract will record this information under `spent_txhex` and `spent_txid`.

## Verify Contract Settlement

```ts
import { assert } from '@scrow/sdk/util'
import CVM        from '@scrow/sdk/cvm'

import { client }          from './01_create_client.js'
import { active_contract } from './08_check_activation.js'
import { locked_deposit }  from './07_deposit_funds.js'
import { witness }         from './09_submit_statements.js'

/**
 * Fetch the latest contract state from the escrow server,
 * which should now be closed and spent.
 */
const res = await client.contract.read(active_contract.cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the contract from the response.
const spent_contract = res.data.contract
// Assert that the contract is spent.
assert.ok(spent_contract.spent, 'contract has not been spent')

/**
 * Verify the entine contract state, including the funds spent
 * and execution of witness statements.
 */
client.contract.verify({
  contract   : spent_contract,
  engine     : CVM,
  funds      : [ locked_deposit ],
  statements : [ witness ]
})

// Unpack the txid from the spent contract.
const txid = spent_contract.spent_txid
// Lookup the transaction on the block-chain.
const txdata = await client.oracle.get_tx_data(txid)
// Print the transaction data to console.
console.dir(txdata, { depth : null })
```

And that is it! The on-chain transaction will look like an anonymous coin-join of single-key spends, and it can be fee-bumped by any recipient of the contract funds using CPFP.
