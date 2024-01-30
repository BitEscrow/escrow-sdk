# Proposals

Work in progreess. Check back later!

**Sections**

1. [Proposal Overview](#proposal-overview)
3. [Actions and Rules](#actions-and-rules)
4. [Third-Party Arbitration](#third-party-arbitration)
5. [Creating a Proposal](#creating-a-proposal)
6. [Defining Roles](#defining-roles)
7. [Join a Proposal](#join-a-proposal)
8. [Endorsements](#endorsements)
9. [Submit a Proposal](#submit-a-proposal)

**Interfaces**

- [ProposalData](#proposaldata)
- [RolePolicy](#rolepolicy)

## Proposal Overview

Below is a diagram of the proposal interface, plus a description for each term.

#### ProposalData

```ts
interface ProposalData {
  content   ?: string           // Store any kind of text or json data.
  deadline  ?: number           // The max length of a published contract.
  effective ?: number           // Set a specific date for activation.
  expires    : number           // The max length of an active contract.
  feerate   ?: number           // Define a fee-rate to use for transactions.
  members    : MemberData[]     // Signing members of the contract.
  network    : Network          // Network (chain) of the contract.
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

Sets the maximum length (in seconds) for funding a contract before it expires. If there are funds locked to a contract when it expires, those funds are released and availabe for spending.

A contract that is fully-funded can still expire if the funds are not confirmed. All required funds must be locked _and_ confirmed before the contract will activate.

**Effective**  

The effective activation date of the contract, as a UTC timestamp. This field implies a `deadline`, as all funds must be locked and confirmed _before_ the effective date is reached, or the contract is canceled.

If contract funds are secured before the effective date, then the contract will delay activation until the date is reached.

**Expires**  

Sets the maximum length (in seconds) for an active contract to run before it expires. If an active contract reaches expiration, all funds locked to the contract are released and availabe for spending.

Scheduled tasks can be used to guarantee that a contract settles before expiration.

**Feerate**  

Sets the feerate for the transactions that are pre-signed by depositors. If no feerate is set, then the escrow server will check the network and select a fee target that confirms in three blocks.

**Members**  

Stores the anonymous credentials for each member of the contract.

**Network**  

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
[ 'endorse', 'close|resolve', '*', 2, buyer_pubkey, seller_pubkey ]
```

These terms state that the `endorse` method can be used to `close` or `resolve` the contract, on any (`*`) spending path, using at least `2` signatures, from the `buyer_pubkey` and `seller_pubkey`.

> Note: The terms `buyer_pubkey` and `seller_pubkey` would be replaced by the pubkeys themselves.

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
  - An open path can be locked, disputed, or closed.
  - A locked path can be disputed or released.
  - A disputed path can only be resolved.
  - Closing a path will settle the contract.
  - Resolving a dispute will settle the contract.
```

Limiting the rule-set of the virtual machine is a security feature. It prevents bugs, exploits and other edge-cases from creeping into the contract.

## Third-Party Arbitration

## Creating a Proposal

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

## Defining Roles

#### RolePolicy

```ts
interface RolePolicy {
  limit    ?: number                // Membership limit.
  paths    ?: [ string, number ][]  // Paths to include.
  payment  ?: number                // Payment to include.
  programs ?: ProgramTerms[]        // Programs to join/add.
}

```

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

## Join a Proposal

## Endorsements

## Submit a Proposal

