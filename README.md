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

`Members` : The participating members of the contract.  
`Funders` : Those funding the contract (whom may be members).  
`Server ` : The escrow server hosting the contract (BitEscrow API).

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

> Note: The escrow server does not take part in negotiations. While BitEscrow may offer these services, the protocol is designed so that members and third-parties can negotiate freely, without the server being involved.

### Funding

Once a final proposal has been delivered to the server, the terms and endorsements are validated, then an open [contract](docs/contract.md) is published.

To deposit funds, each funder requests a deposit [account](docs/deposit.md) from the server. This account uses a 2-of-2 multi-signature address with a time-locked refund path.

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

The funder verifies the account information, then sends their funds to the address. This is the most critical step the protocol, as the transfer of funds commits to the xpub being used. Make sure that the xpub is correct!

Once the transaction is visible in the mempool, the funder can register the deposit on the escrow server, and commit the funds to a contract using a partially-signed [covenant](docs/deposit.md):

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

These partial signatures pre-authorize the spending of the deposit, and are constructed based on the contract terms.

Once a covenant is made, the deposit is locked in escrow. When enough funds have been locked and confirmed, the contract becomes active.

### Settlement

The final round of the protocol is the `settlement`. This is the most exciting round, as members get to deliberate over how the money shall be spent.

When the contract is activated, a virtual machine is started. This vm is initialized using the `paths`, `programs`, and `tasks` specified in the proposal, along with the contract id:

```ts
vm_state: {
  commits  : [],
  error    : null,
  head     : 'b70704c41e27d5f35a11ae7c6e5976501aa1380195714007197d7f47934dcf69',
  output   : null,
  paths    : [ [ 'draw', 0 ], [ 'heads', 0 ], [ 'tails', 0 ] ],
  programs : [
    [
      '054fef5ba39416260ea4b48e9c557ee7e45d780d04b28e094d110459b971b78b',
      'endorse',
      'close',
      'heads|tails|draw',
      2,
      'effe19ba82f5451739b1d3471dae675c476147bab74e6654f1aaba82e2d96d9f',
      'f1b1d3a097db6acb76e9296e1e41db169a781813301b4853207ee3b6e39c72b9'
    ],
    [
      'cf236c4e91678bddaaa482d41720f277bb7d2e4540a0fc47736b999a54d29e39',
      'endorse',
      'dispute',
      'heads|tails',
      1,
      'effe19ba82f5451739b1d3471dae675c476147bab74e6654f1aaba82e2d96d9f',
      'f1b1d3a097db6acb76e9296e1e41db169a781813301b4853207ee3b6e39c72b9'
    ],
    [
      'e7862cbeb981d295639af3e91661fc96e0f97b429e9ff2985d20a654667d167a',
      'endorse',
      'resolve',
      'heads|tails|draw',
      1,
      'bbcd74c7c9a1a9d30ac3f2acbc55bae1ba2b5c76f93eb335f2a4478b61fed189'
    ]
  ],
  start : 1706511301,
  steps : 0,
  store : [
    [
      '054fef5ba39416260ea4b48e9c557ee7e45d780d04b28e094d110459b971b78b',
      '[]'
    ],
    [
      'cf236c4e91678bddaaa482d41720f277bb7d2e4540a0fc47736b999a54d29e39',
      '[]'
    ],
    [
      'e7862cbeb981d295639af3e91661fc96e0f97b429e9ff2985d20a654667d167a',
      '[]'
    ]
  ],
  status  : 'init',
  tasks   : [ [ 7200, 'close', 'draw' ] ],
  updated : 1706511301
}
```

Members of the contract interact with this vm by submitting signed statements, called a [witness](docs/contract.md):

```ts
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

Members can instruct the vm to settle on a given path, or lock, unlock, and dispute paths. Each statement that updates the vm is recorded into a hash-chain. This chain validates the full execution history of the vm, from activation to settlement:

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

Once the vm has settled on a spending path, the server will complete the related signatute for each deposit, then broadcast a final transaction to close the contract.

The proposal, covenants, statements, and commit history all combine to create a fully-auditable proof of execution for the contract. This proof covers how the contract should execute at any moment, with zero ambiguity.

Every contract settled on mainnet will be backed by a valid proof of execution in order to maintain our reputation as an escrow server.

### Protocol Flow

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

For a complete list of the `EscrowClient` API, [click here](docs/client.md).

### Create a Signer

The `EscrowSigner` is used to represent a member of a contract, and perform signature operations on their behalf. The fastest way to setup a new signer is to generate one randomly:

```ts
import { EscrowSigner } from '@scrow/core/client'

