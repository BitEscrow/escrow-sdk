[![Integration Tests](https://github.com/BitEscrow/escrow-core/actions/workflows/integration.yml/badge.svg?branch=master)](https://github.com/BitEscrow/escrow-core/actions/workflows/integration.yml)

# escrow-core

A private, non-custodial protocol for using Bitcoin in a covenant-based smart contract.

Key Features:

  * __100% private.__ All on-chain transactions appear as single-key spends. Participation is done through randomly generated credentials. Only requires a signing key (hot), and wallet xpub (cold) to participate.

  * __100% non-custodial.__ Money is secured in a collaborative 2-of-2 contract. All payouts are pre-signed before deposit. Addresses are generated from a cold-stored xpub of your choice.

  * __100% auditable.__ All contract terms, inputs, and operations are signed and recorded in a commit chain. Each settlement transaction is backed by an auditable commit history.

  * __Designed for trustless environments.__ Signing keys are disposable and have no capacity to sweep funds. Terms are signed up-front and verified before deposit.

  * __Designed to be robust.__ Deposits are reusable when a contract cancels or expires. Credentials are recoverable via your xpub. Refunds are secured upfront and broadcast automatically on expiration.

Package Features:

  * Method libraries for every part of the protocol.
  * Multi-platform client with minimal dependencies.
  * Run-time schema validation (using zod).
  * E2E demo and test suite for signet, testnet, and mutiny.

In Progress:

 * Better documentation and code comments.
 * Live demos for all API endpoints.
 * Tools for building and testing proposals.
 * A dedicated replit container for this repo.

Comimg Soon:
  
  * Nostr note support for all primary interfaces.
  * Return receipts on witness submission.
  * Field to add raw tx `templates` to a proposal.
  * New `hashlock` and `webhook` programs for vm.

## Index

1. [Protocol Overview](#protocol-overview)  
  a. [Negotiation](#negotiation)  
  b. [Funding](#funding)  
  c. [Settlement](#settlement)  
  d. [Protocol Flow Examples](#protocol-flow-examples)  
  e. [Security Model](#security-model)  
2. [How to Use](#how-to-use)  
  a. [Create a Client](#create-a-client)  
  b. [Create a Signer](#create-a-signer)  
  c. [Build a Proposal](#build-a-proposal)  
  d. [Create a Contract](#create-a-contract)  
  e. [Deposit Funds](#deposit-funds)  
  f. [Using the CVM](#contract-activation)  
  g. [Settle a Contract](#settle-a-contract)  
3. [Development & Testing](#development--testing)  
  a. [Running the Main Demo](#running-the-main-demo)  
  b. [Running in Replit](#running-in-replit)  
  c. [Using the Client API Demos](#using-the-client-api-demos)  
  d. [Using the CVM Eval Tool](#using-the-cvm-evaluation-tool)  
  e. [Using the Test Suite](#using-the-test-suite)  
  f. [OpenAPI Specification](#openapi-specification)  
4. [Questions & Issues](#questions--issues)
5. [Contribution](#contribution)
6. [Resources](#resources)
7. [Footnote](#footnote)

## Protocol Overview

The escrow protocol involves collaboration between three parties:

`Members` : The participating members of the contract.  
`Funders` : Those funding the contract (whom may be members).  
`Server ` : The escrow server hosting the contract (BitEscrow API).

The protocol is split into three phases: _negotiation_, _funding_, and _settlement_. Each phase represents a round of communication in the protocol.

### Negotiation

The first step is to negotiate and agree on a [proposal](docs/proposal.md) document. This is a human-readable document which contains all of the terms of the contract.

It is written in JSON format, and designed for collaboration (much like a PSBT):

```ts
{
  title    : 'Basic two-party contract with third-party dispute resolution.',
  content  : '{}',
  duration : 14400,  // 4 hours.
  network  : 'regtest',
  paths: [
    [ 'payout', 90000, 'bcrt1qhlm6uva0q2m5dq4kjd9uzsankkxe9pza5uylcs' ],
    [ 'return', 90000, 'bcrt1qemwtdfh9uncvw7jlq4ux7p7stl9lgvfxa8t05g' ]
  ],
  payments : [[ 10000, 'bcrt1qxemag7t72rlrhl2ezsnsprmunmnzc35nmaph6v' ]],
  programs : [
    [ 'endorse', 'dispute', 'payout', 1, '9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be' ],
    [ 'endorse', 'resolve',      '*', 1, '9094567ba7245794198952f68e5723ac5866ad2f67dd97223db40e14c15b092e' ],
    [ 'endorse', 'close|resolve','*', 2, 
      '9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be',
      '4edfcf9dfe6c0b5c83d1ab3f78d1b39a46ebac6798e08e19761f5ed89ec83c10'
    ]
  ],
  schedule : [[ 7200, 'close', 'payout|return' ]],
  value    : 100000,
  version  : 1
}
```

If desired, a third-party can host the proposal. The protocol is designed for third-parties to help with negotiation, and offer their own services, such as arbitration.

There is no specification placed on how to communicate the proposal between parties. There are many great protocols available, so feel free to use your favorite one!

Once the terms have been decided, any member can deliver the final proposal to the escrow server. The server will validate all terms, then publish an open [contract](docs/contract.md) for funding.

> Note: The escrow server does not take part in negotiations. While BitEscrow may offer these services, the protocol is designed so that members can negotiate freely, without the server being involved.

### Funding

To deposit funds into a contract, the funding party will first request a deposit [account](docs/deposit.md) from the server. This account uses a 2-of-2 multi-signature address with a time-locked refund path.

```ts
interface DepositAccount {
  acct_id    : string  // Hash identifer for the account record.
  acct_sig   : string  // Signature for the account record.
  address    : string  // On-chain address for receiving funds.
  agent_id   : string  // Identifier of the server agent.
  agent_pk   : string  // Public key of the server agent.
  created_at : number  // Account creation timestamp (in seconds).
  deposit_pk : string  // Public key of the funder making the deposit.
  sequence   : number  // Locktime converted into a sequence value.
  spend_xpub : string  // The extended key used for returning funds.
}
```

The funder independently verifies the account information, then sends their funds into the account address.

Once the transaction is in the mempool, the funder can then commit the funds by signing the contract's spending paths. These signatures authorize the contract to spend the deposit based on the contract terms.

The combination of these signatures form a [covenant](docs/deposit.md) with the contract:

```ts
interface CovenantData {
  cid    : string  // id of the contract.
  pnonce : string  // public nonce (used for musig).
  psigs  : [
    path : string, // name of path in the contract.
    psig : string  // partial signature (used for musig).
  ][]
}
```

Once a covenant is made, the deposit is locked in escrow. When enough funds have been locked and confirmed, the contract becomes active.

### Settlement

The final round of the protocol is the `settlement`. This is the most exciting round, as members get to decide how the money shall be spent.

Each contract comes with a tiny virtual machine, called the CVM. When the contract becomes active, the CVM is initialized using the terms specified in the proposal, and a hash-chain is started:

```ts
// A new virtual machine, fresh from the womb.
vm_state: {
  commits  : [],
  error    : null,
  head     : 'b70704c41e27d5f35a11ae7c6e5976501aa1380195714007197d7f47934dcf69',
  output   : null,
  paths    : [ [ 'draw', 0 ], [ 'heads', 0 ], [ 'tails', 0 ] ],
  start : 1706511301,
  steps : 0,
  store : [
    [ '054fef5ba39416260ea4b48e9c557ee7e45d780d04b28e094d110459b971b78b', '[]' ],
    [ 'cf236c4e91678bddaaa482d41720f277bb7d2e4540a0fc47736b999a54d29e39', '[]' ],
    [ 'e7862cbeb981d295639af3e91661fc96e0f97b429e9ff2985d20a654667d167a', '[]' ]
  ],
  status  : 'init',
  tasks   : [ [ 7200, 'close', 'draw' ] ],
  updated : 1706511301
}
```

> Note : The `head` of the hash-chain is initialized using the contract's identifier (cid).

Members of the contract can interact with the CVM by submitting a signed statement, called a [witness](docs/contract.md). Members use these statements to instruct the CVM to perform a basic set of operations.

Each operation targets a spending path in the contract. Operations include `lock`, `release`, `close` and `dispute`:

```ts
// An example witness statement, endorsed with two signatures.
{
  action  : 'close',
  args    : [],
  method  : 'endorse',
  path    : 'tails',
  prog_id : '054fef5ba39416260ea4b48e9c557ee7e45d780d04b28e094d110459b971b78b',
  sigs    : [
    'effe19ba82f5451739b1d3471dae675c476147bab74e6654f1aaba82e2d96d9f...',
    'f1b1d3a097db6acb76e9296e1e41db169a781813301b4853207ee3b6e39c72b9...'
  ],
  stamp   : 1706511302,
  wid     : '8859eb66bf8fd0d2868d74fefbbaf5f73408c9072c99b4d8df3348f1479bf5f5'
}
```

Every statement that updates the CVM is recorded into the hash-chain. This chain validates the full execution history of the machine, from activation to settlement:

```ts
vm_state: {
  commits: [[
    // Position of the commit in the chain,
    step   : 0,
    // UTC timestamp of the commit.
    stamp  : 1706511302,
    // Previous head, before the commit.
    head   : 'b70704c41e27d5f35a11ae7c6e5976501aa1380195714007197d7f47934dcf69',
    // The witness id of the statement being committed.
    wid    : '8859eb66bf8fd0d2868d74fefbbaf5f73408c9072c99b4d8df3348f1479bf5f5',
    // The action that was performed.
    action : 'close',
    // The path that was evaluated.
    path   : 'tails'
  ]],
  // The (now updated) head of the chain.
  head: '41cf5e1a716067f9255580c96a808d5999c602fb2092b1789fb1ffb574c93597',
}
```

Once the CVM has settled on a spending path, the server will complete the related signatute for each deposit, then close the contract with a final settlement transaction.

The proposal, covenants, statements, and commit history all combine to create an auditable proof of execution for the contract. This proof covers how the contract must execute in any scenario, with zero ambiguity.

Every contract settled on mainnet will be backed by a valid proof of execution in order to maintain our reputation as an escrow server.

### Protocol Flow Examples

> **Scenario**: Sales agreement between a buyer (alice) and seller (bob) with third-party (carol) arbitration.

  1. Alice and Bob prepare a proposal, and agree on terms / arbitration.
  2. Alice submits the proposal to the agent and receives a contract.
  3. Alice deposits her funds with the contract agent, along with a covenant.
  4. Once the deposit is confirmed on-chain, the contract becomes active.
  
  **Happy Path: Settle on Payout**  

  5a. Alice receives her widget and forgets about Bob.  
  6a. The contract schedule closes automatically on 'payout'.  
  7a. Bob gets the funds, Alice can verify the CVM execution.  

  **Neutral Path: Settle on Refund**  

  5b. Alice doesn't like her widget.  
  6b. Alice and Bob both agree to sign the 'refund' path.  
  7b. Alice gets a partial refund, Bob still keeps his fees.  

  **Unhappy Path: Dispute Settlement**  

  5c. Alice didn't get the right widget, and disputes the payout.  
  6c. Carol steps in, and decides on the 'refund' path.  
  7c. Alice gets a partial refund, Bob still keeps his fees.  

  **Ugly Path: Contract Expires**  

  5d. Alice claims she didn't get a widget, and disputes the payout.  
  6d. Carol is on a two-week cruise in the bahamas. No auto-settlement terms were set.  
  7d. The contract expires, all deposits are released.  

  **Worst Path: Deposits Expire**  

  5e. Everything above happens, except the last part.  
  6e. The entire escrow platform goes down in flames.  
  7e. The timelock on deposits expire, Alice can spend via the refund path.  

### Security Model

A brief description of the security model:

  * Each member participates using an anonymous credential. Credentials can be verified and claimed without revealing the owner to the escrow server.
  
  * Members decide the terms of the proposal and all spending paths. The escrow server is not involved until the terms have already been finalized.

  * Anyone can choose to endorse a proposal to publicize their support. Members do not reveal their credential by making an endorsement.

  * Funders decide what transactions to sign and deliver to the escrow server. If there's a disagreement, funders can refund a deposit collaboratively or wait out the timelock.

  * The escrow server cannot link funders to a member of the contract.

  * The escrow server can only settle using transactions provided by funders.
  
  * All parites independently verify the progression of the contract and final settlement. If the server settles a contract without a valid proof, their reputation is burned.

Some challenges with the current model:

  * The escrow server has an ability to censor members of a contract by ignoring their statements. In the short term, we plan to mitigate this using time-stamped delivery receipts. In the long-term, we plan to support open platforms (such as nostr) where delivery can be independently verified.

  * Even with the covenant restrictions, the burning of reputation may not be considered strong enough incentive. We are exploring additional options, such as the server staking some collateral.

In terms of security, speed, and simplicity, we believe this is the best non-custodial solution for providing programmable escrow contracts on Bitcoin.

## How to Use

Below is a step-by-step guide on how to use the protocol in an example scenario. This guide includes a live demo that you can run on your own machine, with no special software required.

To run the demo, simply clone this repository, then run the following commands:

```sh
npm install           # Install all package dependencies.
npm run demo {chain}  # Run the demo using the provided chain.
```

> Note: The current chains available are `mutiny`, `signet`, and `testnet`. The default chain is `mutiny`.

Read more info about the demo [here](demo/README.md).

### Create a Client

The `EscrowClient` is a basic client for consuming our API. It is designed to be used for any tasks which do not require an identity or signature.

```ts
import { EscrowClient } from '@scrow/core/client'

const client_config = {
  // The URL to our escrow server.
  hostname : 'https://bitescrow-signet.vercel.app',
  // The URL to an electrum-based indexer of your choice.
  oracle   : 'https://mempool.space/signet',
  // The network you are using.
  network  : 'signet'
}

// Create an EscrowClient using the above config.
const client = new EscrowClient(client_config)
```

For more info on the `EscrowClient` class, [click here](docs/client.md).

### Create a Signer

The `EscrowSigner` is used to setup deposits and interact with a contract.

The fastest way to setup a new signer is to generate one randomly:

```ts
import { EscrowSigner } from '@scrow/core/client'

// Generate a new EscrowSigner from scratch.
const signer = EscrowSigner.generate(client_config, xpub)
```

You can import your own key-pair using a raw seed or BIP39 seed words:

```ts
// Create an EscrowSigner using a raw seed.
const signer = EscrowSigner.create(client_config, seed, xpub)

// Import an EscrowSigner using a word list.
const signer = EscrowSigner
  .import(client_config, xpub)
  .from_words(seed_words, optional_password)
```

The `EscrowSigner` is designed to plug into a more basic `SignerAPI` and `WalletAPI`, which can be hosted outside the browser:

```ts
import { Signer, Wallet } from '@cmdcode/signer'
import { EscrowSigner }   from '@scrow/core/client'

// These can be provided externally through
// the browser's global window object.
const signer_api = new Signer({ seed : 'your seed' })
const wallet_api = new Wallet('your_xpub')

const signer_config = {
  ...client_config,
  signer : signer_api,
  wallet : wallet_api
}

const signer = new EscrowSigner(signer_config)
```

The `EscrowSigner` is built for insecure environments. All addresses are derived from the xpub, and all signed transactions are verified before deposit. The signing key has no direct access to funds.

The signing key is also disposable, and can be tossed from memory once the contract and covenant are in place. All credentials generated by the signer are independently recoverable by the xpub.

For more info on the `EscrowSigner` class, [click here](docs/signer.md).

### Build a Proposal

The proposal is a simple JSON document, and it can be built any number of ways.

You can use the `create_proposal` tool to create a basic template:

```ts
import { create_proposal } from '@scrow/core'

// We start with a basic template, and pass it through 
// a helper method to ensure we have the correct format.
const template = create_proposal({
  title    : 'Basic two-party contract with third-party arbitration.',
  expires  : 14400,
  network  : 'signet',
  schedule : [[ 7200, 'close', 'draw' ]],
  value    : 15000,
})

```

To make the negotiation process easier, we have a tool for defining intended `roles` within a proposal:

```ts
// We can define roles that users can choose from. Each role policy 
// instructs a member's device on how to complete the proposal.
const roles = {
  buyer : create_policy({
    paths : [
      [ 'heads', 10000 ],
      [ 'draw',  5000  ]
    ],
    programs : [
      [ 'endorse', 'close',   'heads|tails|draw', 2 ],
      [ 'endorse', 'dispute', 'heads|tails',      1 ]
    ]
  }),
  seller : create_policy({
    paths : [
      [ 'tails', 10000 ],
      [ 'draw',  5000  ]
    ],
    programs : [
      [ 'endorse', 'close',   'heads|tails|draw', 2 ],
      [ 'endorse', 'dispute', 'heads|tails',      1 ]
    ]
  }),
  agent : create_policy({
    payment  : 5000,
    programs : [
      [ 'endorse', 'resolve', 'heads|tails|draw', 1 ]
    ]
  })
}

```

With defined roles, we can invite each `EscrowSigner` to join the proposal as a given role. Members can review the `policy`, and their device will use it to fill out the proposal:

```ts
// Each member is an EscrowSigner object.
const [ a_signer, b_signer, c_signer ] = signers

// Use our template from earlier.
let proposal = template

// Call each signer to join the proposal as a given role.
proposal = a_signer.proposal.join(proposal, roles.buyer)
proposal = b_signer.proposal.join(proposal, roles.seller)
proposal = c_signer.proposal.join(proposal, roles.agent)
```

Once the proposal is completed, any member can deliver it to the escrow server.

**Optional: Endorsing a Proposal**

Members have the option to sign a complete proposal to signal their endorsement:

```ts
const signatures = signers.map(mbr => {
  // Collect an endorsement from the user's signer.
  return mbr.proposal.endorse(proposal)
})
```

Each endorsement provided to the server will tag the proposal with the signer's pubkey. This allows a member to search for contracts via their pubkey.

> Endorsing a proposal does not reveal which credential belongs to you.

For more information on building a `proposal`, [click here](docs/proposal.md).

### Create a Contract

Once you have a complete proposal, the next step is to create a [contract](docs/interfaces/contract.md#contractdata):

```ts
// Request to create a contract from the proposal (and optional signatures).
const res = await client.contract.create(proposal, signatures)
// Check that the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack and return the contract data.
const { contract } = res.data
```

The contract begins in a `published` state, and is ready for funding. You can share the contract with others by advertising its unique identifier, the `cid`.

For more info on how to use a contract, [click here](docs/contract.md).

### Deposit Funds

To make a deposit, we start by requesting a deposit [account](docs/interfaces/deposit.md#depositaccount) from the escrow server:

```ts
// Define our deposit locktime.
const locktime = 60 * 60  // 1 hour locktime
// Get an account request from the signing device.
const acct_req = signer.account.request(locktime)
// Submit the request to the server
const acct_res = await client.deposit.request(acct_req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the account data.
const { account } = res.data
```

Each account is a time-locked 2-of-2 multi-signature address between the funder's signing device, and a random signing `agent` from the server.

It is important that funders verify the account information is correct:

```ts
// Verify the account.
const is_valid = signer.account.verify(account)
if (!is_valid) throw new Error('account is invalid!')
```

After verifying the account, funders can safely send funds to the account address. Once the transaction is visible in the mempool, we can grab the transaction's `utxo` data using an oracle:

```ts
// Unpack the address from the account.
const { address } = account
// Fetch all utxos from the address.
const utxos = await client.oracle.get_address_utxos(address)
// There should be a utxo present.
if (utxos.length === 0) throw new Error('utxo not found')
// Get the output data from the utxo.
const utxo_data = utxos[0].txspend
```

The final step is to register the `utxo` with the escrow server, and provide a `covenant` that locks it to the contract. We can perform both actions using the `commit` method:

```ts
// Create a commit request.
const commit_req = signer.account.commit(account, contract, utxo)
// Deliver the request to the server.
const res = await client.deposit.commit(commit_req)
// Check the response is valid.
if (!res.ok) throw new Error('failed')
// Unpack the response data, which should be the deposit and updated contract.
const { contract, deposit } = res.data
```

> For more info on managing a `deposit`, [click here](docs/deposit.md).

### Settle a Contract

Once all required funds are deposited and confirmed, the contract virtual machine (CVM) will activate.

Members of the contract can interact with the CVM by providing signed statements, called a [witness](./interfaces/witness.md):

```ts
// Start with a witness template.
const template : WitnessTemplate = {
  action : 'close',    // We want to close the contract.
  method : 'endorse',  // Using the 'endorse' (signature) method.
  path   : 'payout'    // Settling on the 'payout' path.
}
```

Members can use their signing device to create a new statement, or endorse an existing statement from another member:

```ts
// Example list of signers.
const [ a_signer, b_signer ] : EscrowSigner[] = signers
// Initialize a variable for our witness data.
let witness : WitnessData
// Alice signs the initial statement.
witness = a_signer.witness.sign(contract, template)
// Bob endoreses the statement from Alice.
witness = b_signer.witness.endorse(contract, witness)
```

These statements are submitted to the contract, and evaluated by the CVM. If the statement is valid, then the CVM will update its [state](docs/interfaces/contract.md#statedata), and the server will deliver an updated contract:

```ts
// Submit the completed statement to the contract.
const res = await client.contract.submit(contract.cid, witness)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// The returned contract should be settled.
const updated_contract = res.data.contract
```

If a spending condition is met within the CVM, the contract will be closed by the escrow server, and a settlement transaction will be broadcast.

The updated contract will record this information under `spent_txid`. We can view the settlement transaction using an oracle:

```ts
// Get the transaction id from the contract.
const txid = settled_contract.spent_txid
// Fetch the settlement tx from the oracle.
const txdata = await client.oracle.get_txdata(txid)
// Print the transaction data to console.
console.dir(txdata, { depth : null })
```

And that is it! The on-chain transaction will look like an anonymous coin-join of single-key spends, and it can be fee-bumped by any recipient of the contract funds using CPFP.

For more information on contracts, the CVM, and settlement process, [click here](docs/contract.md).

## Development / Testing

To get started, make sure you are running `v19+` of node, then install the project dependencies using your node manager of choice:

```sh
node --version  # should be v19+
npm install     # install dependencies
```

This project uses the following scripts:

```md
  build         : Compiles the contents of `src` folder to `dist`. 
  demo <chain>  : Runs the protocol demo for the provided chain.
  load <script> : Load and execute a `.ts` script at the provided path.
  release       : Builds and tests the current source for release.
  scratch       : Executes the `test/scratch.ts` file.
  test          : Runs the current test suite in `test/tape.ts`.
```

### Running the Main Demo

The main demo is located in the [/demo](demo) directory, and serves as a great resource for how to use the client library.

You can choose to run the protocol demo on the `mutiny`, `signet`, or `testnet` blockchain:

```bash
## Run the demo on the mutiny chain.
npm run demo mutiny
```

No wallet or software required[*]. Simply follow the interactive prompts, and enjoy the protocol in action.

> The mutiny chain is the fastest of the three demos, with 30 second blocks.

> [*] Testnet faucet is currently broke. You may need your own testnet coins.

### Running in Replit

There is a replit clone of this repo that you can run in the browser:

[https://replit.com/escrow-core](https://replit.com/@cscottdev/escrow-core)

Clicking `Run` at the top of the replit should run the demo.

Feel free to fork the replit and try out the developer tools!

### Using the Client API Demos

There is a suite of client API examples located in the [/demo/api](demo/api) directory.

Feel free to use `npm run load` to execute any of the example scripts:

```bash
npm run load demo/api/contract/read.ts
```

More examples are being added. Work in progress!

### Using the CVM Evaluation Tool

The CVM [eval](demo/vm/eval.ts) tool allows you to quickly evaluate a set of proposal terms and witness statements using a dummy virtual machine.

The tool uses an easy to read [JSON file](demo/vm/vector.json) to load the data. This file can be re-written to demonstrate any contract scenario you wish.

```
npm run demo:vm
```

The tool and JSON file are located in the [/demo/vm](demo/vm) directory.

### Using the Test Suite

The test suite is located in [test/src](test/src), and controlled by the [test/tape.ts](test/tape.ts) file. Feel free to add/remove test packages from the main test method.

Some tests come with a verbose output, which you can enable with the `VERBOSE=true` flag.

Example of running the current test suite in verbose mode:

```bash
VERBOSE=true npm run test
```

### OpenAPI Specification

There is an [OpenAPI 3.1](https://swagger.io/specification) specification file located at the root of this repo, named [spec.yml](spec.yml).

You can use this file to demo our API within `Postman`, `Insomnia`, or your API tool of choice.

Please stay tuned for more documentation and updates!

## Questions / Issues

Feel free to post questions or comments on the issue board. All feedback is welcome.

## Contribution

Help wanted. All contributions are welcome!

## Resources

Nearly the entire code-base has been built from scratch, with only one hard third-party dependency and a couple soft dependencies.

**noble-curves**  

Best damn elliptic curve library. Lightweight, independently audited, optimized to hell and back. Works across all platforms. Even deals with the nightmare that is webcrypo. There is no second best. Credit to Paul Miller.

https://github.com/paulmillr/noble-curves  

**noble-hashes**  

Paul's hashing library is also great, and performs synchronous operations. Credit to Paul Miller.

https://github.com/paulmillr/noble-hashes  

**zod**  

The best run-time validation library, also the best API of any method library. Turns javascript into a some-what respectable language. The error output can be the stuff of nightmares though. Credit to Colin McDonnel.

https://github.com/colinhacks/zod  

**tapscript**  

My humble taproot library and grab-bag of bitcoin related tools. Currently using a development version that has yet-to-be released due to undocumented changes in the API. 

https://github.com/cmdruid/tapscript  

**musig2**  

Reference implementation of the Musig2 protocol with a few additional features. However I do not implement the death star optimization.

https://github.com/cmdruid/musig2  

**crypto tools**  

Provides a suite of cryptography primitives and tools. Wraps the noble-curve and noble-hash libraries (and cross-checks them with other implementations).

https://github.com/cmdruid/crypto-tools  

**buff**  

The swiss-army-knife of byte manipulation. Such a fantastic and invaluable tool. Never leave home without it.

https://github.com/cmdruid/buff  

**core command**  

Not a run-time dependency, but I use this to incorporate bitcoin core directly into my test suite. I also use it to mock-up core as a poor-man's electrum server. Acts as a daemon wrapper and CLI tool, provides a full wallet API, faucets, and can run bitcoin core natively within a nodejs environment (which is pretty wild).

https://github.com/cmdruid/core-cmd  

**signer**  

Reference implementation of the new hybrid signing device / wallet we are building for BitEscrow. The documentation needs to be updated. WIP.

https://github.com/cmdruid/signer  

# Footnote

My inspiration for this project comes from the Bitcoin space, and the incredibly talented people that contribute. I will be forever grateful for their knowledge, kindness and spirit.

I wish for Bitcoin to win all the marbles; and be the new global reserve marbles that we fight over. I firmly believe a better money system will make the world a better place. Maybe we will reach beyond the moon.
