# Oracle Interfaces

List of data interfaces for the Oracle API.

- [OracleTxData](#oracletxdata)
- [OracleSpendData](#oraclespenddata)
- [OracleTxOutput](#txoutput)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## OracleTxData

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

interface OracleTxStatus {
  confirmed    : boolean
  block_hash   : string | null
  block_height : number | null
  block_time   : number | null
}
```

## OracleSpendData

```ts
interface OracleSpendData {
  txspend : TxOutput
  status  : OracleTxStatus
  state   : OracleSpendState
}

interface OracleTxSpendState {
  spent  : boolean
  txid   : string | null
  vin    : number | null
  status : OracleTxStatus
}
```

## TxOutput

```ts
interface TxOutput {
  txid      : string,
  vout      : number,
  value     : number,
  scriptkey : string
}
```