# Proposal Documentation

The following table defines a complete list of terms that may be included in the proposal. Fields marked with a `?` are optional.

| Term      | Description                                                                                                                                                       |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| confirmations? | Enforce a minimum number of confirmations on deposits before being accepted. Optional.
| details   | Detailed information about the contract.                                                                                                                          |
| deadline?  | The amount of time (in seconds) available for funding a once a contract is published. If the funding goal is not met by the deadline, the contract is cancelled. |
| effective? | The exact date (in UTC seconds) that a contract is scheduled to activate. If a deadline is not specified, then the effective date is used to imply a funding deadline.                             |
| expires   | The maximum time (in seconds) that a contract can exist once published. If a contract does not settle by the expiration date, then it is cancelled.                  |
| fallback?  | This specifies a default spending path to be used if and when a contract expires. Optional.
| feerate? | Enforce a minimum feerate on all deposits. Optional.                                                                       |
| network   | The blockchain that this contract is executing on. Defaults to bitcoin mainnet.                                                                                   |
| paths     | A collection of spending outputs, labeled with a path name.                                                                                                        |
| payments  | A collection of spending outputs that should be included in all spending paths. More details on paths and payments are described below.                             |
| programs  | A collection of programs that will be made available in the CVM, plus their configuration. More details on programs are described below.                           |
| schedule  | A collection of scheduled actions that will executed within the CVM. More details on the schedule are described below.                                            |
| title     | The title of the proposal.                                                                                                                                        |
| value     | The output value of the contract. Each set of spending outputs must sum to this total amount.                                                                     |
| version   | A version number for the proposal specification.                                                                                                                  |

### Paths and Payments

The purpose of `paths` and `payments` is to collectively define a set of spending outputs that will be pre-signed by depositors, and made available to the agent for settlement.

**Paths**  

A spending path represents a conditional payment. It may or may not be sent, depending how the contract is settled.

Each path entry must contain three items: the *label*, *output value*, and *destination address*.
```ts
[ 'payout', 90000, 'bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc' ]
```

**Payments**  

A payment is just that: an unconditional payment to an address. A payment must be included in _all_ spending paths.

Each payment entry must contain just two items: the *output value* and *destination address*.
```ts
[ 10000, 'bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc' ]
```

When a contract is created, the outputs specified in `paths` are grouped together by path-name, and each group is used to create a transaction template. The outputs specified in `payments` are then added to each template (along with `fees` from the agent). This creates the final set of transaction templates that each depositor must sign.

The total sum for each transaction template must be identical, and must equal the `value` of the proposal.

### Actions and Programs

Each contract comes with a tiny virtual machine, called the CVM. The purpose of the CVM is to provide contract members an environment for updating the contract and debating how it should be settled.

**Actions**  

Updates to the CVM take the form of an `action` that is applied to a specified `path`:

```
close   : Settle the contract using the provided path.
lock    : Lock a spending path from being used.
unlock  : Unlock a spending path for use.
dispute : Dispute a spending path and block its use.
resolve : Resolve a dispute and settle the contract.
```

Actions can be taken within the CVM by executing a program.

**Programs**  

Programs are loaded into the CVM using the `programs` section of the proposal. Each program specifies the following configuration:

  - The `method` used to activate the program.
  - The `action` policy, which defines the actions this program can take. 
  - The `path` policy, which restricts which paths this program can access. 
  - Additional `params` that configure the method.

> The regex format for actions and paths is intentionally limited: It accepts '|' for specifying multiple options, or a single '*' for specifying all options. No other patterns are allowed.

The following entry is an example definition of a program:

```ts
[ 'sign', 'close|resolve', '*', 2, buyer_pubkey, seller_pubkey ]
```

Let's assume that for our `sign` program, the list of pubkeys includes the buyer and seller. The buyer and seller can use the above program to `close` or `resolve` the contract on any ('*') spending path. They can do this by using the `sign` method, which requires submitting a signed statement to the program. The program requires a minimum of two unique signatures to activate, and they must be from one of the pubkeys included in the list.

The `sign` method is a basic implementation of a threshold-based multi-signature agreement. Additional methods and actions will be added to the CVM in the future.

**Rules of Actions**  

The logical rules for the CVM are designed to be simple and easy to follow:

```
  - An open path can be locked, disputed, or closed.
  - A locked path can be disputed or released.
  - A disputed path can only be resolved.
  - Closing a path will settle the contract.
  - Resolving a dispute will settle the contract.
```

Keeping the state of the virtual machine simple is a security feature. It prevents bugs and strange edge-cases from developing and risking the mis-direction of funds.

### Scheduled Actions

In addition to `programs`, an action can be executed within the CVM on a pre-defined schedule.

In the proposal, each task entry must contain three items: the *timer*, *action*, and *path regex*.
```ts
[ 7200, 'close', 'payout|return' ]
```

The timer is defined in seconds, and will be relative to the `activated` date that is defined in the contract. Once the specified number of seconds have passed, the action will be executed inside the CVM.

You may specify multiple paths. The task will execute the provided action on each path in sequential order. If the result of the action leads to a settlement, then the contract will close. If a task fails to execute on a given path (due to a rule violation), then the task will continue onto the next path.
