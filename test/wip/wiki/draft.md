# Draft Wiki

The proposal draft is a pre-cursor to publishing a contract. The draft defines all the members the contract, and the complete terms for locking funds in escrow.

**Sections**

1. [Proposal Overview](#proposal-overview)
2. [Actions and Rules](#actions-and-rules)
3. [Dispute and Resolution](#dispute-and-resolution)
4. [Building a Proposal](#building-a-proposal)
5. [Joining a Proposal](#join-a-proposal)
6. [Endorsements](#endorsements)
7. [Submit a Proposal](#submit-a-proposal)

**Interfaces**

- [Proposal Interfaces](../data/draft.md)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## Proposal Overview

Below is a diagram of the proposal interface, plus a description for each term.

```ts
interface ProposalData {
  content   ?: string           // Store any kind of text or json data.
  deadline  ?: number           // The max length of a published contract.
  duration   : number           // The max length of an active contract.
  effective ?: number           // Set a specific date for activation.
  feerate   ?: number           // Define a fee-rate to use for transactions.
  network    : ChainNetwork          // ChainNetwork (chain) of the contract.
  paths      : PathEntry[]      // Conditional payments in the contract.
  payments   : PaymentEntry[]   // Unconditional payments in the contract.
  programs   : ProgramTerms[]   // Programs available to run in the CVM.
  schedule   : ScheduleTerms[]  // Scheduled tasks to run in the CVM.
  title      : string           // The title of the contract.
  value      : number           // The total value of the contract.
  version    : number           // For future upgrades.
}
```

**Content**  

This field is designed for storing any kind of text or structured data. Feel free to use this space for your own needs.

**Deadline**  

Sets the maximum duration (in seconds) that a contract is availabe for funding before it expires. If there are funds locked to a contract when it expires, those funds are released and availabe for spending.

A contract that is fully-funded can still expire if the funds are not confirmed. All required funds must be locked _and_ confirmed before the contract will activate.

**Expires**  

> (will rename this field to "duration" in the future)

Sets the maximum duration (in seconds) for an active contract to run before it expires. If an active contract reaches expiration, the contract is canceled, and all covenant locks are released.

Scheduled tasks can be used to guarantee that a contract settles before expiration.

**Effective**  

The effective activation date of the contract, as a UTC timestamp. This field implies a `deadline`, as all funds must be locked and confirmed _before_ the effective date is reached, or the contract is canceled.

If contract funds are secured before the effective date, then the contract will delay activation until the date is reached.

**Feerate**  

Sets the feerate for the transactions that are pre-signed by depositors. If no feerate is set, then the escrow server will check the network and select a fee target that confirms in three blocks.

**Members**  

Stores the anonymous credentials for each member of the contract.

**ChainNetwork**  

Specifies the network (blockchain) to use for the contract.

**Paths**  

The `paths` section defines a set of conditional payments, separated by label. Each set of payments is pre-signed by depositors, and spendable by the contract once it becomes active. 

```ts
[ 'payout', 90000, 'bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc' ]
```

Each path entry must contain three items: the *label*, *output value*, and *destination address*.

**Payments**  

The `payments` section defines an unconditional payment, and is included in _all_ spending paths.

Each payment entry must contain just two items: the *output value* and *destination address*.

```ts
[ 10000, 'bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc' ]
```

**Programs**  

Defines a set of programs that are available to run within the CVM. Each entry specifies the following:

  - The `method` name of the program being run. 
  - The `actions` that can be taken with this program. 
  - The `paths` that can be selected by this program. 
  - The `params` for configuring the program, based on the method.

The following entry is an example definition of a program:

```ts
[ 'endorse', 'close|resolve', 'payout|return', 2, buyer_pub, seller_pub ]
```

These terms state that the `endorse` method can be used to `close` or `resolve` the contract, on any (`*`) spending path, using at least `2` signatures, from the `buyer_pubkey` and `seller_pubkey`.

> Note: The terms `buyer_pub` and `seller_pub` would be replaced by the pubkeys themselves.

The regex format for actions and paths is intentionally limited: It accepts '|' for specifying multiple options, or a single '*' for specifying all options. No other patterns are allowed.

**Schedule**  

Defines a set of tasks that will run within the CVM at a specific time. Each task entry specifies three items: *timer*, *actions*, and *paths*.

```ts
[ 7200, 'close', 'payout|return' ]
```

The timer is defined in seconds and counted relative to the activation date in the contract. Once the specified number of seconds have passed, the action will be executed inside the CVM.

If multiple `actions` and/or `paths` are specified in a task, the CVM will attempt to execute each action in sequential order, on each path in sequential order.

If the result of an action leads to a settlement, then the contract will close. If a task fails to execute an action or path (due to it being blocked), then the task will continue onto the next path.

Scheduled tasks can be used as a catch-all to guarantee a contract settles before expiration.

**Title**  

The display title for your contract. You can use this field as you wish, though it should be used to briefly describe your contract.

**Value**  

The sum of each spending `path` must equal the same amount, and the sum of `path + payment` must equal the `value` of the proposal.

### Actions and Rules

Each contract comes with a tiny virtual machine, called the CVM. The purpose of the CVM is to provide contract members an environment for updating the contract and debating how it should be settled.

Updates to the CVM take the form of an `action` that is applied to a specified `path`.

The actions available are:

```md
close   : Settle the contract on a given path.
dispute : Block a spending path from use.
lock    : Lock a spending path from use.
release : Unlock a spending path for use.
resolve : Settle the dispute on a given path.
```

The logical rules for the CVM are designed to be simple:

```
 * An open path can be locked, disputed, or closed.
 * A locked path can be disputed or released.
 * A disputed path can only be resolved.
 * Closing a path will settle the contract.
 * Resolving a dispute will settle the contract.
```

Limiting the rule-set of the virtual machine is a security feature. It prevents bugs, exploits and other edge-cases from creeping into the contract.

## Dispute and Resolution

If you would like to have a third-party in the contract that can make a decision during a dispute, _and only during a dispute_, then you can use the `dispute` and `resolve` actions.

Members can be given the ability to `dispute` a path (which blocks it from use).  When a dispute is raised, a third-party with access to the `resolve` action can then settle the contract.

```ts
// Example of a two-party agreement with third party arbitration.
programs : [
  [ 'endorse', 'close|resolve', 'payout|return', 2, buyer_pub, seller_pub ],
  [ 'endorse', 'dispute',       'payout|return', 1, buyer_pub, seller_pub ],
  [ 'endorse', 'resolve',       'payout|return', 1, mediator_pub          ]
]
```

The `resolve` action cannot be used unless there is an active `dispute` present. This prevents a third-party from closing a contract arbitrarily.

## Building a Proposal

Building a proposal is a basic three-step process:

1. **Define a base template**  
This should define the terms that apply to all members in the contract.

2. **Define the roles**  
This should define the terms that apply to each specifc role (buyer, seller, etc.). This includes `paths` and `programs` related to the role.

3. **Invite others to join**  
Once the base template and roles are defined, members can select a role to join, and their device will use the role template to complete the proposal.

A basic proposal document can be created with the `create_proposal` method:

```ts
import { create_proposal } from '@scrow/core/proposal'

const template = create_proposal({
  title    : 'Basic two-party contract with third-party arbitration.',
  expires  : 14400,
  network  : network,
  schedule : [[ 7200, 'close|resolve', '*' ]],
  value    : 15000,
})
```

Similarly, a role template can be created with the `create_policy` method:

```ts
import { create_policy } from '@scrow/core/policy'

const roles = {
  buyer : create_policy({
    paths : [[ 'return', 10000 ]],
    programs : [
      [ 'endorse', 'close',   'payout|return', 2 ],
      [ 'endorse', 'dispute', 'payout|return', 1 ]
    ]
  }),
  seller : create_policy({
    paths : [[ 'payout', 10000 ]],
    programs : [
      [ 'endorse', 'close',   'payout|return', 2 ],
      [ 'endorse', 'dispute', 'payout|return', 1 ]
    ]
  }),
  agent : create_policy({
    payment  : 5000,
    programs : [
      [ 'endorse', 'resolve', '*', 1 ]
    ]
  })
}
```

There are a few additional options that you can define in a role template:

#### RolePolicy

```ts
interface RolePolicy {
  limit    ?: number                // Membership limit.
  paths    ?: [ string, number ][]  // Paths to include.
  payment  ?: number                // Payment to include.
  programs ?: ProgramTerms[]        // Programs to join/add.
}
```

With a proposal template and role templates defined, we can now solicit members to join our proposal, and their devices will complete the proposal based upon the role they choose.

## Join a Proposal

To have a member join a proposal, you can solicit their device to `join`:

```ts
// Each member is an EscrowSigner object.
const [ alice_signer, bob_signer, carol_signer ] = members

// Start with our proposal template.
let proposal = template

// Each member will join as the provided role, 
// and return an updated copy of the proposal.
proposal = a_signer.proposal.join(proposal, roles.buyer)
proposal = b_signer.proposal.join(proposal, roles.seller)
proposal = c_signer.proposal.join(proposal, roles.agent)
```

Once all roles have been filled, the proposal will be complete.

## Endorsements

An endorsement signals your approval of the current terms. To get an endorsement from a member, you can solicit their device:

```ts
const signatures = members.map(signer => {
  // Collect an endorsement from each user's device.
  return signer.proposal.endorse(proposal)
})
```

Each endorsement contains the member's device pubkey and signature.

## Submit a Proposal

See: [Creating a Contract](./contract.md#creating-a-contract)
