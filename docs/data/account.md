# Account Interfaces

List of data interfaces for the Account API.

- [AccountRequest](#account-request)
- [RegisterRequest](#register-request)
- [CommitRequest](#commit-request)
- [AccountData](#account-data)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## Account Request

The request interface for a new deposit account.

```ts
interface AccountRequest {
  deposit_pk  : string   // Public key belonging the user making the deposit.
  locktime   ?: number   // Desired locktime (in seconds) for account recovery.
  network     : ChainNetwork  // The block-chain network to use.
  return_addr : string   // The return address to use when closing the deposit.
}
```

---

## Register Request

The request interface for registering a utxo for deposit.

```ts
interface RegisterRequest {
  deposit_pk  : string        // Public key belonging the user making the deposit.
  locktime    : number        // Desired locktime (in seconds) for account recovery.
  network     : ChainNetwork  // The block-chain network to use.
  return_addr : string        // The return address to use when closing the deposit.
  return_rate : number        // The transaction feerate to use when closing the deposit.
  return_psig : string        // Pre-authorization for returning the deposit.
  server_tkn  : string        // The server token to use when creating a covenant.
  utxo        : TxOutput      // The unspent output to register as a deposit.
}
```

---

## Commit Request

The request interface for registering a utxo and commiting to a contract.

```ts
interface CommitRequest extends RegisterRequest {
  covenant : CovenantData  // A pre-signed covenant to use for locking the deposit.
}
```

---

## Account Data

The data interface for a new deposit account.

```ts
interface AccountData {
  account_hash : string        // A hash digest of the original account request.
  account_id   : string        // The hash identifier for the data record.
  agent_pk     : string        // The public key of the escrow server hosting the account.
  agent_tkn    : string        // Crypto-graphic data to use when creating a covenant.
  created_at   : number        // The UTC timestamp when the record was created.
  created_sig  : string        // A signature from the server_pk, signing the account id.
  deposit_addr : string        // The multi-sig bitcoin address for the deposit account.
  deposit_pk   : string        // The public key of the user making the deposit.
  locktime     : number        // The amount of time (in seconds) to lock the deposit.
  network      : ChainNetwork  // The block-chain network to use for this account.
  return_addr  : string        // The return address to use when closing the account.
}
```
