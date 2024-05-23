---
sidebar_position: 0
---

# Introduction

BitEscrow is a secure, private protocol for locking Bitcoin into a smart contract, with non-custodial escrow of funds.

Key Features:

  * __100% private.__ Users only need a random signing key (hot), and wallet xpub (cold) to participate. All on-chain transactions are script-less key spends. No meta-data is exposed.

  * __100% auditable.__ All contract operations are committed into a hash-chain, signed by the escrow agent, and provided as receipt. All contract execution is independently verifiable.

  * __100% non-custodial.__ Money is secured in a time-locked 2-of-2 contract that returns to sender. All spending transactions are signed up-front. The escrow agent has zero discretion over spending.

  * __Designed for trustless environments.__ Signing keys are separated from address generation, with zero capacity to sweep funds. Keys can be made ephemeral, and recoverable from the user's xpub.

  * __Designed to be robust.__ Deposits can be reused whenever a contract cancels or expires. Refund transactions are secured upfront and broadcast automatically on expiration.

This SDK implements a trust-less protocol for locking Bitcoin in escrow, without requiring a custodian for the funds. Instead, the funds are deposited into a smart contract on the Bitcoin block-chain, with a chosen escrow agent listed as a co-signer.

The complete protocol involves three rounds of communication, split between three parties:

`Members` : Those participating within the contract.  
`Funders` : Those depositing funds into the contract.  
`Server`  : The server co-signing on deposits (i.e BitEscrow).  

The three rounds of communication are _negotiation_, _funding_, and _execution_.

---

### Negotiation

The first step is to negotiate and agree on a [proposal](../data/proposal.md) document. This is a human-readable document which contains all of the initial terms of the contract.

It is written in JSON format, and designed for collaboration (much like a PSBT):

```ts
{
  title    : 'Basic two-party contract with third-party dispute resolution.',
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
  value    : 100000
}
```

The interface for a smart-contract can be defined through the use of `programs`. Each program describes a way to interact with the smart contract, plus additional terms and restrictions.

The `engine` field defines the interpreter that will be used to evaluate the smart contract, while the `schedule` field defines which actions will happen over time.

> The Proposal API is designed to interface with and support any kind of smart-contract system.

You can share this document peer-to-peer, or use a third-party for collaboration. Third-party platforms may assist with negotiation and offer their own services (such as arbitration).

Once the terms have been decided, any party can deliver the final proposal to the escrow server. The server will validate the proposal, then publish an open [contract](data/contract.md) for funding.

> Note: The escrow server does not take part in negotiations. While BitEscrow may offer these services, the protocol is designed so that members can negotiate freely, without the escrow server being involved.

---

### Funding

To deposit funds into a contract, each funder requests a [Deposit Account](data/account.md#account-data) from the escrow server. This account sets up a 2-of-2 multi-signature address, with a time-locked return path for the funder.

```ts
interface AccountData {
  account_hash : string   // A hash digest of the original account request.
  account_id   : string   // The hash identifier for the data record.
  agent_pk     : string   // The public key of the escrow server hosting the account.
  agent_tkn    : string   // Crypto-graphic data to use when creating a covenant.
  created_at   : number   // The UTC timestamp when the record was created.
  created_sig  : string   // A signature from the server_pk, signing the account id.
  deposit_addr : string   // The multi-sig bitcoin address for the deposit account.
  deposit_pk   : string   // The public key of the user making the deposit.
  locktime     : number   // The amount of time (in seconds) to lock the deposit.
  network      : ChainNetwork  // The block-chain network to use for this account.
  return_addr  : string   // The return address to use when closing the account.
}
```

The funder independently verifies this information, then sends their funds to the account address. Once the transaction is available in the mempool, the funder can register their deposit with the server.

### Covenant

To commit funds to a contract, the funder must produce a signature for each spending requirement in the contract. These signatures are tweaked with the contract terms, then delivered to the escrow agent.

This batch of tweaked signatures forms a [Covenant](data/deposit.md#covenant-data) between the deposit and contract. The escrow server must explicitly agree to this contract (by reciprocating the tweak) in order to co-sign a transaction and spend the funds.

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
vm_state: {
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
const vmdata = {
  active_at  : 1716232800,
  commit_at  : 1716232800,
  closed     : true,
  closed_at  : 1716232800,
  engine     : 'cvm',
  error      : null,
  expires_at : 1716247200,
  head       : '13318f6d2c822ad10a8e78608745ae596e2c0cb4dea3cbe0d21710e0e5a54ef0',
  output     : 'payout',
  pathnames  : [ 'payout', 'refund' ],
  programs   : [ ... ],
  state      : '...',
  step       : 1,
  tasks      : [ [ 7200, 'close|resolve', 'payout|refund' ] ],
  updated_at : 1716232800,
  vmid       : '3c9fe23c9cd7ea03c4b007439872d0ca6a8bcf503a23b0394b67d11b4a53ce9e'
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
