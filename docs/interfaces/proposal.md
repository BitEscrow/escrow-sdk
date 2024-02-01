# Proposal Interfaces

- [ProposalData](#proposaldata)  
- [MemberData](#memberdata)  
- [RolePolicy](#rolepolicy)  

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
  limit    ?: number                // Membership limit.
  paths    ?: [ string, number ][]  // Paths to include.
  payment  ?: number                // Payment to include.
  programs ?: ProgramTerms[]        // Programs to join/add.
}
```
