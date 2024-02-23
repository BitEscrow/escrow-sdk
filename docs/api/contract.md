# Contract API

Reference guide for the BitEscrow Contract API. Click on the links below to navigate:

| Endpoint | Description |
|----------|-------------|
| [/api/contract/create](#create-a-contract)                   | Create a new contract on the escrow server. |
| [/api/contract/list/:pubkey](#list-contracts-by-pubkey)      | List contracts by pubkey. |
| [/api/contract/:cid](#read-a-contract-by-id)                 | Read a contract via ID. |
| [/api/contract/:cid/cancel](#cancel-a-contract)              | Cancel a contract. |
| [/api/contract/:cid/digest](#read-a-contract-digest)         | Read a digest of a contract. |
| [/api/contract/:cid/funds](#list-funds-in-a-contract)        | List the funds deposited in a contract. |
| [/api/contract/:cid/status](#read-a-contract-status)         | Fetch a contract's current status via the contract id (cid). |
| [/api/contract/:cid/submit](#submit-a-witness-statement)     | Submit a witness statement to the contract VM. |
| [/api/contract/:cid/vmstate](#read-a-contract-vm-state)      | Fetch a contract's machine state via the contract id (cid). |
| [/api/contract/:cid/witness](#list-statements-in-a-contract) | Request all recorded witness statements for a contract. |

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## Create a Contract

Create a new contract on the escrow server.

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
  members     : MemberData[]
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

**Example Request**

```ts
import { client } from '@scrow/demo/01_create_client.js'
import { draft }  from '@scrow/demo/04_finish_draft.js'

// Deliver proposal and endorsements to server.
const res = await client.contract.create(draft)
// Check if response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our published contract.
const new_contract = res.data.contract
```

> You can run this in our live [replit instance](https://replit.com/@cscottdev/escrow-core) using:  
> `yarn load demo/api/contract/create`

**Example Response**

- [JSON Data](../examples/contract_data.md)

**Related Interfaces**

- [ProposalData](../data/draft.md#proposaldata)
- [ContractData](../data/contract.md#contractdata)

## List Contracts By Pubkey

Request a list of contracts that are tagged by a specific pubkey.

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

**Example Request**

```ts
import { client }  from '@scrow/demo/01_create_client.js'
import { signers } from '@scrow/demo/02_create_signer.js'

// Select a signer to use.
const signer = signers[0]
// Generate a request token.
const req = signer.request.contract_list()
// Deliver the request and token.
const res = await client.contract.list(signer.pubkey, req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack our data payload.
const contracts = res.data.contracts
```

> You can run this in our live [replit instance](https://replit.com/@cscottdev/escrow-core) using:  
> `yarn load demo/api/contract/list`

**Example Response**

- [JSON Data](../examples/contract_list.md)

**Related Interfaces**

- [ContractData](../data/contract.md#contractdata)

## Read a Contract By Id

Fetch a contract from the server by its contract id (cid).

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

**Example Request**

```ts
import { client }       from '@scrow/demo/01_create_client.js'
import { new_contract } from '@scrow/demo/05_create_contract.js'

// Define the contract id we will use.
const cid = new_contract.cid
// Fetch a contract from the server by cid.
const res = await client.contract.read(cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const contract = res.data.contract
```

> You can run this in our live [replit instance](https://replit.com/@cscottdev/escrow-core) using:  
> `yarn load demo/api/contract/read`

**Example Response**

- [JSON Data](../examples/contract_data.md)

**Related Interfaces**

- [ContractData](../data/contract.md#contractdata)

## Cancel a Contract

Request to cancel a contract (must be the moderator).

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

**Example Code**

```ts
import { client }              from '@scrow/demo/01_create_client.js'
import { moderator as signer } from '@scrow/demo/03_build_proposal.js'
import { new_contract }        from '@scrow/demo/05_create_contract.js'

// Define the contract id we will cancel.
const cid = new_contract.cid
// Generate an auth token from the moderator's signer.
const req = signer.request.contract_cancel(cid)
// Send the cancel request, along with the auth token.
const res = await client.contract.cancel(cid, req)
// If the request fails, throw an error.
if (!res.ok) throw new Error(res.error)
// Unwrap our response payload.
const canceled_contract = res.data.contract
```

> You can run this in our live [replit instance](https://replit.com/@cscottdev/escrow-core) using:  
> `yarn load demo/api/contract/cancel`

**Example Response**

- [JSON Data](../examples/contract_canceled.md)

**Related Interfaces:**

- [ContractData](../data/contract.md#contractdata)

## Read a Contract Digest

Fetch a more compact version of the contract (for polling).

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid/digest'
```

**Response Interface**

```ts
interface ContractDigestResponse {
  data : {
    contract : ContractDigest
  }
}
```

**Example Request**

```ts
import { client }       from '@scrow/demo/01_create_client.js'
import { new_contract } from '@scrow/demo/05_create_contract.js'

// Define the contract id we will use.
const cid = new_contract.cid
// Fetch a contract from the server by cid.
const res = await client.contract.digest(cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const contract = res.data.contract
```

> You can run this in our live [replit instance](https://replit.com/@cscottdev/escrow-core) using:  
> `yarn load demo/api/contract/digest`

**Example Response**

- [JSON Data](../examples/contract_digest.md)

**Related Interfaces:**

- [ContractDigest](../data/contract.md#contractdigest)

## Read a Contract Status

Fetch a contract's current status via the contract id (cid).

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid/status'
```

**Response Interface**

```ts
export interface ContractStatusResponse {
  data : {
    contract : {
      status     : ContractStatus
      updated_at : number
    }
  }
}
```

**Example Code**

```ts
import { client }       from '@scrow/demo/01_create_client.js'
import { new_contract } from '@scrow/demo/05_create_contract.js'

// Define the contract id we will use.
const cid = new_contract.cid
// Fetch a contract from the server by cid.
const res = await client.contract.status(cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const status = res.data.contract
```

> You can run this in our live [replit instance](https://replit.com/@cscottdev/escrow-core) using:  
> `yarn load demo/api/contract/status`

**Example Response**

- [JSON Data](../examples/contract_status.md)

**Related Interfaces**

- [ContractStatus](../data/contract.md#contractstatus)

## Submit a Witness Statement

Submit a witness statement to the contract VM.

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

**Example Request**

```ts
import { client }          from '@scrow/demo/01_create_client.js'
import { signers }         from '@scrow/demo/02_create_signer.js'
import { active_contract } from '@scrow/demo/08_check_contract.js'

// Unpack our list of signers.
const [ a_signer, b_signer ] = signers
// Create a statement template.
const template = {
  action : 'close',
  method : 'endorse',
  path   : 'tails'
}
// Initialize a variable for our witness data.
let witness : WitnessData
// Alice signs the initial statement.
witness = a_signer.witness.sign(active_contract, template)
// Bob endoreses the statement from Alice.
witness = b_signer.witness.endorse(active_contract, witness)
// Define the contract id we will use.
const cid = active_contract.cid
// Submit the signed statement to the server.
const res = await client.contract.submit(cid, witness)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the contract from the response.
const updated_contract = res.data.contract
```

> You can run this in our live [replit instance](https://replit.com/@cscottdev/escrow-core) using:  
> `yarn load demo/api/contract/submit`

**Example Response**

- [JSON Data](../examples/contract_active.md)

**Related Interfaces:**

- [ContractData](../data/contract.md#contractdata)
- [WitnessData](../data/witness.md#witnessdata)

## Read a Contract VM State

Fetch a contract's machine state via the contract id (cid).

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/contract/:cid/vmstate'
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

**Example Request**

```ts
import { client }          from '@scrow/demo/01_create_client.js'
import { active_contract } from '@scrow/demo/08_check_contract.js'

// Define the contract id we will use.
const cid = active_contract.cid
// Fetch a contract's vm state from the server via cid.
const res = await client.contract.vmstate(cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const vm_state = res.data.vm_state
```

> You can run this in our live [replit instance](https://replit.com/@cscottdev/escrow-core) using:  
> `yarn load demo/api/contract/vmstate`

**Example Response**

- [JSON Data](../examples/contract_vm.md)

**Related Interfaces**

- [ContractStatus](../data/contract.md#contractstatus)
- [StateData](../data/contract.md#statedata)

## List Statements in a Contract

Request all recorded witness statements for a contract.

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

**Example Request**

```ts
import { client }           from '@scrow/demo/01_create_client.js'
import { settled_contract } from '@scrow/demo/09_settle_contract.js'

// Define the contract id we will use.
const cid = settled_contract.cid
// Fetch a contract from the server by cid.
const res = await client.contract.witness(cid)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)
// Unpack the data object.
const statements = res.data.statements
```

> You can run this in our live [replit instance](https://replit.com/@cscottdev/escrow-core) using:  
> `yarn load demo/api/contract/witness`

**Example Response**

- [JSON Data](../examples/witness_list.md)

**Related Interfaces:**

- [WitnessData](../data/witness.md#witnessdata)
