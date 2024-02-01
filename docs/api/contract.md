# Contract API

- [/api/contract/create](#create-a-contract)
- [/api/contract/list/:pubkey](#list-contracts-by-pubkey)
- [/api/contract/:cid](#read-a-contract-by-id)
- [/api/contract/:cid/cancel](#cancel-a-contract)
- [/api/contract/:cid/digest](#read-a-contract-digest-by-id)
- [/api/contract/:cid/funds](#list-funds-in-a-contract)
- [/api/contract/:cid/submit](#submit-a-witness-statement)
- [/api/contract/:cid/vm](#read-a-contract-vm-state-by-id)
- [/api/contract/:cid/witness](#list-statements-in-a-contract)

## Create a Contract

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/contract/create'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(contract_request)
```

**Request Body**

```ts
interface ContractRequest {
  proposal    : ProposalData
  signatures ?: string[]
}
```

**Response Interface**

```ts
interface ContractDataResponse {
  data : {
    contract : ContractData
  }
}
```

## List Contracts By Pubkey

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/list/:pubkey'
headers  : { 'Authorization' : 'Token ' + auth_token }
```

**Response Interface**

```ts
interface ContractListResponse {
  data : {
    contracts : ContractData[]
  }
}
```

## Read a Contract By Id

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid'
```

**Response Interface**

```ts
interface ContractDataResponse {
  data : {
    contract : ContractData
  }
}
```

## Cancel a Contract

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid/cancel'
headers  : { 'Authorization' : 'Token ' + auth_token }
```

**Response Interface**

```ts
interface ContractDataResponse {
  data : {
    contract : ContractData
  }
}
```

## List Funds in a Contract

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid/funds'
```

**Response Interface**

```ts
interface DepositListResponse {
  data : {
    deposits : DepositData[]
  }
}
```

## Read a Contract Digest By Id

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid/status'
```

**Response Interface**

```ts
interface ContractDigestResponse {
  data : {
    contract : ContractDigest
  }
}
```

## Submit a Witness Statement

**Request Format**

```ts
method   : 'POST'
endpoint : '/api/contract/:cid/submit'
headers  : { 'content-type' : 'application/json' }
body     : JSON.stringify(witness_request)
```

**Request Body**

```ts
interface WitnessRequest {
  witness : WitnessData
}
```

**Response Interface**

```ts
interface ContractDataResponse {
  data : {
    contract : ContractData
  }
}
```

## Read a Contract VM State By Id

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid/vm'
```

**Response Interface**

```ts
interface ContractVMStateResponse {
  data : {
    status     : ContractStatus
    updated_at : number
    vm_state   : StateData
  }
}
```

## List Statements in a Contract

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid/witness'
```

**Response Interface**

```ts
interface WitnessListResponse {
  data : {
    statements : WitnessData[]
  }
}
```
