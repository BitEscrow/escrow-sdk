# Draft Interfaces

List of interfaces for the Draft API. Click on the links below to navigate:

- [ProposalData](#proposaldata)
- [MemberData](#memberdata)
- [RoleTemplate](#roletemplate)
- [RolePolicy](#rolepolicy)
- [DraftTemplate](#draft-template)
- [DraftData](#draft-data)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## ProposalData

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

## RoleTemplate

```ts
interface RoleTemplate {
  title      : string
  min_slots ?: number
  max_slots ?: number
  paths     ?: [ string, number ][]
  payment   ?: number
  programs  ?: ProgramTerms[]
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

## Draft Template

```ts
interface DraftTemplate {
  members    ?: MemberData[],
  proposal    : ProposalTemplate | ProposalData
  roles      ?: RolePolicy[]
  signatures ?: string[]
  terms      ?: string[]
}
```

## Draft Data

```ts
interface DraftData {
  // A list of active members of the proposal, and their credentials.  
  members    : MemberData[]  
  // The main proposal document being negotiated.
  proposal   : ProposalData  
  // List of roles defined for the proposal, and their requirements.
  roles      : RolePolicy[]  
  // Non-member endorsements of the proposal, used for indexing.
  signatures : string[]      
}
```
