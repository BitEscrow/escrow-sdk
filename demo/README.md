# Protocol Demo

To view the demo, simply clone this repository, then run the following commands:

```sh
npm install           # Install all package dependencies.
npm run demo {chain}  # Run the demo using the selected chain.
```

> Note: The current chains available are `mutiny`, `signet`, and `testnet`. The default chain is `mutiny`.

The demo will execute step-by-step, and print the communication between client and server to the console. 

At certain points, the demo will pause and wait for transactions to confirm on the blockchain. Depending on the chain you select, this could take some time!

If you have any issues with the demo, please submit an issue ticket and let us know!

# CVM Evaluation Tool

The CVM evaluation tool is located in the `/demo/vm` directory.
