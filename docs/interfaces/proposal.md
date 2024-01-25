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

type ProgramTerms = [
  method    : string,
  actions   : string,
  paths     : string,
  ...params : Literal[]
]

type ScheduleTerms = [
  stamp  : number,
  action : string,
  path   : string
]

export interface ProposalData {
  content   ?: string
  deadline  ?: number
  effective ?: number
  expires    : number
  feerate   ?: number
  members    : MemberData[]
  moderator ?: string
  network    : Network
  paths      : PathEntry[]
  payments   : PaymentEntry[]
  programs   : ProgramTerms[]
  schedule   : ScheduleTerms[]
  title      : string
  value      : number
  version    : number
}
```

```ts
interface MemberData {
  id   : string
  pub  : string
  pol ?: string
  sig  : string
  xpub : string
}

interface RolePolicy {
  limit    ?: number
  paths    ?: [ string, number ][]
  payment  ?: number
  programs ?: ProgramTerms[]
}
```