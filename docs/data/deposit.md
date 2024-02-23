# Deposit Interfaces

List of interfaces for the Deposit API. Click on the links below to navigate:

- [DepositAccount](#depositaccount)
- [CovenantData](#covenantdata)
- [DepositData](#depositdata)
- [DepositDigest](#depositdigest)
- [DepositStatus](#depositstatus)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## DepositAccount

```ts
interface DepositAccount {
  acct_id    : string  // Hash identifer for the account record.
  acct_sig   : string  // Signature for the account record.
  address    : string  // On-chain address for receiving funds.
  agent_id   : string  // Identifier of the deposit agent.
  agent_pk   : string  // Public key of the deposit agent.
  created_at : number  // Account creation timestamp (in seconds).
  deposit_pk : string  // Public key of the funder making the deposit.
  sequence   : number  // Locktime converted into a sequence value.
  spend_xpub : string  // The extended key used for returning funds.
}
```

## CovenantData

```ts
interface CovenantData {
  cid    : string  // Id of the contract you are signing for.
  pnonce : string  // Public nonce of the signer.
  // List of labeled partial signatures for the covenant.
  psigs  : [ label : string, psig : string ][]
}
```

## DepositData

```ts
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
  deposit_pk   : string
  dpid         : string
  expires_at   : number
  return_psig  : string | null
  scriptkey    : string
  sequence     : number
  settled      : boolean
  settled_at   : number | null
  spend_xpub   : string
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

## DepositDigest

```ts
interface DepositDigest {
  block_height : number | null
  cid          : string | null
  confirmed    : boolean
  expires_at   : number | null
  settled      : boolean
  spent        : boolean
  spent_txid   : string | null
  status       : DepositStatus
  updated_at   : number
  txid         : string
  value        : number
  vout         : number
}
```

## DepositStatus

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
