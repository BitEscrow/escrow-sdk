```ts
interface DepositAccount {
  created_at : number
  address    : string
  agent_id   : string
  agent_pk   : string
  member_pk  : string
  req_id     : string
  sequence   : number
  sig        : string
}
```

```ts
interface CovenantData {
  cid    : string
  pnonce : string
  psigs  : [ label : string, psig : string ][]
}

interface DepositData {
  agent_id     : string
  agent_pk     : string
  agent_pn     : string
  block_hash   : string | null
  block_height : number | null
  block_time   : number | null
  confirmed    : boolean
  covenant     : CovenantData | null
  created_at   : number
  dpid         : string
  expires_at   : number
  member_pk    : string
  return_tx    : string
  scriptkey    : string
  sequence     : number
  settled      : boolean
  settled_at   : number | null
  spent        : boolean,
  spent_at     : number | null
  spent_txid   : string | null
  status       : DepositStatus
  txid         : string
  updated_at   : number
  value        : number
  vout         : number
}
```

```ts
type DepositStatus = 
  'reserved' | 
  'pending'  | 
  'stale'    | 
  'open'     | 
  'locked'   | 
  'spent'    | 
  'settled'  | 
  'expired'  | 
  'error'
```