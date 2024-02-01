# Deposit API

- [/api/deposit/request](#request-a-deposit-account)  
- [/api/deposit/register](#register-a-deposit)  
- [/api/deposit/commit](#commit-to-a-contract)  
- [/api/deposit/list/:pubkey](#list-deposits-by-pubkey)  
- [/api/deposit/:dpid](#read-a-deposit-by-id)  
- [/api/deposit/:dpid/digest](#read-a-deposit-digest)  
- [/api/deposit/:dpid/lock](#lock-funds-to-a-contract)  
- [/api/deposit/:dpid/close](#close-a-deposit)  

## Request a Deposit Account

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

## Register a Deposit

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

## Commit to a Contract

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

## List Deposits By Pubkey

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

## Lock Funds to a Contract

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

## Read a Deposit Digest

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

## Close a Deposit

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
