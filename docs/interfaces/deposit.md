# Deposit Interfaces

List of interfaces for the Deposit API. Click on the links below to navigate:

- [CovenantData](#covenantdata)
- [DepositData](#depositdata)
- [DepositStatus](#depositstatus)
- [TxOutput](#txoutput)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## CovenantData

The data interface for a Covenant object.

```ts
interface CovenantData {
  cid    : string  // The identifier of the contract being funded.
  cvid   : string  // The binding id between the contract and deposit.
  pnonce : string  // A random public nonce provided by the funder.
  psigs  : [ string, string ][] // List of partial signatures for the covenant.
}
```

## CloseRequest

```ts
interface CloseRequest {
  dpid        : string  // The hash identifier of the deposit to close.
  return_fees : number  // The transaction fees to use when spending.
  return_psig : string  // A partial signature for the return transaction.
}
```

## DepositData

The main data interface for a deposit object.

```ts
interface DepositData {
  account_hash : string   // A hash digest of the original account request.
  created_at   : number   // The UTC timestamp when the record was created.
  created_sig  : string   // A signature from the server_pk, signing the account id.
  deposit_addr : string   // The multi-sig bitcoin address for the deposit account.
  deposit_pk   : string   // The public key of the user making the deposit.
  dpid         : string   // The unique identifier of the deposit.
  locktime     : number   // Desired locktime (in seconds) for account recovery.
  network      : Network  // The block-chain network to use.
  return_addr  : string   // The return address to use when closing the deposit.
  return_fees  : number   // The transaction fee amount to use when closing the deposit.
  return_psig  : string   // Pre-authorization for returning the deposit.
  satpoint     : string   // The unique txid:vout of the deposit utxo.
  server_pk    : string   // The public key of the escrow server.
  server_tkn   : string   // The server token to use when creating a covenant.
  status       : DepositStatus  // The current status of the deposit.
  updated_at   : number   // UTC timestamp for when the deposit was last updated.
  utxo         : TxOutput // The unspent output to register as a deposit.
}
```

The `DepositData` interface is extended by state interfaces, each one describing a state-change:

```ts
interface DepositConfirmState {
  confirmed    : boolean        // Whether the deposit transaction is confirmed.
  block_hash   : string | null  // The hash of the confirming block.
  block_height : number | null  // The height of the confirming block.
  block_time   : number | null  // The timestamp of the confirming block.
  expires_at   : number | null  // The expiration date of the deposit.
}

interface DepositReturnState {
  closed       : boolean        // Whether the account is closed.
  closed_at    : number | null  // UTC timestamp when the deposit was closed.
  return_txid  : string | null  // The transaction id of the return transaction.
  return_txhex : string | null  // The body of the return transaction (in hex).
}

interface DepositLockState {
  locked     : boolean              // Whether the deposit is locked.
  locked_at  : number       | null  // UTC timestamp when the deposit was locked.
  covenant   : CovenantData | null  // Covenant that is locking the deposit.
}

interface DepositSpendState {
  spent       : boolean,       // Whether the deposited funds have been spent.
  spent_at    : number | null  // UTC timestamp when the deposited funds were spent.
  spent_txhex : string | null  // The body of the spending transaction (in hex).
  spent_txid  : string | null  // The transaction id for the spending transaction.
}

interface DepositSettledState {
  settled     : boolean        // Whether the deposit account has been settled.
  settled_at  : number | null  // UTC timestamp for when the account was settled.
}
```


## DepositStatus

The various states that a deposit may go through.

```ts
type DepositStatus = 
  'registered' |  // Deposit is registered. Awaiting confirmation.
  'confirmed'  |  // Deposit is confirmed and available for spending.
  'closed'     |  // Deposit is closed. Funds are returned to sender.
  'locked'     |  // Deposit is locked to a contract by a covenant.
  'spent'      |  // Deposit has been spent. Awaiting confirmation.
  'settled'    |  // Deposit is confirmed closed/spent and settled.
  'expired'    |  // Deposit has expired and must be closed or renewed.
  'error'      |  // Something went wrong. May require manual intervention.
```

## TxOutput

Data interface for an unspent transaction output (utxo).

```ts
interface TxOutput {
  txid      : string  // The id of the spending transaction
  vout      : number  // The index of the transaction output.
  value     : number  // The value of the transaction output.
  scriptkey : string  // The key or script that is locking the funds.
}
```

