# EscrowSigner

Reference guide for the `EscrowSigner` API.

- [Configuration](#configuration)
- [Class Interface](#class-interface)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## Configuration

Configuration infterface for the EscrowSigner.

```ts
interface SignerConfig extends ClientConfig {
  // Specify a pubkey from the escrow server.
  // Used for verifying signed payloads.
  host_pubkey? : string
  // Specify a custom index counter to use
  // when generating an anonymous credential.      
  idxgen? : () => number   
  // Specify a SignerAPI interface to use for
  // signing operations (with credential support).
  signer : CredSignerAPI
  // Specify a WalletAPI interface to use for
  // generating accounts and addresses.
  wallet : WalletAPI
}
```

## Class Interface

Class interface for the EscrowSigner.

```ts
class EscrowSigner {

  /**
   * Create an EscrowSigner from a seed and 
   * optional xpub.
   */
  static create (
    config : Partial<SignerConfig>, 
    seed   : Bytes,
    xpub?  : string
  ) : EscrowSigner

  /**
   * Generate a new EscrowSigner from a random
   * seed. Be careful with this one, the seed
   * is never revealed and cannot be restored.
   */
  static generate (
    config : Partial<SignerConfig>,
    xpub  ?: string
  ) : EscrowSigner

  /**
   * Create an EscrowSigner from an imported
   * seed, using a passphrase or BIP39 word list.
   */
  static import (
    config : Partial<SignerConfig>,
    xpub  ?: string
  ) : {
    from_phrase : (
      phrase : string, 
      salt  ?: string
    ) => EscrowSigner,
    from_words : (
      words     : string | string[], 
      password ?: string
    ) => EscrowSigner
  }

  /**
   * Load an existing EscrowSigner that has 
   * been encrypted with a password.
   */
  static load (
    config   : Partial<SignerConfig>, 
    password : string, 
    payload  : string
  ) : EscrowSigner

  static util = {
    // Generate a random seed.
    gen_seed  : (size ?: number) => Bytes,
    // Generate a random BIP39 word list.
    gen_words : (size ?: number) => string[]
  }

  // Constructor
  constructor(config : SignerConfig)

  // Each EscrowSigner includes a client.
  get client   () : EscrowClient
  // The pubkey of the escrow server.
  get host_pub () : string | undefined
  // The network configured on the signer.
  get network  () : ChainNetwork
  // The pubkey of the signer.
  get pubkey   () : string

  /**
   * Deposit operations.
   */
  deposit : {
    // Generate an account request that will
    // be delivered to the escrow server.
    request_account (
      locktime : number, 
      index?   : number | undefined
    ) : AccountRequest

    // Verify the details of an account that
    // has been issued to you.
    verify_account (account : DepositAccount) : void
    
    // Generate a covenant that locks your new 
    // deposit utxo to a contract.
    commit_utxo (
      account  : DepositAccount, 
      contract : ContractData, 
      utxo     : TxOutput
    ) : CovenantData

    // Generate a covenant that locks your existing
    // deposit utxo to a contract.
    commit_deposit (
      contract : ContractData, 
      deposit  : DepositData
    ) : CovenantData

    // Close a deposit account and have the funds
    // returned to your xpub.
    close_account (
      deposit : DepositData,
      txfee   : number
    ) : string
  }

  /**
   * Credential operations.
   */
  membership : {
    // Generate an anonymous credential for use in a proposal.
    generate (index? : number | undefined) : MemberData
    // Check if an anonymous credential exists for your device.
    exists (proposal : ProposalData) : boolean
    // Claim an existing credential and use it for signing.
    claim (proposal : ProposalData) : Membership
  }

  /**
   * Proposal operations.
   */
  proposal: {
    // Join a proposal as the given role. A new anonymous
    // credential is generated and used to assume the role.
    join (
      proposal : ProposalData,
      role     : RolePolicy,
      index?   : number | undefined
    ) : ProposalData
    // Remove your credential and all its data from a proposal.
    leave (proposal : ProposalData) : ProposalData
    // Check if you device is already a member of the proposal.
    is_member (proposal : ProposalData) : boolean
    // Produce a signature from your main device that endorses
    // the proposal. Does not reveal which credential is yours.
    endorse (proposal : ProposalData) : string
  }

  /**
   * Networtk request operations.
   */
  request: {
    // Generate an auth token for requesting a list of 
    // contracts endorsed by your device.
    contracts () : string
    // Generate an auth token for requesting a list of 
    // deposits created by your device.
    deposits  () : string
    // Generate an auth token for a custom request.
    get_token (
      url     : string, 
      body?   : string, 
      method? : string
    ) : string
  }

  /**
   * Witness statement operations.
   */
  witness : {
    // Check if the provided statement is valid 
    // and your device has authority to sign it.
    can_sign (
      contract : ContractData, 
      template : WitnessData | WitnessTemplate
    ) : boolean
    // Create and sign a statement based on the 
    // provided arguments in the witness template.
    sign (
      contract : ContractData, 
      template : WitnessTemplate
    ) : WitnessData
    // Sign an existing witness statement and 
    // append your signature to the statement.
    endorse (
      contract : ContractData, 
      witness  : WitnessData
    ) : WitnessData
  }

  // Check if an xpub belongs to your wallet.
  has_account (xpub : string) : boolean
  // Generate a child xpub from your wallet.
  get_account (idx? : number) : WalletAPI
  // Save your current signer as an encrypted file.
  save (password : string) : string
}

```
