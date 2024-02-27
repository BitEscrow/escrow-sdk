# EscrowAccount

Reference guide for the `EscrowAccount` class API.

- [Config Interface](#config-interface)
- [Class Interface](#class-interface)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## Config Interface

Configuration interface for the `EscrowAccount` class.

```ts
interface EscrowAccountConfig {
  refresh_ival : number  = 10
  verbose      : boolean = true
}
```

## Class Interface

```ts
class EscrowAccount extends EventEmitter<{
  'commit'   : FundingDataResponse
  'error'    : unknown
  'fetch'    : EscrowAccount
  'payment'  : EscrowAccount
  'ready'    : EscrowAccount
  'register' : DepositDataResponse
  'reserved' : EscrowAccount
  'update'   : EscrowAccount
}> {

  constructor(
    client  : EscrowClient, 
    config ?: Partial<EscrowAccountConfig>
  )

  get id          () : string
  get client      () : EscrowClient
  get data        () : DepositAccount
  get is_funded   () : boolean
  get is_ready    () : boolean
  get is_reserved () : boolean
  get opt         () : EscrowAccountConfig
  get payments    () : OracleSpendData[]
  get req         () : AccountRequest
  get updated_at  () : number
  get utxo        () : TxOutput

  commit (
    contract : ContractData, 
    signer   : EscrowSigner, 
    utxo    ?: TxOutput
  ) : Promise<FundDataResponse>

  fetch () : Promise<DepositAccount>

  register (
    utxo ?: TxOutput
  ) : Promise<EscrowDeposit>

  request (
    signer   : EscrowSigner, 
    locktime : number, 
    index   ?: number
  ) : Promise<DepositAccount>

  poll (
    interval : number, 
    retries  : number
  ) : Promise<TxOutput>

  verify (
    signer : EscrowSigner
  ) : boolean

  toJSON   () : DepositAccount
  toString () : string
}
```
