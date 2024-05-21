# Signer Wiki

The `EscrowSigner` is used to represent you and other members in a contract. It manages your credentials, deposit accounts, proposal negotiation, and interactions with a contract.

**Sections**

1. [Generate a Signer](#generate-a-signer)
2. [Importing a Seed](#importing-a-seed)
3. [Backup and Restore](#backup-and-restore)
4. [Using an Extention or App](#using-an-extention-or-app)
5. [Using an Offline Device](#using-an-offline-device)

**Interfaces**

- [EscrowSigner](../class/signer.md)

---
> Notice any mistakes, or something missing? Please let us know!  
> You can submit an issue here: [Submit Issue](https://github.com/BitEscrow/escrow-core/issues/new/choose)

---

## Generate a Signer

The fastest way to setup a new `EscrowSigner` is to generate one randomly:

```ts
import { EscrowSigner } from '@scrow/core/client'

const config = {
  hostname : 'https://bitescrow-signet.vercel.app',
  oracle   : 'https://mempool.space/signet',
  network  : 'signet'
}

const signer = EscrowSigner.generate(config)
```

> Note: Be careful when using generated signers, as the seed is not recoverable!

## Importing a Seed

If you have an existing seed or secret key, you can import it using one of the options below:

```ts
// Importing from BIP39 seed words.
const words  = [ 'your', 'bip39', 'seed', 'words' ]
const pass   = 'optional BIP39 password'
const xpub   = 'your xpub goes here'
const signer = EscrowSigner
  .import(client_config, xpub)
  .from_words(words, pass)
```

```ts
// Importing from a passphrase and salt.
const phrase = 'your passphrase goes here'
const salt   = 'your salt here'
const xpub   = 'your xpub goes here'
const signer = EscrowSigner
  .import(client_config, xpub)
  .from_phrase(phrase, salt)
```

```ts
// Importing from a raw seed.
const seed   = 'your seed hexstring goes here'
const xpub   = 'your xpub goes here'
const signer = EscrowSigner.create(client_config, seed, xpub)
```

> Note: If you need to generate seed words or raw bytes, check out `EscrowSigner.util`.

## Backup and Restore

You can use the `save` and `load` methods in order to backup and restore an `EscrowSigner` device. Both methods will take a password, which is used to encrypt and decrypt the backup file.

```ts
const [ alice_signer ] = signers
// Define a password.
const password = 'your password here'
// Save the signer to an encrypted backup file.
const backup   = signer.save(password)
// Retore the signer from the file, with the provided configuration.
const signer   = EscrowSigner.load(client_config, password, backup)
```

## Using an Extention or App

The `EscrowSigner` is built to plug into a more basic `SignerAPI` and `WalletAPI`, which can be hosted in a browser extension or external software application.

```ts
import { EscrowSigner, Signer, Wallet } from '@scrow/core/client'

// These are created outside the browser, and provided
// through the browser window object.
const signer_api = new Signer({ seed : 'your seed' })
const wallet_api = new Wallet('your_xpub')

const config = {
  hostname : 'https://bitescrow-signet.vercel.app',
  oracle   : 'https://mempool.space/signet',
  network  : 'signet',
  signer   : signer_api,
  wallet   : wallet_api
}

const signer = new EscrowSigner(config)
```

We are planning to release an official signing extension in the near future, but feel free to take our code and make your own!

## Using an Offline Device

The `EscrowSigner` can be used in an offline environment, such as a hardware device. Interactions between the signer and escrow server are indirect and can pass-through a third-party intermediary safely.

An optional `host_pubkey` can be set in order to verify payloads that are signed and sent by the escrow server.
