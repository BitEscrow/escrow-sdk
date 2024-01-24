## Signatures and Signing Devices

The entire protocol, software, and supporting libraries have been designed from the ground-up to incorprate signing devices at all costs. Every interaction with a user's private key is done with the concept of a signing device in mind, and all signature methods in the procotol **require** a signing device as input.

In addition, the protocol is designed with the assumption that the contract agent is a dirty scoundrel who will swindle your private keys away from you using the worst tricks imaginable. All signature methods in the protocol **require** a signing device to generate nonce values and perform key operations, and **zero** trust is given to any counter-party during the signing process.

Even the musig part of the protocol has been extended to require secure nonce generation *within the device* as part of the signing process.

However, since we are using state-of-the-art cryptography, there is a lack of devices out there that can deliver what we need in order to build the best escrow platform on the planet.

Therefore included as part of the escrow-core library is a reference implementation of a software-based signing device.

This purpose of this signer is to act as a place-holder in the protocol, and clearly define what interactions take place, what information is exchanged, and what cryptographic primitives are required.

```ts
class Signer {
  // Generates a signing device from a random 32-byte value.
  static generate (config ?: SignerConfig) : Signer
  // Generates a signing device from the sha-256 hash of a passphrase.
  static seed (seed : string, config ?: SignerConfig ): Signer;
  // Provides a signing device for a given secret and configuration.
  constructor(secret: Bytes, config?: SignerConfig);
  // Provides a sha256 hash of the public key.
  get id(): string;
  // Provides the x-only public key of the device.
  get pubkey(): string;
  // Derives a key-pair from a derivation path. Accepts numbers and strings.
  derive(path: string): Signer;
  // Computes a shared-secret with the provided public key/
  ecdh(pubkey: Bytes): Buff;
  // Generates a nonce value for a given message, using BIP340.
  gen_nonce(message: Bytes, options?: SignerOptions): Buff;
  // Performs an HMAC operation using the device's internal secret.
  hmac(message: Bytes): Buff;
  // Produces a musig2 partial signature using the supplied context.
  musign(context: MusigContext, auxdata: Bytes, options?: SignerOptions): Buff;
  // Produces a BIP340 schnorr signature using the provided message.
  sign(message: Bytes, options?: SignerOptions): string;
}
```

There are three main primitives that are required in order to use the protocol:

- Schnorr signatures (BIP340).
- Musig signatures (BIP327, plus BIP340 nonce generation).
- Additional tweaks during nonce generation (for the batch covenant signing).

There's also a few neat tricks planned for a future release, so the reference signer comes packed with extra goodies.

The current Signer API represents what a first-class signing device should be able to do. A future version of the API may require methods for performing internal validation, as trusting third-party software for validation of cryptographic proofs is not a good practice.

## Escrow Client

In addition to the core protocol, this repository includes a client library for communicating with our escrow server.

```ts
export default class EscrowClient {
  constructor (
    signer   : Signer, 
    options ?: ClientOptions
  )

  contract: {
    cancel : (cid: string)             => Promise<EscrowContract>,
    create : (proposal : ProposalData) => Promise<EscrowContract>,
    list   : ()                        => Promise<EscrowContract[]>
    read   : (cid: string)             => Promise<EscrowContract>
    status : (cid: string)             => Promise<EscrowContract>
  }

  covenant: {
    add    : (
      contract : ContractData | EscrowContract, 
      deposit  : DepositData  | EscrowDeposit
    ) => Promise<EscrowDeposit>
    list   : (cid : string)        => Promise<EscrowDeposit[]>
    remove : (deposit_id : string) => Promise<EscrowDeposit>
  }

  deposit: {
    close: (
      address : string, 
      deposit : DepositData | EscrowDeposit,
      txfee  ?: number | undefined
    ) => Promise<EscrowDeposit>
    create: (
      agent_id  : string, 
      agent_key : string, 
      sequence  : number,
      txid      : string,
      options  ?: DepositConfig
    ) => Promise<DepositTemplate>
    list     : () => Promise<EscrowDeposit[]>
    read     : (deposit_id : string)        => Promise<EscrowDeposit>
    register : (template : DepositTemplate) => Promise<EscrowDeposit>
    request  : (params ?: Record)           => Promise<DepositInfo>
    status   : (deposit_id : string)        => Promise<EscrowDeposit>
  }

  oracle: {
    broadcast_tx   : (txhex: string)      => Promise<Resolve<string>>
    fee_estimates  : ()                   => Promise<OracleFeeEstimate>
    get_fee_target : (target: number)     => Promise<number>
    get_tx_data    : (txid: string)       => Promise<OracleTxData | null>
    get_spend_out  : (query: OracleQuery) => Promise<OracleSpendData | null>
  }

  witness: {
      list : (cid: string) => Promise<WitnessData[]>
      read : (wid: string) => Promise<WitnessData>
      submit: (
        cid     : string, 
        witness : WitnessEntry
      ) => Promise<EscrowContract>
  }
}
```

More documentation coming soon!
