[![Integration Tests](https://github.com/BitEscrow/escrow-core/actions/workflows/integration.yml/badge.svg?branch=master)](https://github.com/BitEscrow/escrow-core/actions/workflows/integration.yml)

# escrow-core

A secure, private protocol for locking Bitcoin into a smart contract, with non-custodial escrow of funds.

> If you are looking to use the BitEscrow API, check out our [Developer Documentation](https://bitescrow.dev) resources and [Replit Container](https://replit.com/@cscottdev/escrow-core).

Key Features:

  * __100% private.__ Users only need a random signing key (hot), and wallet xpub (cold) to participate. All on-chain transactions are script-less key spends. No meta-data is exposed.

  * __100% auditable.__ All contract operations are committed into a hash-chain, signed by the escrow agent, and provided as receipt. All contract execution is independently verifiable.

  * __100% non-custodial.__ Money is secured in a time-locked 2-of-2 contract that returns to sender. All spending transactions are signed up-front. The escrow agent has zero discretion over spending.

  * __Designed for trustless environments.__ Signing keys are separated from address generation, with zero capacity to sweep funds. Keys can be made ephemeral, and recoverable from the user's xpub.

  * __Designed to be robust.__ Deposits can be reused whenever a contract cancels or expires. Refund transactions are secured upfront and broadcast automatically on expiration.

Package Features:

  * Full suite of methods and tools for every part of the protocol.
  * A multi-platform client and signing device with minimal dependencies.
  * Strict type interfaces, plus run-time schema validation (using zod).
  * E2E demo and test suite for signet, testnet, and mutiny networks.

Roadmap:

  * Direct integration with the Nostr network for message delivery.
  * Layer-2 deposits with adjustable balance and no timeout.
  * New `hashlock` and `webhook` programs for the virtual machine.
  * Support for running a federation of escrow servers (via FROST).

---

## Index

1. [Protocol Overview](#protocol-overview)  
  a. [Negotiation](#negotiation)  
  b. [Funding](#funding)  
  c. [Covenant](#covenant)  
  d. [Execution](#execution)  
  e. [Settlement](#settlement)  
  f. [Protocol Flow](#protocol-flow)  
  g. [Security Model](#security-model)  
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

---

## Protocol Overview

This SDK implements a trust-less protocol for locking Bitcoin in escrow, without requiring a custodian for the funds. Instead, the funds are deposited into a smart contract on the Bitcoin block-chain, with a chosen escrow agent listed as a co-signer.

The complete protocol involves three rounds of communication, split between three parties:

`Members` : Those participating within the contract.
`Funders` : Those depositing funds into the contract.
`Server`  : The server co-signing on deposits (i.e BitEscrow).

The three rounds of communication are _negotiation_, _funding_, and _execution_.

---

### Negotiation

The first step is to negotiate and agree on a [proposal](data/draft.md#proposaldata) document. This is a human-readable document which contains all of the initial terms of the contract.

It is written in JSON format, and designed for collaboration (much like a PSBT):

```ts
{
  title    : 'Basic two-party contract with third-party dispute resolution.',
  content  : '{}',
  duration : 14400,  // 4 hours.
  engine   : 'cvm',  // Default interpreter, provides basic features.
  network  : 'regtest',
  paths: [
    [ 'payout', 90000, 'bcrt1qhlm6uva0q2m5dq4kjd9uzsankkxe9pza5uylcs' ],
    [ 'return', 90000, 'bcrt1qemwtdfh9uncvw7jlq4ux7p7stl9lgvfxa8t05g' ]
  ],
  payments : [[ 10000, 'bcrt1qxemag7t72rlrhl2ezsnsprmunmnzc35nmaph6v' ]],
  programs : [
    [ 'endorse', 'dispute',       '*', 1, '9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be' ],
    [ 'endorse', 'resolve',       '*', 1, '9094567ba7245794198952f68e5723ac5866ad2f67dd97223db40e14c15b092e' ],
    [ 'endorse', 'close|resolve', '*', 2, 
      '9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be',
      '4edfcf9dfe6c0b5c83d1ab3f78d1b39a46ebac6798e08e19761f5ed89ec83c10'
    ]
  ],
  schedule : [[ 7200, 'close', 'payout|return' ]],
  value    : 100000,
  version  : 1
}
```

The interface for a smart-contract can be defined through the use of `programs`. Each program describes a way to interact with the smart contract, plus additional terms and restrictions.

The `engine` field defines the interpreter that will be used to evaluate the smart contract, while the `schedule` field defines which actions will happen over time.

> The Proposal API is designed to interface with and support any kind of smart-contract system.

You can share this document peer-to-peer, or use a third-party for collaboration. Third-party platforms may assist with negotiation and offer their own services (such as arbitration).

Once the terms have been decided, any party can deliver the final proposal to the escrow server. The server will validate the proposal, then publish an open [contract](wiki/contract.md) for funding.

> Note: The escrow server does not take part in negotiations. While BitEscrow may offer these services, the protocol is designed so that members can negotiate freely, without the escrow server being involved.

---

### Funding

To deposit funds into a contract, each funder requests a [Deposit Account](data/deposit.md#depositaccount) from the escrow server. This account sets up a 2-of-2 multi-signature address, with a time-locked return path for the funder.

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

The funder independently verifies this information, then sends their funds to the account address. Once the transaction is available in the mempool, the funder can register their deposit with the server.

### Covenant

To commit funds to a contract, the funder must produce a signature for each spending requirement in the contract. These signatures are tweaked with the contract terms, then delivered to the escrow agent.

This batch of tweaked signatures forms a [Covenant](data/deposit.md#covenantdata) between the deposit and contract. The escrow server must explicitly agree to this contract (by reciprocating the tweak) in order to co-sign a transaction and spend the funds.

```ts
interface CovenantData {
  cid    : string  // Id of the contract you are signing for.
  pnonce : string  // Public nonce of the signer.
  // List of labeled partial signatures for the covenant.
  psigs  : [ label : string, psig : string ][]
}
```

A covenant may be provided during the registration of a deposit, or at a later time. Once a covenant is made, the funds are considered locked to the contract. When enough funds have been confirmed, the contract becomes active.

---

### Execution

Each contract specifies a "script engine" or interpreter to use when evaluating user inputs to the contract. By default we provide a basic engine called the `cvm`, though any interpreter could be used.

When the contract activates, a virtual machine is created using the specified engine. A hash-chain is also created, starting with the machine's identifier (vmid).

```ts
vmdata: {
  commits  : [],
  error    : null,
  head     : 'b70704c41e27d5f35a11ae7c6e5976501aa1380195714007197d7f47934dcf69',
  output   : null,
  paths    : [ [ 'payout', 0 ], [ 'return', 0 ] ],
  start : 1706511301,
  steps : 0,
  store : [
    [ '054fef5ba39416260ea4b48e9c557ee7e45d780d04b28e094d110459b971b78b', '[]' ],
    [ 'cf236c4e91678bddaaa482d41720f277bb7d2e4540a0fc47736b999a54d29e39', '[]' ],
    [ 'e7862cbeb981d295639af3e91661fc96e0f97b429e9ff2985d20a654667d167a', '[]' ]
  ],
  status  : 'init',
  tasks   : [ [ 7200, 'close', 'payout|return' ] ],
  updated : 1706511301
}
```

Members of the contract can interact with this machine by submitting a signed statement, called a [witness](data/witness.md#witness-data). These witness statements provide instructions to the virtual machine and execute programs.

Each statement calls upon a `method`, an `action` to perform on success, and a target spending `path` in the contract.

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

Every statement that updates the machine is recorded into the hash-chain. This chain validates the full execution history of the machine, from activation to settlement.

When the chain is updated, the new "head" is signed by the escrow agent and returned to provider of the witness statement as a form of receipt. This receipt proves that the escrow agent received the statement, and evaluated it in the virtual machine.

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

### Settlement

Once the machine has settled on a final outcome, the escrow agent will close the contract. If the machine specifies a spending path, the escrow agent will co-sign the relevant transaction and broadcast it to the Bitcoin network.

If the machine specifies a `null` output, then the escrow agent will erase the covenant from each deposit in the contract, freeing those funds for use in a new contract.

> Note: This "lock" and "release" mechanism is the foundation of our layer-2 protocol.

The settlement process is designed so that anyone with the contract and witness statements can run their own instance of the virtual machine, and verify that the contract has been executed fairly.

---

### Protocol Flow

To demonstrate the flow of the protocol through various paths and outcomes, we will walk through a sales agreement between three parties: **Alice** (the *buyer*), **Bob** (the *seller*), and **Carol** (third-party *arbitrator*).

**Negotiation**  

1. Alice and Bob prepare a proposal, and agree on terms / arbitration.  
2. Alice submits the proposal to escrow the agent and receives a contract.  

**Funding**  

3. Alice requests a deposit account from the escrow agent.  
4. Alice deposits her funds, then delivers a covenant for spending.  
5. Once the deposit is confirmed on-chain, the contract becomes active.  

**Settle on Payout (happy path)**  

6. Alice receives her widget and forgets about Bob.  
7. The contract schedule closes automatically on 'payout'.  
8. Bob gets the funds, Alice can verify the CVM execution.  

**Settle on Refund (neutral path)**  

6. Alice doesn't like her widget.  
7. Alice and Bob both agree to sign the 'refund' path.  
8. Alice gets a partial refund, Bob still keeps his fees.  

**Settle a Dispute (unhappy path)**  

6. Alice didn't get the right widget, and disputes the payout.  
7. Carol steps in, and decides on the 'refund' path.  
8. Alice gets a partial refund, Bob still keeps his fees.  

**Contract Expires (ugly path)**  

6. Alice claims she didn't get a widget, and disputes the payout.  
7. Carol is on a two-week cruise in the bahamas. No auto-settlement terms were set.  
8. The contract expires, all deposits are released.  

**Deposits Expire (ugliest path)**  

6. Everything above happens, except the last part.  
7. The entire escrow platform goes down in flames.  
8. The timelock on deposits expire, Alice can spend via the refund path.

Even in a worst-case scenario, deposits are recoverable by the time-locked refund path.

---

### Security Model

A brief description of the security model:

  * The escrow agent is not required in any part of the negotiation process. Contracts are provided to the agent as-is, and the agent can only approve or reject the offer to publish the contract.
  
  * The smart contract cannot be changed after it has been presented for publishing. The escrow agent can only provide additional payment outputs to the contract (for collecting fees).

  * Funders decide what transactions to sign and deliver to the escrow agent. Covenants are provided to the agent as-is, and the agent can only approve or reject the offer to co-sign the covenant.

  * The escrow agent has zero discretion with the spending of funds. The smart contract decides how the funds will be spent. The agent may only decide to cooperate with the contract, or decline.

  * If the escrow agent declines to cooperate, they can co-sign the return of funds back to the funding party. If the agent refuses to cooperate at all, the funds can be retrieved by the funding party after the time-lock has expired.

  * Even if the escrow agent were hacked, and their keys were compromised, the adversary would not be able to spend funds in any manner that is outside the terms of the covenant and contract.
  
  * All parites can independently verify contract execution. If a contract is settled without a valid or complete proof, the transaction + contract + receipts can be used to prove fraud.

Some challenges with the current model:

  * The escrow agent has the ability to censor members of a contract by ignoring their statements. While the use of receipts forces the agent to censor in real-time, this is still an issue.
  
  In the future, we will be leveraging the Nostr network in order to provide a proof-of-delivery system that will force to escrow agent to censor everyone, or no-one.

  * Even with the covenant restrictions and fraud-proofs, the escrow agent may still act malicious and settle the contract unfairly. This is a risk inhereit with any escrow system.

  While the protocol attempts to both disincentivize and marginalize this risk as much as possible, it is still an issue in certain cases (for example, if the escrow agent is hacked or coerced).
  
  In the future, we plan to mitigate these risks even further, using two mechanisms:
    - Splitting the escrow agent role into a federation, using threshold signatures (FROST).
    - Using a proof-of-stake system to punish agents if proof of fraud is presented.


By leveraging modern cryptography, and the programmable nature of Bitcoin, we have developed an escrow system that makes it uneventful and grossly unfavorable for the escrow agent to act as a malicious party.

In terms of security, speed, and simplicity, we believe this is the best non-custodial solution for providing programmable escrow contracts on Bitcoin today.

---

## Getting Started

Check out the [Get Started](./docs/get-started.md) page for a step-by-step guide on how to `negotiate`, `fund`, and `execute` a contract.

This repo also includes a live demo that you can run on your own machine, with no special software required. To run the demo, simply clone this repository, then run the following commands:

```sh
npm install           # Install all package dependencies.
npm run demo {chain}  # Run the demo using the provided chain.
```

The current chains available are `mutiny`, `signet`, and `testnet`. The default chain is `mutiny`.

You can read more info about the demo [here](demo/README.md).

---

## Development / Testing

To get started, make sure you are running `v19+` of node, then install the project dependencies using your node manager of choice:

```sh
node --version  # should be v19+
npm install     # install dependencies
```

Check out the [Development](./docs/development.md) section for documentation and guides on how to use the test suite.

---

## Questions / Issues

Feel free to post questions or comments on the issue board. All feedback is welcome.

---

## Contribution

Help wanted. All contributions are welcome!

---

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

**crypto-tools**  

Provides a suite of cryptography primitives and tools. Wraps the noble-curve and noble-hash libraries (and cross-checks them with other implementations).

https://github.com/cmdruid/crypto-tools  

**buff**  

The swiss-army-knife of byte manipulation. Such a fantastic and invaluable tool. Never leave home without it.

https://github.com/cmdruid/buff  

**core-cmd**  

Not a dependency, but I use this to run bitcoin core natively within my test suite. It wraps both `bitcoind` and `bitcoin-cli`, and provides a full sute of automation tools, including wallets, faucets, and more.

https://github.com/cmdruid/core-cmd  

**signer**  

Reference implementation of the new hybrid signing device / wallet we are building for BitEscrow. The documentation needs to be updated. WIP.

https://github.com/cmdruid/signer  

---

# Footnote

My inspiration for this project comes from the Bitcoin space, and the incredibly talented people that contribute. I will be forever grateful for their knowledge, kindness and spirit.

I wish for Bitcoin to win all the marbles; and be the new global reserve marbles that we fight over. I firmly believe a better money system will make the world a better place. And with it, maybe humanity will reach beyond the moon.
