# Contract Interfaces

List of interfaces for the Contract API.

> Click on the links below to navigate:

- [ContractData](#contractdata)  
- [ContractDigest](#contractdigest)  
- [ContractStatus](#contractstatus)  
- [StateData](#statedata)  

## ContractData

```ts
interface ContractData {
  activated   : null | number
  agent_fee   : PaymentEntry
  agent_id    : string
  agent_pk    : string
  agent_pn    : string
  balance     : number
  cid         : string
  deadline    : number
  est_txfee   : number
  est_txsize  : number
  expires_at  : null | number
  feerate     : number
  moderator   : string | null
  outputs     : SpendTemplate[]
  pending     : number
  pubkeys     : string[]
  prop_id     : string
  published   : number
  settled     : boolean
  settled_at  : number | null
  signatures  : string[]
  spent       : boolean,
  spent_at    : number | null
  spent_txid  : string | null
  status      : ContractStatus
  subtotal    : number
  terms       : ProposalData
  total       : number
  updated_at  : number
  vm_state    : null | StateData
  vout_size   : number
}

```

## ContractDigest

```ts
interface ContractDigest {
  activated  : number | null
  balance    : number
  est_txsize : number
  est_txfee  : number
  pending    : number
  settled    : boolean
  spent      : boolean
  spent_txid : string | null
  status     : ContractStatus
  total      : number
  txin_count : number
  updated_at : number
}

```

## ContractStatus

```ts
type ContractStatus = 
  'published' | 
  'funded'    | 
  'secured'   | 
  'pending'   | 
  'active'    |
  'closed'    | 
  'spent'     | 
  'settled'   | 
  'canceled'  | 
  'expired'   | 
  'error'
```

## StateData

```ts
interface StateData {
  commits  : CommitEntry[]
  error    : string | null
  head     : string
  output   : string | null
  paths    : StateEntry[]
  programs : ProgramEntry[]
  steps    : number
  start    : number
  status   : PathStatus
  store    : StoreEntry[]
  tasks    : TaskEntry[]
  updated  : number
}
```