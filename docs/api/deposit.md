# Deposit API

Reference guide for the BitEscrow Deposit API. Click on the links below to navigate:

- [/api/deposit/request](#request-a-deposit-account)
- [/api/deposit/register](#register-a-deposit)
- [/api/deposit/commit](#commit-to-a-contract)
- [/api/deposit/list/:pubkey](#list-deposits-by-pubkey)
- [/api/deposit/:dpid](#read-a-deposit-by-id)
- [/api/deposit/:dpid/digest](#read-a-deposit-digest)
- [/api/deposit/:dpid/lock](#lock-funds-to-a-contract)
- [/api/deposit/:dpid/status](#read-a-deposit-status)
- [/api/deposit/:dpid/close](#close-a-deposit)

> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

## Request a Deposit Account

Request a new deposit account from the escrow server.

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/deposit/request'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(account_request)
```

**Request Body**

```ts
interface AccountRequest {
  deposit_pk : string  // Public key of the funder making the deposit.
  locktime  ?: number  // Desired locktime (in seconds) for the deposit.
  spend_xpub : string  // The extended key used for returning funds.
}
```

**Response Interface**

```ts
interface AccountDataResponse {
  data : {
    account : DepositAccount
  }
}
```

****Related Interfaces:****

- [DepositAccount](../data/deposit.md#depositaccount)

## Register a Deposit

Register a utxo in the blockchain/mempool with a deposit account.

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/deposit/register'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(register_request)
```

**Request Body**

```ts
interface RegisterRequest {
  deposit_pk  : string        // Public key of the funder making the deposit.
  return_psig : string        // Pre-authorization for returning the deposit.
  sequence    : number        // Locktime converted into a sequence value.
  spend_xpub  : string        // The extended key used for returning funds.
  utxo        : TxOutput      // The unspent output to register as a deposit.
}
```

**Response Interface**

```ts
interface DepositDataResponse {
  data : {
    deposit : DepositData
  }
}
```

**Related Interfaces:**

- [DepositData](../data/deposit.md#depositdata)
- [TxOutput](../data/oracle.md#txoutput)

## Commit to a Contract

Register and commit a utxo in the blockchain/mempool to a contract.

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/deposit/commit'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(commit_request)
```

**Request Body**

```ts
interface CommitRequest extends RegisterRequest {
  covenant    : CovenantData  // Covenant that locks the UTXO.
  deposit_pk  : string        // Public key of the funder making the deposit.
  return_psig : string        // Pre-authorization for returning the deposit.
  sequence    : number        // Locktime converted into a sequence value.
  spend_xpub  : string        // The extended key used for returning funds.
  utxo        : TxOutput      // The unspent output to register as a deposit.
}
```

**Response Interface**

```ts
interface FundDataResponse {
  data : {
    contract : ContractData
    deposit  : DepositData
  }
}
```

**Related Interfaces:**

- [ContractData](../data/contract.md#contractdata)
- [CovenantData](../data/deposit.md#covenantdata)
- [DepositData](../data/deposit.md#depositdata)
- [TxOutput](../data/oracle.md#txoutput)

## List Deposits By Pubkey

Request a list of deposits that are tagged by a specific pubkey.

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/deposit/:pubkey'
headers  : { 'Authorization' : 'Token ' + auth_token }
```

**Response Interface**

```ts
interface DepositListResponse {
  data : {
    deposits : DepositData[]
  }
}
```

**Related Interfaces:**

- [DepositData](../data/deposit.md#depositdata)

## Lock Funds to a Contract

Lock an existing deposit account to a contract.

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/deposit/:dpid/lock'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(lock_request)
```

**Request Body**

```ts
interface LockRequest {
  covenant : CovenantData  // Covenant that locks the UTXO.
}
```

**Response Interface**

```ts
interface FundDataResponse {
  data : {
    contract : ContractData
    deposit  : DepositData
  }
}
```

**Related Interfaces:**

- [ContractData](../data/contract.md#contractdata)
- [CovenantData](../data/deposit.md#covenantdata)
- [DepositData](../data/deposit.md#depositdata)

## Read a Deposit Status

Fetch a contract's current status via the contract id (cid).

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/deposit/:dpid/status'
```

**Response Interface**

```ts
export interface DepositStatusResponse {
  data: {
    deposit : {
      status     : DepositStatus
      updated_at : number
    }
  }
}
```

Related Interfaces:

- [DepositStatus](../data/deposit.md#depositstatus)

## Read a Deposit Digest

Fetch a more compact version of the deposit (for polling).

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/deposit/:dpid/digest'
```

**Response Interface**

```ts
interface DepositDigestResponse {
  data : {
    deposit : DepositDigest
  }
}
```

**Related Interfaces:**

- [DepositDigest](../data/deposit.md#depositdigest)

## Close a Deposit

Close a deposit account and return funds to the registered xpub.

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/deposit/:dpid/close'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(close_request)
```

**Request Body**

```ts
export interface CloseRequest {
  pnonce : string  // The publice nonce used for signing.
  psig   : string  // The partial signature for spending.
  txfee  : number  // The transaction fee used in the tx.
}
```

**Response Interface**

```ts
interface DepositDataResponse {
  data : {
    deposit : DepositData
  }
}
```

**Related Interfaces:**

- [DepositData](../data/deposit.md#depositdata)
