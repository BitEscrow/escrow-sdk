# Draft Interfaces

List of data interfaces for the Draft API.

- [DraftTemplate](#draft-template)
- [DraftSession](#draft-session)
- [MemberData](#member-data)
- [RoleTemplate](#role-template)
- [RolePolicy](#role-policy)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## Draft Template

A template interface for creating a new drafting session.

```ts
interface DraftTemplate {
  proposal : ProposalTemplate
  roles    : RoleTemplate[]
}
```

---

## Draft Session

An interface for managing a shared drafting session between signers.

```ts
interface DraftSession {
  // A list of active members of the proposal, and their credentials.  
  members  : MemberData[]  
  // The main proposal document being negotiated.
  proposal : ProposalData  
  // List of roles defined for the proposal, and their requirements.
  roles    : RolePolicy[]  
  // Non-member endorsements of the proposal, used for indexing.
  sigs     : string[]      
}
```

---

## Member Data

The interface for a member in the proposal.

```ts
interface MemberData {
  pid  : string
  pub  : string
  xpub : string
}
```

---

## Role Template

A template interface for creating a new role policy.

```ts
interface RoleTemplate {
  title      : string
  id        ?: string
  moderator ?: boolean
  paths     ?: PathTemplate[]
  payment   ?: number
  programs  ?: ProgramEntry[]
  seats     ?: number
}
```

---

## Role Policy

The interface for a role in the proposal.

```ts
interface RolePolicy {
  id        : string
  title     : string
  moderator : boolean
  paths     : [ string, number ][]
  payment  ?: number
  programs  : ProgramEntry[]
  seats     : number
}
```
