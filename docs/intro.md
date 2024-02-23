# Introduction

BitEscrow is a private, non-custodial protocol for using Bitcoin in a covenant-based smart contract.

Key Features:

  * __100% private.__ All on-chain transactions appear as single-key spends. Participation is done through randomly generated credentials. Only requires a signing key (hot), and wallet xpub (cold) to participate.

  * __100% non-custodial.__ Money is secured in a collaborative 2-of-2 contract. All payouts are pre-signed before deposit. Addresses are generated from a cold-stored xpub of your choice.

  * __100% auditable.__ All contract terms, inputs, and operations are signed and recorded in a commit chain. Each settlement transaction is backed by an auditable commit history.

  * __Designed for trustless environments.__ Signing keys are disposable and have no capacity to sweep funds. Terms are signed up-front and verified before deposit.

  * __Designed to be robust.__ Deposits are reusable when a contract cancels or expires. Credentials are recoverable via your xpub. Refunds are secured upfront and broadcast automatically on expiration.

## Protocol Overview

The escrow protocol involves collaboration between three parties:

`Members` : The participating members of the contract.  
`Funders` : Those funding the contract (whom may be members).  
`Server ` : The escrow server hosting the contract (BitEscrow API).

The protocol is split into three phases: _negotiation_, _funding_, and _settlement_. Each phase represents a round of communication in the protocol.

### Negotiation

The first step is to negotiate and agree on a [proposal](wiki/proposal.md) document. This is a human-readable document which contains all of the terms of the contract.

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

Once the terms have been decided, any member can deliver the final proposal to the escrow server. The server will validate all terms, then publish an open [contract](wiki/contract.md) for funding.

> Note: The escrow server does not take part in negotiations. While BitEscrow may offer these services, the protocol is designed so that members can negotiate freely, without the server being involved.

### Funding

To deposit funds into a contract, the funding party will first request a deposit [account](wiki/deposit.md) from the server. This account uses a 2-of-2 multi-signature address with a time-locked refund path.

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

The combination of these signatures form a [covenant](wiki/deposit.md) with the contract:

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

Members of the contract can interact with the CVM by submitting a signed statement, called a [witness](wiki/contract.md). Members use these statements to instruct the CVM to perform a basic set of operations.

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
