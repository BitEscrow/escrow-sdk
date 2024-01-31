# Server Status API

## Get Server Status

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
