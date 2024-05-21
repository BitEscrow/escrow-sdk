# Proposal Interfaces

List of data interfaces for the Proposal API.

- [ProposalData](#proposal-data)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## Proposal Data

The data interface for a contract proposal.

```ts
interface ProposalData {
  content   ?: string           // Store any kind of text or json data.
  created_at : number           // The UTC timestamp when the proposal was created.
  deadline  ?: number           // The max length of a published contract.
  duration   : number           // The max length of an active contract.
  engine     : string           // Script engine to use for the contract.
  effective ?: number           // Set a specific date for activation.
  feerate   ?: number           // Define a fee-rate to use for transactions.
  moderator ?: string           // Define a pubkey that can moderate the contract.
  network    : ChainNetwork     // Chain network to use for the contract.
  paths      : PathEntry[]      // Conditional payments in the contract.
  payments   : PaymentEntry[]   // Unconditional payments in the contract.
  programs   : ProgramEntry[]   // Programs available to run in the CVM.
  schedule   : ScheduleEntry[]  // Scheduled tasks to run in the CVM.
  title      : string           // The title of the contract.
  value      : number           // The total value of the contract.
  version    : number           // For future upgrades.
}
```

The proposal includes entry lists for the following items:

```ts
type PaymentEntry = [
  value   : number,
  address : string
]

type PathEntry = [
  path    : string,
  value   : number,
  address : string
]

type ProgramEntry = [
  method    : string,
  actions   : string,
  paths     : string,
  ...params : Literal[]
]

type ScheduleEntry = [
  stamp  : number,
  action : string,
  path   : string
]
```