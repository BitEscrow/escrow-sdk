# Oracle Interfaces

List of data interfaces for the Oracle API.

- [OracleTxData](#oracle-tx-data)
- [OracleTxStatus](#oracle-tx-status)
- [OracleOutspend](#oracle-outspend)
- [OracleUtxoData](#oracle-utxo-data)
- [TxOutput](#tx-output)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## Oracle Tx Data

Data interface for a transaction data object.

```ts
interface OracleTxData {
  txid     : string
  version  : number,
  locktime : number
  vin      : OracleTxIn[]
  vout     : OracleTxOut[]
  size     : number
  weight   : number
  fee      : number
  status   : OracleTxStatus
}

interface OracleTxIn {
  txid          : string
  vout          : number
  prevout       : OracleTxOut | null
  scriptsig     : string
  scriptsig_asm : string
  witness       : string[]
  sequence      : number
  is_coinbase   : boolean
}

interface OracleTxOut {
  scriptpubkey          : string
  scriptpubkey_asm      : string
  scriptpubkey_type     : string
  scriptpubkey_address ?: string
  value                 : number
}
```

---

## Oracle Tx Status

Data interface for transaction confirmation status.

```ts
interface OracleTxStatus {
  confirmed    : boolean
  block_hash   : string | null
  block_height : number | null
  block_time   : number | null
}
```

---

## Oracle Outspend

Data interface for transaction output spend state.

```ts
interface UtxoSpent {
  spent  : boolean
  txid   : string | null
  vin    : number | null
  status : OracleTxStatus
}
```

---

## Oracle Utxo Data

Data interface for an unspent transaction output.

```ts
interface OracleUtxoData {
  status : OracleTxStatus
  utxo   : TxOutput
}
```

---

## Tx Output

Data interface for a transaction ouput.

```ts
interface TxOutput {
  txid      : string,
  vout      : number,
  value     : number,
  scriptkey : string
}
```
