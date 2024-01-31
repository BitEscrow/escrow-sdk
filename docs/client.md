# EscrowClient Docs

The `EscrowClient` is a basic client for consuming our API. It is designed to be used for any tasks which do not require an identity or signature.

**Sections**

1. [How to Use](#how-to-use)
2. [Selecting a Network](#selecting-a-network)
3. [Selecting an Oracle](#selecting-an-oracle)

**Interfaces**

- [ClientConfig](#clientconfig)
- [EscrowClient](#escrowclient)

## How to Use

To create a client, simply specify a configuration, then call `new EscrowClient`:

```ts
import { EscrowClient } from '@scrow/core/client'

const client_config = {
  // The URL to our escrow server.
  hostname : 'https://bitescrow-signet.vercel.app',
  // The URL to an electrum-based indexer of your choice.
  oracle   : 'https://mempool.space/signet',
  // The network you are using.
  network  : 'signet'
}

// Create an EscrowClient using the above config.
const client = new EscrowClient(client_config)
```

## Selecting a Network

We have an escrow server running for `signet`, `testnet` and `mutinynet`.

To see an updated list of our servers that you can connect to, [click here.](../demo/00_demo_config.ts)

## Selecting an Oracle

An oracle server is used to fetch information about the blockchain.

The OracleAPI is based on the electrum API specification, so any electrum-based server API should work as an oracle server.

To see a recommended list of oracles to use, [click here.](../demo/00_demo_config.ts)

To see a complete list of interfaces for the OracleAPI, [click here.](../src/types/oracle.ts)

## Interfaces

#### ClientConfig

```ts
interface ClientConfig {
  hostname ?: string  // The URL to our escrow server.
  oracle   ?: string  // The URL to an electrum-based indexer of your choice.
  network  ?: string  // The network you are using.
}
```

#### EscrowClient

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