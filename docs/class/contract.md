# EscrowContract

Reference guide for the `EscrowContract` class API.

- [EscrowContract Config](#escrowcontract-config)
- [EscrowContract Class](#escrowcontract-class)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## EscrowContract Config

Configuration interface for the `EscrowContract` class.

```ts
interface EscrowContractConfig {
  refresh_ival : number  = 10
  verbose      : boolean = true
}
```

## EscrowContract Class

Main interface for the `EscrowContract` class.

```ts
class EscrowContract extends EventEmitter<{
  'error' : unknown
  'fetch' : EscrowContract
  'update': EscrowContract
}> {

    static create (
      client  : EscrowClient, 
      draft   : DraftData, 
      config ?: Partial<EscrowContractConfig>
    ) : Promise<EscrowContract>

    static fetch (
      client  : EscrowClient, 
      cid     : string, 
      config ?: Partial<EscrowContractConfig>
    ) : Promise<EscrowContract>

    constructor(
      client   : EscrowClient, 
      contract : ContractData, 
      config  ?: Partial<EscrowContractConfig>
    )

    get cid        () : string
    get client     () : EscrowClient
    get data       () : ContractData
    get funds      () : DepositDigest[]
    get opt        () : EscrowContractConfig
    get is_stale   () : boolean
    get status     () : ContractStatus
    get updated_at () : number
    get vm         () : ContractVM

    cancel (
      signer : EscrowSigner
    ) : Promise<EscrowContract>

    fetch () : Promise<EscrowContract>

    poll (
      status   : ContractStatus, 
      interval : number, 
      retries  : number
    ) : Promise<EscrowContract>

    toJSON   () : ContractData
    toString () : string
}
```
