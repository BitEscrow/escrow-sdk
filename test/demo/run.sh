#!/usr/bin/env bash

# Array of demo paths
demo_paths=(
  "01_create_client.ts"
  "02_create_signer.ts"
  "03_build_proposal.ts"
  "04_roles_and_endorse.ts"
  "05_create_contract.ts"
  "06_request_account.ts"
  "07_deposit_funds.ts"
  "08_check_contract.ts"
  "09_settle_contract.ts"
)

DEFAULT_NET="mutiny"
DEFAULT_IDX=9

## Configure input arguments.
[ -n "$1" ] && NETWORK="$1"  || NETWORK="$DEFAULT_NET"
[ -n "$2" ] && SELECTED="$2" || SELECTED="$DEFAULT_IDX"

# User input
selection=$(($SELECTED - 1))

# Check if the selection is valid
if (( selection < 0 )) || (( selection >= ${#demo_paths[@]} )); then
  echo "Invalid selection: $selection" && exit 1
fi

# Construct the file path
filepath=${demo_paths[$selection]}
fullpath="test/demo/$filepath"

# Output the full path
echo "Executing demo script '$filepath' on $NETWORK network ..."

yarn load $fullpath $NETWORK
