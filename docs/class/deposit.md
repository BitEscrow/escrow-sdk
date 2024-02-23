# EscrowDeposit

Reference guide for the `EscrowDeposit` class API.

- [EscrowDeposit Config](#escrowdeposit-config)
- [EscrowDeposit Class](#escrowdeposit-class)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## EscrowDeposit Config

Configuration interface for the `EscrowDeposit` class.

```ts
interface EscrowDepositConfig {
  refresh_ival : number  = 10
  verbose      : boolean = true
}
```

## EscrowDeposit Class

Main interface for the `EscrowDeposit` class.

```ts
class EscrowDeposit extends EventEmitter<{
  'error' : unknown
  'fetch' : EscrowDeposit
  'update': EscrowDeposit
}> {

    static create (
      client  : EscrowClient, 
      draft   : DraftData, 
      config ?: Partial<EscrowDepositConfig>
    ) : Promise<EscrowDeposit>

    static fetch (
      client  : EscrowClient, 
      cid     : string, 
      config ?: Partial<EscrowDepositConfig>
    ) : Promise<EscrowDeposit>

    constructor(
      client   : EscrowClient, 
      contract : ContractData, 
      config  ?: Partial<EscrowDepositConfig>
    )

    get dpid       () : string
    get client     () : EscrowClient
    get data       () : DepositData
    get opt        () : EscrowDepositConfig
    get is_stale   () : boolean
    get status     () : DepositStatus
    get updated_at () : number

    close (
      signer : EscrowSigner
    ) : Promise<EscrowDeposit>

    fetch () : Promise<EscrowDeposit>

    poll (
      status   : DepositStatus, 
      interval : number, 
      retries  : number
    ) : Promise<EscrowDeposit>

    toJSON   () : ContractData
    toString () : string
}
```
