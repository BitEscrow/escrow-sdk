[![Integration Tests](https://github.com/BitEscrow/escrow-core/actions/workflows/integration.yml/badge.svg?branch=master)](https://github.com/BitEscrow/escrow-core/actions/workflows/integration.yml)

# escrow-core

A private, non-custodial protocol for using Bitcoin in a covenant-based smart contract.

Key Features:

  * __100% private.__ All on-chain transactions appear as single-key spends. Participation is done through randomly generated credentials. Only requires a signing key (hot), and wallet xpub (cold) to participate.

  * __100% non-custodial.__ Money is secured in a collaborative 2-of-2 contract. All payouts are pre-signed before deposit. Returns are locked to a cold-stored xpub of your choice.

  * __100% auditable.__ All contract terms, inputs, and operations are signed and recorded in a commit chain. Each transaction is backed by a verifiable commit history.

  * __Designed for trustless environments.__ Signing keys are disposable and have no capacity to sweep funds. All terms are signed up-front and verifiable before deposit. 

  * __Designed to be robust.__ Deposits can be re-used if a contract cancels or expires. Credentials are recoverable via your xpub. Refunds are signed upfront and broadcast automatically on expiration. 

Package Features:

  * Method libraries for every part of the protocol.
  * Multi-platform client with minimal dependencies.
  * Run-time schema validation (using zod).
  * E2E demo and test suite for signet, testnet, and mutiny.

Comimg Soon:

  * Return receipts on witness submission.
  * Improved code comments and documentation.
  * new `templates` field for raw tx templates.
  * `hashlock` and `oracle` programs for vm.

## Overview

The protocol involves collaboration between three parties:

```md
**Members** : The participating members of the contract.  
**Funders** : Those funding the contract (whom may be members).  
**Agent**   : The server agent hosting the escrow contract (BitEscrow API).
```

The protocol is split into three phases: `negotiation`, `funding`, and `settlement`. Each phase represents a round of communication in the protocol.

### Negotiation

The members must first negotiate and agree on a [proposal](docs/proposal.md) document. This is a human-readable document which contains all of the terms of the contract. It is written in JSON format, and designed for collaboration (much like a PSBT).

```ts
{
  title    : 'Basic two-party contract with third-party dispute resolution.',
  content  : '{}',
  expires  : 14400,
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

If desired, a third-party can host the proposal. The protocol is designed for third-parties to help with negotiation, and offer their own services such as arbitration.

There is no specification placed on how to communicate the proposal between parties. There are many great protocols available, so feel free to use your favorite one!

> Note: The server agent does not take part in negotiations. While BitEscrow may offer these services, the protocol is designed so that members and third-parties can negotiate freely, without the agent being involved.

### Funding

Once a final proposal has been delivered to our server, we will validate the terms (plus any endorsements), then publish an open [contract](docs/contract.md). This contract is also assigned an [agent](docs/contract.md) for coordinating deposits.

To deposit funds, each funder requests a deposit [account](docs/deposit.md) from the agent. This account uses a 2-of-2 multi-signature address with a time-locked refund path.

```ts
interface DepositAccount {
  acct_id    : string  // Hash identifer for the account record.
  acct_sig   : string  // Signature for the account record.
  address    : string  // On-chain address for receiving funds.
  agent_id   : string  // Identifier of the deposit agent.
  agent_pk   : string  // Public key of the deposit agent.
  created_at : number  // Account creation timestamp (in seconds).
  deposit_pk : string  // Public key of the funder making the deposit.
  sequence   : number  // Locktime converted into a sequence value.
  spend_xpub : string  // The extended key used for returning funds.
}
```

The funder verifies the account, then transfers funds to the address. Once the transaction is visible in the mempool, the funder delivers a pre-signed refund transaction to the agent, plus a batch of partial signatures (for each spending path in the contract). These partial signatures form a [covenant](docs/deposit.md) between their deposit and the contract.

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

The final round of the protocol is the `settlement`. This is the most exciting round, as members of the contract get to debate over how the money shall be spent.

When the contract becomes active, a virtual machine is started within the contract. This vm includes the `paths`, `programs`, and `tasks` specified in the proposal.

```ts
{
  commits: [],
  error  : null,
  head   : '21b8d90a9d5d249518f3b18a7d206a9f93a9745531f6e54a8813938f7fad42af',
  output : null,
  paths  : [ [ 'heads', 0 ], [ 'draw', 0 ], [ 'tails', 0 ] ],
  programs: [
    [
      'ac5c38273690b4c5d970b7075fcb65c59a19418884eca43e888fad969e122954',
      'endorse',
      'close',
      'heads|tails',
      2,
      '08a053368720d0c9d91cb2ff2ba574fe41430bf29fd6bf2e84362354e26dde99',
      '48ac68e8df9add2805d4e5379c12325bc518ec0c9592058b8636ebe28ce8c604'
    ],
    [
      '0b4eb344d2824e1f0c0df2a16f312437528a49675844d7827df26b35d0da08ea',
      'endorse',
      'dispute',
      'heads|tails',
      1,
      '08a053368720d0c9d91cb2ff2ba574fe41430bf29fd6bf2e84362354e26dde99',
      '48ac68e8df9add2805d4e5379c12325bc518ec0c9592058b8636ebe28ce8c604'
    ],
    [
      '65c1d6527d20713e7c16c6d4462a0885bf1a678e294426a6a20385227d81fdee',
      'endorse',
      'resolve',
      'heads|tails',
      1,
      '36e7977d0323bbf0aeed50c8f5823c80125c7d77c742bd9a62da98e30193f1b2'
    ]
  ],
  start: 1705815394,
  steps: 0,
  store: [
    [ 'ac5c38273690b4c5d970b7075fcb65c59a19418884eca43e888fad969e122954', '[]' ],
    [ '0b4eb344d2824e1f0c0df2a16f312437528a49675844d7827df26b35d0da08ea', '[]' ],
    [ '65c1d6527d20713e7c16c6d4462a0885bf1a678e294426a6a20385227d81fdee', '[]' ]
  ],
  status: 'init',
  tasks: [ [ 7200, 'close', 'draw' ] ],
  updated: 1705815394
}
```

Members of the contract interact with this vm by submitting signed statements to the agent, called a [witness](docs/contract.md) statement:

```ts
{
  action  : 'close',
  args    : [],
  method  : 'endorse',
  path    : 'tails',
  prog_id : 'ac5c38273690b4c5d970b7075fcb65c59a19418884eca43e888fad969e122954',
  sigs    : [
    '08a053368720d0c9d91cb2ff2ba574fe41430bf29fd6bf2e84362354e26dde997bd992345fdd377d1622c659450b9ee1fd05da039a3bb6b55a3e32cf353150daa4c69c57a508d648e9119b39ae0c954f5fe2368b1770b52300d23deeaac298da',
    '48ac68e8df9add2805d4e5379c12325bc518ec0c9592058b8636ebe28ce8c604d6946b5707550ff0e058196c3506872e722a6f30a2d8095817d2418b1617626e807cb11de648375ad0f38b08da0b6580ceb549aa2fe7d9eb96d4728f19875fdc'
  ],
  stamp   : 1705815394,
  wid     : '46609fd312fb162b530d2dd562f9b946d73192c21df35e27f380bf96110efb02'
}
```

Members can instruct the vm to settle on a spending path, or lock, unlock, and dispute paths. Each statement that updates the vm is recorded into a hash-chain. This chain validates the full history of the vm, from activation to settlement.

Once the vm has settled on a spending path, the agent will complete the relevant signature from each covenant, then broadcast a final transaction to close the contract.

The proposal, covenants, and vm combine to create a proof of validity. This proof covers how the contract should execute at any moment, with zero ambiguity left to the agent.

Every contract settled on mainnet will be backed by a valid proof to maintain our reputation.

### Protocol Flow

> **Scenario**: Sales agreement between a buyer (alice) and seller (bob) with third-party (carol) arbitration.

  1. Alice and Bob prepare a proposal, and agree on terms / arbitration.
  2. Alice submits the proposal to the agent and receives a contract.
  3. Alice deposits her funds with the contract agent, along with a covenant.
  4. Once the deposit is confirmed on-chain, the contract becomes active.
  
  **Happy Path: Settle on Payout**
  * Alice receives her widget and forgets about Bob.
  * The contract schedule closes automatically on 'payout'.
  * Bob gets the funds, Alice can verify the CVM execution.

  **Neutral Path: Settle on Refund**
  * Alice doesn't like her widget.
  * Alice and Bob both agree to sign the 'refund' path.
  * Alice gets a partial refund, Bob still keeps his fees.

  **Unhappy Path: Dispute Settlement**
  * Alice didn't get the right widget, and disputes the payout.
  * Carol now has authority to settle the contract.
  * Carol decides on the 'refund' path.
  * Alice gets a partial refund, Bob still keeps his fees.

  **Ugly Path: Contract Expires**
  * Alice claims she didn't get a widget, and disputes the payout.
  * Carol is on a two-week cruise in the bahamas.
  * The proposal did not include any auto-settlement terms.
  * The contract expires, all deposits are released.

  **Worst Path: Deposits Expire**
  * Everything above happens, except the last part.
  * The entire escrow platform goes down in flames.
  * The timelock on deposits eventually expire.
  * Alice can sweep back her funds using the refund path.

### Security Model

A brief description of the security model:

  * Each member joins the proposal using an anonymous credential. The involvement of a credential can be independently verified without revealing the owner to the agent.
  
  * Members decide the terms of the proposal, and all spending paths. The contract agent does not get involved until the proposal terms have already been finalized.

  * Each member can optionally sign the proposal terms, if they wish to publicize their involvement. This does not reveal their credential in the proposal.

  * Funders ultimately decide on what transactions to sign and deliver to the agent. If there's a disagreement, funders can back out of a deposit.

  * The contract agent cannot link depositors to members, nor members to credentials.

  * The contract agent can only settle via transactions provided by funders.
  
  * All parites independently verify the progression of the contract and final settlement. If an agent settles the contract without publicizing a valid proof, their reputation is burned.

Some challenges with the current model:

  * The agent has limited opportunity to censor members of a contract by ignoring their witness statements. In the short term, we plan to mitigate this using signed delivery receipts. In the long-term, we will support alternative platforms for publishing (such as nostr).

  * Even with the covenant restrictions, the burning of reputation may not be considered strong enough incentive. We are exploring additional options, such as the agent staking collateral.

In terms of security, speed, and simplicity, we believe this is the best non-custodial solution for providing programmable escrow contracts on Bitcoin.

## How to Use

Below is a step-by-step guide through the protocol. This guide follows a live demo that you can run yourself. To run the demo, simply clone this repository, then run the following commands:

```sh
npm install           # Install all package dependencies.
npm run demo {chain}  # Run the demo using the selected chain.
```

> Note: The current chains available are `mutiny`, `signet`, and `testnet`. The default chain is `mutiny`.

Read more info about the demo [here](demo/README.md).

### Create a Client

The `EscrowClient` is a basic client for consuming our API. It is designed to be used for any tasks which do not require an identity or signature.

```ts
import { EscrowClient } from '@scrow/core/client'

const config = {
  // The URL to our escrow server.
  hostname : 'https://bitescrow-signet.vercel.app',
  // The URL to an electrum-based indexer of your choice.
  oracle   : 'https://mempool.space/signet',
  // The network you are using.
  network  : 'signet'
}
// Create an EscrowClient using the above config.
const client = new EscrowClient(config)
```

For a complete list of the `EscrowClient` API, [click here](docs/client.md).

### Create a Signer

The `EscrowSigner` is used to represent a member of a contract, and perform signature operations on their behalf.

It is designed to wrap a more basic `Signer` and `Wallet` API, which can be provided by an external software or hardware device for added security.

By default, we provide a basic software implementation of the `Signer` and `Wallet`, plus a `Seed` utility for generating or importing seed material.

```ts
import { Seed, Signer, Wallet } from '@cmdcode/signer'
import { EscrowSigner }         from '@scrow/core/client'

// Import a seed using BIP39 seed words.
const seed = Seed.import.from_words(user_words)

// We can specify a pubkey that belongs to the escrow
// server, to verify any signed payloads from the server.
const host_pubkey = '31c82c5c86465b22adaa5e57a85593a7741eddc75f3699cc415af72c0dd13efd',

// We'll use the existing configuration for the client,
// plus include our Signer and Wallet interfaces.
const signer_config = {
  ...config,
  host_pubkey,
  signer : new Signer({ seed }),
  wallet : new Wallet(xpub)
}

// Create an EscrowSigner using the above config.
const signer = new EscrowSigner(signer_config)
```

The `EscrowSigner` is designed to run in insecure environments. The `Signer` handles money flowing into a contract (via a 2-of-2 account), while the `Wallet` handles money flowing out (by generating addresses).

The private key for the `Signer` can be considered disposable, as any credential generated by the signer can be recovered by the `Wallet`.

The `Wallet` is created using an xpub (provided by the user), so the private key for the wallet is never exposed during the escrow process.

For a complete list of the `EscrowSigner` API, [click here](docs/signer.md).

### Build a Proposal

A proposal can be built any number of ways. We have provided some tools to make this drafting process easier, through the use of a `template` and `roles`.

```ts
import { create_policy, create_proposal } from '@scrow/core'

// We start with a basic template, and pass it through 
// a helper method to ensure we have the correct format.
const template = create_proposal({
  title    : 'Basic two-party contract with third-party arbitration.',
  expires  : 14400,
  network  : 'signet',
  schedule : [[ 7200, 'close', 'draw' ]],
  value    : 15000,
})

// We can create a dictionary of roles for users to choose from.
// Each policy defines what information needs to be added to the
// proposal for a given role.
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

For more information building a `proposal`, [click here](docs/proposal.md).

### Roles and Endorsements

After the template and roles are defined, we can invite each `EscrowSigner` to join the proposal under a given role. This process allows the user to review the role information, before adding their credentials to the proposal.

When the proposal is completed, users can optionally provide a signature as proof of their endorsement of the terms.

```ts
// Each member is an EscrowSigner object.
const [ a_signer, b_signer, c_signer ] = signers
// Define our template from earlier.
let proposal = template

// Call each EscrowSigner to join the proposal as a given role.
proposal = a_signer.proposal.join(proposal, roles.buyer)
proposal = b_signer.proposal.join(proposal, roles.seller)
proposal = c_signer.proposal.join(proposal, roles.agent)

const signatures = signers.map(mbr => {
  // Collect an endorsement from the user's signer.
  return mbr.proposal.endorse(proposal)
})
```

### Create a Contract

Once we have collected a complete proposal, it is easy to convert into a contract via our API.

```ts
// Request to create a contract using the proposal and optional signatures.
const res = await client.contract.create(proposal, signatures)
// Check that the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack and return the contract data.
const { contract } = res.data
```

For more information on the `contract` interface, [click here](docs/contract.md).

### Request a Deposit Account

Before making a deposit, we have to request an account from the escrow server. Each account is a time-locked 2-of-2 multi-signature address between the `funder` and the server `agent`.

```ts
// Define our deposit locktime.
const locktime = 60 * 60  // 1 hour locktime
// Define our funder for the deposit.
const funder   = signers[0]
// Get an account request from the funder device.
const acct_req = funder.deposit.request_account(locktime)
// Submit the account request to the server
const acct_res = await client.deposit.request(acct_req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the account data.
const { account } = res.data
// Verify the account issued by the escrow server.
funder.deposit.verify_account(account)
```

> For more information on the `account` interface, [click here](docs/deposit.md).

### Deposit funds into a Contract

After verifying the account information, funders can safely make a deposit to the account address. Once the deposit transaction is visible in the mempool, we can grab the `utxo` data using an oracle.

Deposits must first be registered before they can be locked to a contract. The API allows us to perform each action separately, or both at once.

In the example below, we will register and commit the utxo to the contract using the `fund` API.

```ts
// Unpack the address and agent_id from the account.
const { address, agent_id } = account
// Fetch our utxo from the address.
const utxos = await client.oracle.get_address_utxos(address)
// There should be at least one utxo present.
if (utxos.length === 0) throw new Error('utxo not found')
// Get the output data from the utxo.
const utxo     = utxos[0].txspend
// Request the funders device to sign a covenant.
const covenant = signer.deposit.commit_utxo(account, contract, utxo)
// Build our registration request to the server.
const reg_req  = { covenant, deposit_pk, sequence, spend_xpub, utxo }
// Deliver our registration request to the server.
const res = await client.deposit.fund(reg_req)
// Check the response is valid.
if (!res.ok) throw new Error('failed')
// Unpack the response data, which should be the deposit and updated contract.
const { contract, deposit } = res.data
```

> For more information on the `deposit` interface, [click here](docs/deposit.md).

### Contract Activation

The contract will not activate until all the required funds are deposited and confirmed on the blockchain.

You can use the `EscrowClient` to poll the contract endpoint periodically. Once the confirmed `balance` matches or exceeds the `total` value, the contract will activate automatically.

```ts
// Call the contract endpoint (via the cid).
const res = await client.contract.read(cid)
// Check that the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the response data.
const { contract } = res.data
// View the funding status of the contract.
console.log('balance :', contract.balance)
console.log('pending :', contract.pending)
console.log('total   :', contract.total)
// Check if the contract is active.
if (contract.activated === null) {
  throw new Error('contract is not active')
}
```

Once the contract is active, members can start submitting their statements to the virtual machine (CVM).

### Settle a Contract

Members can use their `EscrowSigner` to create a signed statement for the CVM, or endorse another member's statement.

The default method for taking actions in the CVM is the `endorse` method, which accepts a threshold of digital signatures from members.

In the below example, we will be using `endorse` method to create a signed statement, then collect additional signatures from other members.

```ts
// The members we will be using to sign.
const [ a_signer, b_signer ] = signers
// The template statement we will be signing.
const template = {
  action : 'close',    // We want to close the contract. 
  method : 'endorse',  // Using the endorse method.
  path   : 'tails'     // Using the provided path.
}
// Define we are working with the active contract from earlier.
const contract = active_contract
// Define an empty variable for our "witness" statement.
let witness : WitnessData
// Alice create and signs the initial statement.
witness = a_signer.witness.sign(contract, template)
// Bob endoreses the statement from Alice.
witness = b_signer.witness.endorse(contract, witness)
// Submit the completed witness statement to the contract.
const res = await client.contract.submit(contract.cid, witness)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// The returned contract should be settled.
const settled_contract = res.data.contract
// Fetch the settlement tx from the oracle.
const txdata = await client.oracle.get_txdata(settled_contract.spent_txid)
// Print the transaction data to console.
console.dir(txdata, { depth : null })
```

> For more information on the `witness` interface, [click here](docs/witness.md).

## Development / Testing

To get started, make sureyou are running `v19+` of node, then install the project dependencies using your node manager of choice:

```sh
node --version  # should be v19+
npm install     # install dependencies
```

This project uses the following scripts:

```md
  build         : Compiles the contents of `src` folder to `dist`. 
  demo <chain>  : Runs the protocol demo for the provided chain.
  load <script> : Executes the script at the provided path.
  release       : Builds and tests the current source for release.
  scratch       : Executes the `test/scratch.ts` file.
  test          : Runs the current test suite in `test/tape.ts`.
```

Example of running the demo on the mutiny chain (using npm):

```bash
npm run demo mutiny
```

> The available test chains are mutiny, signet, and testnet.

Example of running the current test suite in verbose mode:

```bash
VERBOSE=true npm run test
```

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
