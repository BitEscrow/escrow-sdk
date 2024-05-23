# EscrowSigner

Reference guide for the `EscrowSigner` API.

- [Signer Config](#signer-config)
- [Signer Interface](#signer-interface)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## Signer Config

Configuration infterface for the EscrowSigner.

```ts
interface SignerOptions {
  network    : ChainNetwork
  server_pk  : string
  server_url : string
  xpub      ?: string
}
```

## Signer Interface

Class interface for the EscrowSigner.

```ts
class EscrowSigner {
  static create (seed : Bytes, options ?: SignerOptions) => EscrowSigner

  static generate (options ?: SignerOptions): EscrowSigner

  static import (options ?: SignerOptions) : {
    from_phrase : (phrase : string, salt? : string) => EscrowSigner
    from_words  : (words : string | string[], password?: string) => EscrowSigner
  }

  static restore (password: string, payload: string, options?: SignerOptions): EscrowSigner

  static util: {
    gen_seed  : (size ?: number) => Buff
    gen_words : () => string[]
  }

  constructor (signer: ClientSignerAPI, options ?: SignerOptions)

  get network    () : ChainNetwork
  get pubkey     () : string
  get server_url () : string
  get server_pk  () : string
  get xpub       () : string

  account: {
      commit : (
        account  : AccountData,
        contract : ContractData,
        feerate  : number,
        utxo     : TxOutput
      ) => CommitRequest

      request  : (locktime : number, return_addr : string) => AccountRequest
      register : (account : AccountData, feerate : number, utxo : TxOutput) => RegisterRequest
      verify   : (account : AccountData) => string | null
  }

  contract: {
    list   : () => string
    cancel : (cid : string) => string
  }

  deposit: {
    cancel : (dpid: string) => string
    close  : (deposit: DepositData, feerate: number) => CloseRequest
    list   : () => string
    lock   : (contract: ContractData, deposit: DepositData) => LockRequest
    verify : (deposit: DepositData) => void
  }

  draft: {
    endorse   : (session: DraftSession) => DraftSession
    is_member : (session: DraftSession) => boolean
    is_role   : (role_id: string, session: DraftSession) => boolean
    is_signed : (session: DraftSession) => boolean
    join      : (pol_id: string, session: DraftSession, options?: CredentialConfig) => DraftSession
    leave     : (session: DraftSession) => DraftSession
  }

  machine: {
    list : () => string
  }

  wallet: {
    has : (account: number, address: string, limit?: number) => boolean
    get : (account: number, config?: AddressConfig) => string
    new : (account: number, config?: AddressConfig) => string
  }

  witness: {
    can_sign : (contract: ContractData, witness: WitnessData) => boolean
    create   : (vmdata: MachineData | MachineConfig, template: WitnessTemplate) => WitnessData
    endorse  : (vmdata: MachineData, witness: WitnessData) => WitnessData
    list     : () => string
  }

  backup (password : string) => string
}
```
