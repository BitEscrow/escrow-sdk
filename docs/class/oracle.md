# ChainOracle

Reference guide for the `ChainOracle` class API.

- [Oracle Interface](#oracle-interface)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## Oracle Interface

```ts
export declare class ChainOracle {

  constructor (host : string, fetcher ?: typeof fetch)

  get_tx            (txid: string)               : Promise<OracleTxData | null>
  get_tx_status     (txid: string)               : Promise<OracleTxStatus | null>
  get_outspend      (txid: string, vout: number) : Promise<OracleOutSpend>
  get_utxo_data     (txid: string, vout: number) : Promise<OracleUtxoData | null>
  get_first_utxo    (address: string)            : Promise<OracleUtxoData | null>
  broadcast_tx      (txhex: string)              : Promise<string>
  get_fee_target    (target: number)             : Promise<number>
  get_address_utxos (address: string)            : Promise<OracleUtxoData[]>
  get_fee_estimates ()                           : Promise<OracleFeeEstimate>

  poll_address (
    address: string,
    interval: number,
    retries: number, 
    callback?: (address: string, tries: number) => Promise<void>
  ) : Promise<OracleUtxoData>
}
```