// Generate a new EscrowSigner from scratch.
const signer = EscrowSigner.generate(client_config, xpub)
```

You can also create a signer using BIP39 seed words.

```ts
const words = [ 'your', 'bip39', 'seed', 'words' ]
const pass  = 'optional BIP39 password'
const xpub  = 'your xpub goes here'

// Create an EscrowSigner using the above config.
const signer = EscrowSigner
  .import(client_config, xpub)
  .from_words(words, pass)
```

The `EscrowSigner` is designed to plug into a more basic `SignerAPI` and `WalletAPI` which can be hosted outside the browser, such as an extension or external software application.

```ts
import { Signer, Wallet } from '@cmdcode/signer'
import { EscrowSigner }   from '@scrow/core/client'

// These are created outside the browser, and can be
// provided through the browser window object.
const signer_api = new Signer({ seed : 'your seed' })
const wallet_api = new Wallet('your_xpub')

const signer_config = {
  ...client_config,
  signer : signer_api,
  wallet : wallet_api
}

const signer = new EscrowSigner(signer_config)
```

The `EscrowSigner` is built for insecure environments. Addresses are generated by the xpub, and all transactions are signed and verified before deposit. The signing key has no direct access to funds.

The signing key is also disposable, and can be tossed from memory once the funding transactions have been signed. Credentials generated by the signer are independently recoverable by the xpub.

For a complete list of the `EscrowSigner` API, [click here](docs/signer.md).

### Build a Proposal

The proposal can be built any number of ways. We have provided some tools to make this process easier, through the use of `roles`:

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

// We can create roles for users to choose from. Each policy 
// defines what information is needed for a given role.
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

After the template and roles are defined, we can invite each `EscrowSigner` to join the proposal as a given role. This allows the user to review the details before adding their credentials to the proposal.

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

When the proposal is completed, signers can optionally provide a signature as proof of their endorsement. This also tags the proposal with your signer pubkey for future lookups, without revealing which credential is yours.

```ts
const signatures = signers.map(mbr => {
  // Collect an endorsement from the user's signer.
  return mbr.proposal.endorse(proposal)
})
```

For more information on building a `proposal`, [click here](docs/proposal.md).

### Create a Contract

Once you have a complete proposal, it is easy to convert into a contract.

```ts
// Request to create a contract from the proposal (and optional signatures).
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
// Get an account request from the signing device.
const acct_req = funder.deposit.request_account(locktime)
// Submit the account request to the server
const acct_res = await client.deposit.request(acct_req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the account data.
const { account } = res.data
// Verify the account.
funder.deposit.verify_account(account)
```

> For more information on the `account` interface, [click here](docs/deposit.md).

### Deposit funds into a Contract

After verifying the account information, funders can safely make a deposit to the account address. Once the deposit transaction is visible in the mempool, we can grab the `utxo` data using an oracle.

Deposits must first be registered before they can be locked to a contract. The API allows us to perform each action separately, or both at once.

In the example below, we will register and commit a utxo to the contract using the `fund` API.

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

The contract will activate once all the required funds are deposited and confirmed on the blockchain.

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

### Settle a Contract

Once the contract is active, members can start submitting their statements to the contract's virtual machine (CVM).

```ts
// The members we will be using to sign.
const [ a_signer, b_signer ] = signers
```

The default method for taking actions in the CVM is the `endorse` method, which accepts a threshold of signatures from members.

```ts
// The template statement we will be signing.
const template = {
  action : 'close',    // We want to close the contract. 
  method : 'endorse',  // Using the endorse method.
  path   : 'tails'     // And settle on the 'tails' path.
}
```

Each member can use their `EscrowSigner` to create and sign a statement, or to sign another member's statement.

```ts
// We are working with the active contract from earlier.
const contract = active_contract
// Define an empty variable for our "witness" statement.
let witness : WitnessData
// Alice provides the initial statement.
witness = a_signer.witness.sign(contract, template)
// Bob endoreses the statement from Alice.
witness = b_signer.witness.endorse(contract, witness)
```

Once we have a statement with enough signatures, we submit it to the contract for evaluation.

```ts
// Submit the completed statement to the contract.
const res = await client.contract.submit(contract.cid, witness)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// The returned contract should be settled.
const settled_contract = res.data.contract
```

If the statement is valid, then the contract will broadcast a settlement transaction.

```ts
// Get the transaction id from the contract.
const txid = settled_contract.spent_txid
// Fetch the settlement tx from the oracle.
const txdata = await client.oracle.get_txdata(txid)
// Print the transaction data to console.
console.dir(txdata, { depth : null })
```

And that is it! The transaction will display on-chain as an anonymous coinjoin of single-key spends, and can be fee-bumped by any recipient of the contract using CPFP.

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
