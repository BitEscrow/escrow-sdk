# Proposal Interfaces

List of interfaces for the Proposal API. Click on the links below to navigate:

- [ProposalData](#proposaldata)  
- [MemberData](#memberdata)  
- [RolePolicy](#rolepolicy)  

> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

## ProposalData

```ts
interface ProposalData {
  content   ?: string           // Store any kind of text or json data.
  deadline  ?: number           // The max length of a published contract.
  expires    : number           // The max length of an active contract.
  effective ?: number           // Set a specific date for activation.
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

## MemberData

```ts
interface MemberData {
  id   : string
  pub  : string
  pol ?: string
  sig  : string
  xpub : string
}
```

## RolePolicy

```ts
interface RolePolicy {
  title      : string
  min_slots ?: number
  max_slots ?: number
  paths     ?: [ string, number ][]  // Paths to include.
  payment   ?: number                // Payment to include.
  programs  ?: ProgramTerms[]        // Programs to join/add.
}

type ProgramTerms = [
  method  : string
  actions : string
  paths   : string
  thold   : number
]
```
