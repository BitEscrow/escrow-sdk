# Deposits

Work in progreess. Check back later!

**Sections**

1. [Request an Account]()
2. [Verify an Account]()
3. [Deposit Funds]()
4. [Create a Covenant]()
5. [Register a Deposit]()
6. [Lock a Deposit]()
7. [Close a Deposit]()

**Interfaces**

- [AccountRequest]
- [DepositAccount]
- [CovenantData]
- [SpendingData]
- [RegisterRequest]
- [DepositData]

### Requesting a Deposit Account

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

## Sending funds to a Deposit Address

## Registering funds at a Deposit Address

## Locking a Deposit to a Contract

## Released Depoists

## Expired Deposits

## Returning a Deposit

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