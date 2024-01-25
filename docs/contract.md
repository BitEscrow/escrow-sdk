```ts
interface ContractRequest {
  proposal    : ProposalData
  signatures ?: string[]
}
```

```ts
type SpendTemplate = [ label : string, txhex : string ]

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

```ts
export type ContractStatus = 
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
