---
sidebar_position: 2
---

# Development

To get started, make sure you are running `v19+` of node, then install the project dependencies using your node manager of choice:

```sh
node --version  # should be v19+
npm install     # install dependencies
```

This project uses the following scripts:

```md
  build         : Compiles the contents of `src` folder to `dist`. 
  demo <chain>  : Runs the protocol demo for the provided chain.
  load <script> : Load and execute a `.ts` script at the provided path.
  release       : Builds and tests the current source for release.
  scratch       : Executes the `test/scratch.ts` file.
  test          : Runs the current test suite in `test/tape.ts`.
```

### Running the Demo

The main demo is located in the [/demo](https://github.com/BitEscrow/escrow-core/tree/master/demo) directory, and serves as a great resource for how to use the client library.

You can choose to run the protocol demo on the `mutiny`, `signet`, or `testnet` blockchain:

```bash
## Run the demo on the mutiny chain.
npm run demo mutiny
```

No wallet or software required. Simply follow the interactive prompts, and enjoy the protocol in action.

> The mutiny chain is the fastest of the three demos, with 30 second blocks.

> Testnet faucet is currently broke. You may need your own testnet coins.

### Running in Replit

There is a replit clone of this repo that you can run in the browser:

[https://replit.com/escrow-core](https://replit.com/@cscottdev/escrow-core)

Clicking `Run` at the top of the replit should run the demo.

Feel free to fork the replit and try out the developer tools!

### Using the Client API Demos

There is a suite of client API examples located in the [/demo/api](https://github.com/BitEscrow/escrow-core/tree/master/demo/api) directory.

Feel free to use `npm run load` to execute any of the example scripts:

```bash
npm run load demo/api/contract/read.ts
```

You can also specify a chain to use at the end of the command:

```bash
npm run load:signet demo/api/deposit/list.ts
```

If you run into any errors when using the demos, please consider filing an issue ticket!

### Using the CVM Evaluation Tool

The CVM [eval](https://github.com/BitEscrow/escrow-core/tree/master/demo/vm/eval.ts) tool allows you to quickly evaluate a set of proposal terms and witness statements using a dummy virtual machine.

The tool uses an easy to read [JSON file](https://github.com/BitEscrow/escrow-core/tree/master/demo/vm/vector.json) to load the data. This file can be re-written to demonstrate any contract scenario you wish.

```
npm run demo:vm
```

The tool and JSON file are located in the [/demo/vm](https://github.com/BitEscrow/escrow-core/tree/master/demo/vm) directory.

### Using the Test Suite

The test suite is located in [test/src](https://github.com/BitEscrow/escrow-core/tree/master/test/src), and controlled by the [test/tape.ts](https://github.com/BitEscrow/escrow-core/tree/master/test/tape.ts) file. Feel free to add/remove test packages from the main test method.

Some tests come with a verbose output, which you can enable with the `VERBOSE=true` flag.

Example of running the current test suite in verbose mode:

```bash
VERBOSE=true npm run test
```
