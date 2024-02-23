# Server Interfaces

List of interfaces for the Server API.

- [ServerPolicy](#serverpolicy)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## ServerPolicy

```ts
export interface ServerPolicy {
  contract : {
    // Default agent fee when settling a contract.
    AGENT_FEE   : number
    // The interval between requests that a contract will wait 
    // before re-evaluating its status.
    UPDATE_IVAL : number  // Interval that contracts will
  }

  deposit : {
    // Default locktime for deposit accounts.
    DEFAULT_LOCKTIME : number
    // Duration (in seconds) that an unconfirmed deposit will
    // be marked as "stale" and purged from a contract.
    STALE_WINDOW     : number
    // The interval between requests that a deposit will wait 
    // before re-evaluating its status.
    UPDATE_IVAL      : number
  }

  general : {
    // Threshold (in seconds) when a stamp is evaluated as 
    // an absolute timestamp, versus a relative one.
    STAMP_THOLD      : number
  }

  proposal : {
    // List of allowable actions in a proposal.
    ACTION_LIST      : string[]
    // List of allowable methods in a proposal.
    METHOD_LIST      : string[]
    // Default duration (in seconds) that a published contract
    // is open for funding, before being cancelled.
    DEFAULT_DEADLINE : number
    // Default duration (in seconds) that an active contract
    // is open for settlement, before being cancelled.
    DEFAULT_EXPIRES  : number
    // Minimum duration (in seconds) that a contract must be
    // open for funding.
    MIN_DEADLINE     : number
    // Max effective date.
    MAX_EFFECT       : number
    // Minimum duration (in seconds) that an active contract
    // must be open for settlement.
    MIN_EXPIRY       : number
    // Max duration (in seconds) that an active contract
    // can remain open for settlement.
    MAX_EXPIRY       : number
    // Minimum feerate that can be specified for a proposal.
    MIN_FEERATE      : number
    // Max feerate that can be specified for a proposal.
    MAX_FEERATE      : number
    //
    MIN_WINDOW       : number
    //
    MAX_WINDOW       : number
    // Minimum duration (in seconds) that must exist between
    // the contract expiration, and deposit expiration date.
    GRACE_PERIOD     : number
    // Max number of participants allowed in a program method
    // that uses multi-signature (i.e 'endorse' method).
    MAX_MULTISIG     : number
  }
}

```