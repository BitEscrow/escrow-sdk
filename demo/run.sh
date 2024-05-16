#!/usr/bin/env bash

echo $1

[ -n "$1" ] && NET="$1" || NET="mutiny"
RUNPATH="demo/09_settle_contract.ts"

# Output the full path
echo "Executing demo script on $NET network ..."

VERBOSE=true NETWORK=$NET npm run load $RUNPATH $NETWORK
