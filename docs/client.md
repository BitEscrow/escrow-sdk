# EscrowClient Docs

The `EscrowClient` is a basic client for consuming our API. It has access to all endpoints offered by the escrow server.

> The client does not include a signing device. For signing operations, see [EscrowSigner](./signer.md).

**Sections**

1. [How to Use](#how-to-use)
2. [Selecting a Network](#selecting-a-network)
3. [Selecting an Oracle](#selecting-an-oracle)

**Interfaces**

- [EscrowClient](./class/client.md)

## How to Use

To create a client, simply specify a configuration, then call _new EscrowClient_:

```ts
import { EscrowClient } from '@scrow/core/client'

const client_config = {
  // The URL to our escrow server.
  hostname : 'https://bitescrow-signet.vercel.app',
  // The URL to an electrum-based indexer of your choice.
  oracle   : 'https://mempool.space/signet',
  // The network you are using.
  network  : 'signet'
}

// Create an EscrowClient using the above config.
const client = new EscrowClient(client_config)
```

## Selecting a Network

We have an escrow server running for `signet`, `testnet` and `mutinynet`.

To see an updated list of our servers that you can connect to, [click here.](../demo/00_demo_config.ts)

## Selecting an Oracle

An oracle server is used to fetch information about the blockchain.

The OracleAPI is based on the electrum API specification, so any electrum-based server API should work as an oracle server.

To see a recommended list of oracles to use, [click here.](../demo/00_demo_config.ts)

To see a complete list of interfaces for the OracleAPI, [click here.](../src/types/oracle.ts)
