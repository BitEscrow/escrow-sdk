# Server Keys API

## Get Server Keys

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
