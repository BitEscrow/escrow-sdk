# Server Wiki

This documentation covers connecting to the BitEscrow server.

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## Connecting to our Server

BitEscrow currently provides an escrow server for the `signet`, `testnet`, and `mutiny` networks. Check out our list of client configurations below.

For more information on setting up an EscrowClient, [click here](./client.md).

### Mutiny Configuration

To connect your EscrowClient to our `mutiny` server, use the following config:

```ts
const config = {
  hostname : 'https://bitescrow-mutiny.vercel.app',
  oracle   : 'https://mutinynet.com',
  network  : 'mutiny'
}
```

### Signet Configuration

To connect your EscrowClient to our `signet` server, use the following config:

```ts
const config = {
  hostname : 'https://bitescrow-signet.vercel.app',
  oracle   : 'https://mempool.space/signet',
  network  : 'signet'
}
```

### Testnet Configuration

To connect your EscrowClient to our `testnet` server, use the following config:

```ts
const config = {
  hostname : 'https://bitescrow-testnet.vercel.app',
  oracle   : 'https://mempool.space/testnet',
  network  : 'testnet'
}
```
