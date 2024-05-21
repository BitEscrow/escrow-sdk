# Server API

Reference guide for the BitEscrow Server API.

| Endpoint | Description |
|----------|-------------|
| [/api/server/keys](#get-server-keys)     | Fetch the latest server pubkeys. |
| [/api/server/policy](#get-server-policy) | Fetch the policy of the server.  |
| [/api/server/status](#get-server-status) | Fetch the status of the server.  |

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## Get Server Keys

Fetch the latest server pubkeys in rotaion.

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/keys'
```

**Response Interface**

```ts
interface ServerKeyResponse {
  data : {
    pubkeys : string[]
  }
}
```

---

## Get Server Policy

Fetch the policies and terms of the escrow server.

**Related Interfaces:**

- [ServerPolicy](../data/server.md#serverpolicy)

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/policy'
```

**Response Interface**

```ts
interface ServerPolicyResponse {
  data : {
    policy : ServerPolicy
  }
}
```

---

## Get Server Status

Fetch the current status of the server.

**Request Format**

```ts
method   : 'GET'
endpoint : '/api/status'
```

**Response Interface**

```ts
interface ServerStatusResponse {
  data : {
    status : string
  }
}
```
