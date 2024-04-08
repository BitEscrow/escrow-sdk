#!/usr/bin/env bash

NETWORK="mutiny"
RUNPATH="demo/09_settle_contract.ts"

# Output the full path
echo "Executing demo script on $NETWORK network ..."

VERBOSE=true npm run load $RUNPATH $NETWORK
