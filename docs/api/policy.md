# Server Policy API

## Get Server Policy

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

#### ServerConfig Interface

```ts
export interface ServerPolicy {
  contract : {
    AGENT_FEE   : number
    UPDATE_IVAL : number
  }

  deposit : {
    DEFAULT_LOCKTIME : number
    STALE_WINDOW     : number
    UPDATE_IVAL      : number
  }

  general : {
    STAMP_THOLD      : number
  }

  proposal : {
    ACTION_LIST      : string[]
    METHOD_LIST      : string[]
    DEFAULT_NETWORK  : string
    DEFAULT_DEADLINE : number
    DEFAULT_EXPIRES  : number
    MIN_DEADLINE     : number
    MAX_EFFECT       : number
    MIN_EXPIRY       : number
    MAX_EXPIRY       : number
    MIN_FEERATE      : number
    MAX_FEERATE      : number
    MIN_WINDOW       : number
    MAX_WINDOW       : number
    GRACE_PERIOD     : number
    MAX_MULTISIG     : number
  }
}

```