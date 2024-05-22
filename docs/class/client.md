# EscrowClient

Reference guide for the `EscrowClient` class API.

- [Client Config](#client-configuration)
- [Client Interface](#client-interface)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## Client Configuration

Configuration infterface for the EscrowClient.

```ts
interface ClientOptions {
  hostname ?: string  // The URL to our escrow server.
  oracle   ?: string  // The URL to an electrum-based indexer of your choice.
  network  ?: string  // The network you are using.
}
```

## Client Interface

Class interface for the EscrowClient.

```ts
export declare class EscrowClient {

    constructor(opt ?: ClientOptions)

    get network()    : ChainNetwork
    get oracle()     : ChainOracle
    get server_pk()  : string
    get server_url() : string

    account: {
      commit   : (request : CommitRequest)   => Promise<ApiResponse<FundingDataResponse>>
      register : (request : RegisterRequest) => Promise<ApiResponse<DepositDataResponse>>
      request  : (
        request : AccountRequest, 
        policy ?: AccountPolicy
      ) => Promise<ApiResponse<AccountDataResponse>>
    }

    contract: {
      cancel : (cid: string, token: string) => Promise<ApiResponse<ContractDataResponse>>
      create : (
        request : ContractPublishRequest,
        engine  : ScriptEngineAPI,
        policy ?: ProposalPolicy
      ) => Promise<ApiResponse<ContractDataResponse>>
      funds  : (cid: string)   => Promise<ApiResponse<FundListResponse>>
      list   : (token: string) => Promise<ApiResponse<ContractListResponse>>
      read   : (cid: string)   => Promise<ApiResponse<ContractDataResponse>>
      verify : (session: ContractSession) => void
    }

    deposit: {
      list   : (token: string) => Promise<ApiResponse<DepositListResponse>>
      read   : (dpid: string)  => Promise<ApiResponse<DepositDataResponse>>
      lock   : (request: LockRequest)        => Promise<ApiResponse<FundingDataResponse>>
      cancel : (dpid: string, token: string) => Promise<ApiResponse<DepositDataResponse>>
      close  : (request: CloseRequest)       => Promise<ApiResponse<DepositDataResponse>>
    }

    draft: {
      create: typeof create_session
      decode: typeof decode_session
      encode: typeof encode_session
      publish: typeof publish_session
    }

    machine: {
      commits : (vmid: string)  => Promise<ApiResponse<WitnessListResponse>>
      list    : (token: string) => Promise<ApiResponse<VMListResponse>>
      read    : (vmid: string)  => Promise<ApiResponse<VMDataResponse>>
      submit  : (witness: WitnessData) => Promise<ApiResponse<VMSubmitResponse>>
    }

    server: {
      keys   : () => Promise<ApiResponse<ServerKeysResponse>>
      policy : () => Promise<ApiResponse<ServerPolicyResponse>>
      status : () => Promise<ApiResponse<ServerStatusResponse>>
    }

    witness: {
      list   : (token: string) => Promise<ApiResponse<WitnessListResponse>>
      read   : (wid: string)   => Promise<ApiResponse<WitnessDataResponse>>
      verify : (commit: WitnessCommit, vmstate: MachineData, witness: WitnessData) => void
    }

    verify_pk (pubkey: string) : void
}
```
