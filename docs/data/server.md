# Server Interfaces

List of data interfaces for the Server API.

- [ServerPolicy](#serverpolicy)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## ServerPolicy

The data interface for additional terms and restrictions that are defined by the escrow server.

```ts
interface ServerPolicy {
  account : {
    FEERATE_MIN   : number  // Minimun feerate required on a return tx.
    FEERATE_MAX   : number  // Maximum feerate allowed on a return tx.
    GRACE_PERIOD  : number  // Time (in seconds) required between contract and deposit expiration.
    LOCKTIME_MIN  : number  // Minimum locktime duration (in seconds) for a deposit.
    LOCKTIME_MAX  : number  // Maximum locktime duration (in seconds) for a deposit.
    TOKEN_EXPIRY  : number  // Time (in seconds) before an unused account token expires.
  }
  proposal : {
    FEERATE_MIN   : number    // Minimum tx feerate to charge for a contract.
    FEERATE_MAX   : number    // Maximum tx feerate to charge for a contract.
    DEADLINE_MIN  : number    // Minimum deadline (in seconds) for collecting funds.
    DEADLINE_MAX  : number    // Maximum deadline (in seconds) for collecting funds.
    DURATION_MIN  : number    // Minimum duration (in seconds) for contract execution.
    DURATION_MAX  : number    // Maximum duration (in seconds) for contract execution.
    EFFECTIVE_MAX : number    // Maximum future date (in seconds) that can be specified.
    MULTISIG_MAX  : number    // Maximum number of public keys allowed in a program.
    TXTIMEOUT_MIN : number    // Minimum timeout set for unconfirmed deposits.
    TXTIMEOUT_MAX : number    // Maximum timeout set for unconfirmed deposits.
    VALID_ENGINES : string[]  // A list of available 
  }
}
```