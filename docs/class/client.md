# EscrowClient

Reference guide for the `EscrowClient` class API.

- [Configuration](#configuration)
- [Class Interface](#class-interface)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## Configuration

Configuration infterface for the EscrowClient.

```ts
interface ClientConfig {
  hostname ?: string  // The URL to our escrow server.
  oracle   ?: string  // The URL to an electrum-based indexer of your choice.
  network  ?: string  // The network you are using.
}
```

## Class Interface

Class interface for the EscrowClient.

```ts
class EscrowClient {
  // Readonly properties
  readonly _fetcher  : Resolver
  readonly _host     : string
  readonly _oracle   : string
  readonly _network  : Network

  // Constructor
  constructor(config: ClientConfig)

  // Getter methods
  get fetcher() : <T>(config: FetchConfig) => Promise<ApiResponse<T>>
  get host()    : string
  get network() : Network

  // Contract operations
  contract: {
    create   : (proposal: ProposalData, signatures?: string[] | undefined) => Promise<ApiResponse<ContractDataResponse>>
    funds    : (cid: string) => Promise<ApiResponse<DepositListResponse>>
    list     : (pubkey: string, token: string) => Promise<ApiResponse<ContractListResponse>>
    read     : (cid: string) => Promise<ApiResponse<ContractDataResponse>>
    submit   : (cid: string, witness: WitnessData) => Promise<ApiResponse<ContractDataResponse>>
    witness  : (cid: string) => Promise<ApiResponse<WitnessListResponse>>
  }

  // Deposit operations
  deposit: {
    read      : (dpid: string) => Promise<ApiResponse<DepositDataResponse>>
    list      : (pubkey: string, token: string) => Promise<ApiResponse<DepositListResponse>>
    commit    : (dpid: string, covenant: CovenantData) => Promise<ApiResponse<FundingDataResponse>>
    fund      : (request: RegisterRequest) => Promise<ApiResponse<FundingDataResponse>>
    register  : (request: RegisterRequest) => Promise<ApiResponse<DepositDataResponse>>
    request   : (request: AccountRequest) => Promise<ApiResponse<AccountDataResponse>>
    close     : (dpid: string, req: SpendRequest) => Promise<ApiResponse<DepositDataResponse>>
  }

  // Oracle operations
  oracle: {
    broadcast_tx    : (txhex: string) => Promise<ApiResponse<string>>
    fee_estimates   : () => Promise<OracleFeeEstimate>
    fee_target      : (target: number) => Promise<number>
    get_txdata      : (txid: string) => Promise<OracleTxData | null>
    get_utxo        : (query: OracleQuery) => Promise<OracleSpendData | null>
    get_address_utxos: (address: string) => Promise<OracleSpendData[]>
  }

  // Witness operations
  witness: {
    read: (wid: string) => Promise<ApiResponse<WitnessDataResponse>>
  }

  // Serialization methods
  toJSON()   : { host: string }
  toString() : string
}
```
