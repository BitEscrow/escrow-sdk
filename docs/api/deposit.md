# Deposit API

Work in progreess. Check back later!

## Request a Deposit Account

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/deposit/request'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(account_request)
```

**Request Interface**

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

**Request Interface**

```ts
interface RegisterRequest {
  covenant    ?: CovenantData  // Covenant that locks the UTXO.
  deposit_pk   : string        // Public key of the funder making the deposit.
  return_psig ?: string        // Pre-authorization for returning the deposit.
  sequence     : number        // Locktime converted into a sequence value.
  spend_xpub   : string        // The extended key used for returning funds.
  utxo         : TxOutput      // The unspent output to register as a deposit.
}
```

**Response Interface**

```ts

```

## View Contracts by Registered Pubkey

`/api/contract/list/<pubkey>`

**Request Example**

```ts
interface goes here
```

**Response Example**

```ts
interface goes here
```

## View Contract Deposits

`/api/contract/<cid>/funds`

**Request Example**

```ts
interface goes here
```

**Response Example**

```ts
interface goes here
```

## Submit a Witness Statement

`/api/contract/<cid>/submit`

**Request Example**

```ts
interface goes here
```

**Response Example**

```ts
interface goes here
```

## View Witness Statements

`/api/contract/<cid>/witness`

**Request Example**

```ts
interface goes here
```

**Response Example**

```ts
interface goes here
```
