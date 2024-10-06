[![Integration Tests](https://github.com/BitEscrow/escrow-core/actions/workflows/integration.yml/badge.svg?branch=master)](https://github.com/BitEscrow/escrow-core/actions/workflows/integration.yml)

> If you are looking to use the BitEscrow API, check out our [Developer Documentation](https://bitescrow.dev) resources and [Replit Container](https://replit.com/@cscottdev/escrow-core).

# escrow-sdk

A software development kit for implementing the BitEscrow protocol: a secure, private protocol for locking Bitcoin to a smart contract, with non-custodial escrow of funds.

Protocol Features:

  * __100% private.__ Users only need a random signing key (hot), and wallet xpub (cold) to participate. All on-chain transactions are script-less key spends. No meta-data is exposed.

  * __100% auditable.__ All contract operations are committed into a hash-chain, signed by the escrow agent, and provided as receipt. All contract execution is independently verifiable.

  * __100% non-custodial.__ Money is secured in a time-locked 2-of-2 contract that returns to sender. All spending transactions are signed up-front. The escrow agent has zero discretion over spending.

  * __Designed for trustless environments.__ Signing keys are separated from address generation, with zero capacity to sweep funds. Keys can be made ephemeral, and recoverable from the user's xpub.

  * __Designed to be robust.__ Deposits can be reused whenever a contract cancels or expires. Refund transactions are secured upfront and broadcast automatically on expiration.

  * __Designed to scale.__ Deposits can be locked/released from a contract without being spent. Contracts have the option to settle or expire without an on-chain transaction.

SDK Features:

  * Full suite of tools for executing and verifying every part of the protocol.
  * A multi-platform client and signing device (with minimal dependencies).
  * Strict type interfaces with run-time schema validation (using zod).
  * E2E demo and test suite for signet, testnet, and mutiny networks.

Roadmap:

  * An adjustable virtual (off-chain) output for the escrow channel.
  * Deposit / withdraw methods for the escrow channel.
  * Support for updating contracts that are active.
  * Support for running a federation of escrow servers (via FROST).

## How It Works

If you would like an introduction to the protocol and how it works, check out the [How It Works](docs/guides/how-it-works.md)
page in our resources section.

## Getting Started

If you would like a step-by-step guide on how to use our protocol, check out the [Getting Started](docs/guides/get-started.md) page. We have code-snippets and live examples that you can try out today.

## Development / Testing

If you are interested in contributing to the BitEscrow protocol and mission for non-custodial escrow on Bitcoin, please check out our [Development](docs/guides/development.md) page.

## Questions / Issues

Feel free to post questions or comments on the issue board. All feedback is welcome.

## Contribution

Help wanted. All contributions are welcome!

## Resources

Nearly the entire code-base has been built from scratch, with only one hard third-party dependency and a couple soft dependencies.

**noble-curves**  

Best damn elliptic curve library. Lightweight, independently audited, optimized to hell and back. Works across all platforms. Even deals with the nightmare that is webcrypo. There is no second best. Credit to Paul Miller.

https://github.com/paulmillr/noble-curves  

**noble-hashes**  

Paul's hashing library is also great, and performs synchronous operations. Credit to Paul Miller.

https://github.com/paulmillr/noble-hashes  

**zod**  

The best run-time validation library, also the best API of any method library. Turns javascript into a some-what respectable language. The error output can be the stuff of nightmares though. Credit to Colin McDonnel.

https://github.com/colinhacks/zod  

**tapscript**  

My humble taproot library and grab-bag of bitcoin related tools. Currently using a development version that has yet-to-be released due to undocumented changes in the API. 

https://github.com/cmdruid/tapscript  

**musig2**  

Reference implementation of the Musig2 protocol with a few additional features. However I do not implement the death star optimization.

https://github.com/cmdruid/musig2  

**crypto-tools**  

Provides a suite of cryptography primitives and tools. Wraps the noble-curve and noble-hash libraries (and cross-checks them with other implementations).

https://github.com/cmdruid/crypto-tools  

**buff**  

The swiss-army-knife of byte manipulation. Such a fantastic and invaluable tool. Never leave home without it.

https://github.com/cmdruid/buff  

**core-cmd**  

Not a dependency, but I use this to run bitcoin core natively within my test suite. It wraps both `bitcoind` and `bitcoin-cli`, and provides a full sute of automation tools, including wallets, faucets, and more.

https://github.com/cmdruid/core-cmd  

**signer**  

Reference implementation of the new hybrid signing device / wallet we are building for BitEscrow. The documentation needs to be updated. WIP.

https://github.com/cmdruid/signer  

# Footnote

My inspiration for this project comes from the Bitcoin space, and the incredibly talented people that contribute their lives. I will be forever grateful for their knowledge, kindness and spirit.

I wish for Bitcoin to win all the marbles; and be the new global reserve marbles that we fight over. I firmly believe that a sound money system will make the world a more peaceful place, and with that, maybe humanity will finally reach beyond the moon.
